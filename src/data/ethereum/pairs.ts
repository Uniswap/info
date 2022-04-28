import { TOKEN_OVERRIDES } from 'constants/tokens'
import dayjs from 'dayjs'
import { client } from 'service/client'
import {
  HOURLY_PAIR_RATES,
  PAIRS_BULK,
  PAIRS_CURRENT,
  PAIRS_HISTORICAL_BULK,
  PAIR_CHART,
  PAIR_DATA
} from 'service/queries/pairs'
import { Pair } from 'state/features/pairs/types'
import {
  getTimestampsForChanges,
  getBlocksFromTimestamps,
  get2DayPercentChange,
  getPercentChange,
  splitQuery
} from 'utils'

async function fetchPairData(pairAddress: string, block?: number) {
  return client.query({
    query: PAIR_DATA,
    variables: {
      pairAddress,
      block: block ? { number: block } : null
    },
    fetchPolicy: 'cache-first'
  })
}

export async function getPairList(price: number) {
  const {
    data: { pairs }
  } = await client.query({
    query: PAIRS_CURRENT,
    fetchPolicy: 'cache-first'
  })

  // format as array of addresses
  const formattedPairs = pairs.map((pair: Pair) => {
    return pair.id
  })

  // get data for every pair in list
  return getBulkPairData(formattedPairs, price)
}

export async function getBulkPairData(pairList: string[], price: number) {
  const [t1, t2, tWeek] = getTimestampsForChanges()
  const [{ number: b1 }, { number: b2 }, { number: bWeek }] = await getBlocksFromTimestamps([t1, t2, tWeek])

  const current = await client.query({
    query: PAIRS_BULK,
    variables: {
      allPairs: pairList
    },
    fetchPolicy: 'cache-first'
  })

  const [oneDayResult, twoDayResult, oneWeekResult] = await Promise.all(
    [b1, b2, bWeek].map(async block => {
      const result = await client.query({
        query: PAIRS_HISTORICAL_BULK,
        variables: {
          pairs: pairList,
          block: block ? { number: block } : null
        },
        fetchPolicy: 'cache-first'
      })
      return result
    })
  )

  const oneDayData = oneDayResult?.data?.pairs.reduce((obj: any, cur: { id: string }) => {
    return { ...obj, [cur.id]: cur }
  }, {})

  const twoDayData = twoDayResult?.data?.pairs.reduce((obj: any, cur: { id: string }) => {
    return { ...obj, [cur.id]: cur }
  }, {})

  const oneWeekData = oneWeekResult?.data?.pairs.reduce((obj: any, cur: { id: string }) => {
    return { ...obj, [cur.id]: cur }
  }, {})

  const pairData = await Promise.all(
    current &&
      current.data.pairs.map(async (pair: { id: string }) => {
        let data = pair
        let oneDayHistory = oneDayData?.[pair.id]
        if (!oneDayHistory) {
          const newData = await fetchPairData(pair.id, b1)
          oneDayHistory = newData.data.pairs[0]
        }
        let twoDayHistory = twoDayData?.[pair.id]
        if (!twoDayHistory) {
          const newData = await fetchPairData(pair.id, b2)
          twoDayHistory = newData.data.pairs[0]
        }
        let oneWeekHistory = oneWeekData?.[pair.id]
        if (!oneWeekHistory) {
          const newData = await fetchPairData(pair.id, bWeek)
          oneWeekHistory = newData.data.pairs[0]
        }
        data = parseData(data, oneDayHistory, twoDayHistory, oneWeekHistory, price, b1)
        return data
      })
  )
  return pairData
}

function parseData(data: any, oneDayData: any, twoDayData: any, oneWeekData: any, price: number, oneDayBlock: number) {
  // get volume changes
  const [oneDayVolumeUSD, volumeChangeUSD] = get2DayPercentChange(
    data?.volumeUSD,
    oneDayData?.volumeUSD ? oneDayData.volumeUSD : 0,
    twoDayData?.volumeUSD ? twoDayData.volumeUSD : 0
  )
  const [oneDayVolumeUntracked, volumeChangeUntracked] = get2DayPercentChange(
    data?.untrackedVolumeUSD,
    oneDayData?.untrackedVolumeUSD ? parseFloat(oneDayData?.untrackedVolumeUSD) : 0,
    twoDayData?.untrackedVolumeUSD ? twoDayData?.untrackedVolumeUSD : 0
  )
  const oneWeekVolumeUSD = parseFloat(oneWeekData ? data?.volumeUSD - oneWeekData?.volumeUSD : data.volumeUSD)
  const parsedData = { ...data }
  // set volume properties
  parsedData.oneDayVolumeUSD = oneDayVolumeUSD
  parsedData.oneWeekVolumeUSD = oneWeekVolumeUSD
  parsedData.volumeChangeUSD = volumeChangeUSD
  parsedData.oneDayVolumeUntracked = oneDayVolumeUntracked
  parsedData.volumeChangeUntracked = volumeChangeUntracked
  parsedData.token0 = {
    ...parsedData.token0,
    name: TOKEN_OVERRIDES[data.token0.id]?.name ?? parsedData.token0.name,
    symbol: TOKEN_OVERRIDES[data.token0.id]?.symbol ?? parsedData.token0.symbol
  }
  parsedData.token1 = {
    ...parsedData.token1,
    name: TOKEN_OVERRIDES[data.token1.id]?.name ?? parsedData.token1.name,
    symbol: TOKEN_OVERRIDES[data.token1.id]?.symbol ?? parsedData.token1.symbol
  }
  // set liquidity properties
  // TODO: trackedReserveETH
  parsedData.trackedReserveUSD = data.trackedReserveETH * price
  parsedData.liquidityChangeUSD = getPercentChange(data.reserveUSD, oneDayData?.reserveUSD)

  // format if pair hasnt existed for a day or a week
  if (!oneDayData && data && data.createdAtBlockNumber > oneDayBlock) {
    parsedData.oneDayVolumeUSD = parseFloat(data.volumeUSD)
  }
  if (!oneDayData && data) {
    parsedData.oneDayVolumeUSD = parseFloat(data.volumeUSD)
  }
  if (!oneWeekData && data) {
    parsedData.oneWeekVolumeUSD = parseFloat(data.volumeUSD)
  }

  return parsedData
}

export const getPairChartData = async (pairAddress: string) => {
  let data: any = []
  const utcEndTime = dayjs.utc()
  const utcStartTime = utcEndTime.subtract(1, 'year').startOf('minute')
  const startTime = utcStartTime.unix() - 1

  try {
    let allFound = false
    let skip = 0
    while (!allFound) {
      const result = await client.query({
        query: PAIR_CHART,
        variables: {
          pairAddress,
          skip
        },
        fetchPolicy: 'cache-first'
      })
      skip += 1000
      data = data.concat(result.data.pairDayDatas)
      if (result.data.pairDayDatas.length < 1000) {
        allFound = true
      }
    }

    const dayIndexSet = new Set()
    const dayIndexArray: any = []
    const oneDay = 24 * 60 * 60
    data.forEach((dayData: any, i: number) => {
      // add the day index to the set of days
      dayIndexSet.add((data[i].date / oneDay).toFixed(0))
      dayIndexArray.push(data[i])
      dayData.dailyVolumeUSD = parseFloat(dayData.dailyVolumeUSD)
      dayData.reserveUSD = parseFloat(dayData.reserveUSD)
    })

    if (data[0]) {
      // fill in empty days
      let timestamp = data[0].date ? data[0].date : startTime
      let latestLiquidityUSD = data[0].reserveUSD
      let index = 1
      while (timestamp < utcEndTime.unix() - oneDay) {
        const nextDay = timestamp + oneDay
        const currentDayIndex = (nextDay / oneDay).toFixed(0)
        if (!dayIndexSet.has(currentDayIndex)) {
          data.push({
            date: nextDay,
            dayString: nextDay,
            dailyVolumeUSD: 0,
            reserveUSD: latestLiquidityUSD
          })
        } else {
          latestLiquidityUSD = dayIndexArray[index].reserveUSD
          index = index + 1
        }
        timestamp = nextDay
      }
    }

    data = data.sort((a: any, b: any) => (parseInt(a.date) > parseInt(b.date) ? 1 : -1))
  } catch (e) {
    console.log(e)
  }

  return data
}

export const getHourlyRateData = async (pairAddress: string, startTime: number, latestBlock: number) => {
  try {
    const utcEndTime = dayjs.utc()
    let time = startTime

    // create an array of hour start times until we reach current hour
    const timestamps = []
    while (time <= utcEndTime.unix() - 3600) {
      timestamps.push(time)
      time += 3600
    }

    // backout if invalid timestamp format
    if (timestamps.length === 0) {
      return []
    }

    // once you have all the timestamps, get the blocks for each timestamp in a bulk query
    let blocks

    blocks = await getBlocksFromTimestamps(timestamps, 100)

    // catch failing case
    if (!blocks || blocks?.length === 0) {
      return []
    }

    if (latestBlock) {
      blocks = blocks.filter(b => {
        return b.number <= latestBlock
      })
    }

    // TODO: refactor
    const result: any = await splitQuery(
      (params: BlockHeight[]) =>
        client.query({
          query: HOURLY_PAIR_RATES(pairAddress, params),
          fetchPolicy: 'cache-first'
        }),
      blocks
    )

    // format token ETH price results
    const values = []
    for (const row in result) {
      const timestamp = row.split('t')[1]
      if (timestamp) {
        values.push({
          timestamp,
          rate0: parseFloat(result[row]?.token0Price),
          rate1: parseFloat(result[row]?.token1Price)
        })
      }
    }

    const formattedHistoryRate0 = []
    const formattedHistoryRate1 = []

    // for each hour, construct the open and close price
    for (let i = 0; i < values.length - 1; i++) {
      formattedHistoryRate0.push({
        timestamp: values[i].timestamp,
        open: values[i].rate0,
        close: values[i + 1].rate0
      })
      formattedHistoryRate1.push({
        timestamp: values[i].timestamp,
        open: values[i].rate1,
        close: values[i + 1].rate1
      })
    }

    return [formattedHistoryRate0, formattedHistoryRate1]
  } catch (e) {
    console.log(e)
    return [[], []]
  }
}
