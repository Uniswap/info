import { TOKEN_OVERRIDES } from 'constants/tokens'
import dayjs from 'dayjs'
import { client } from 'service/client'
import { PRICES_BY_BLOCK } from 'service/queries/global'
import { GET_TOKENS, TOKEN_CHART, TOKEN_DATA } from 'service/queries/tokens'
import { Token, TokenDayData } from 'state/features/token/types'
import {
  getBlockFromTimestamp,
  get2DayPercentChange,
  getPercentChange,
  getBlocksFromTimestamps,
  splitQuery
} from 'utils'

async function fetchTokens(block?: number) {
  return client.query({
    query: GET_TOKENS,
    variables: {
      block: block ? { number: block } : null
    },
    fetchPolicy: 'cache-first'
  })
}

async function fetchTokenData(tokenAddress: string, block?: number) {
  return client.query({
    query: TOKEN_DATA,
    variables: {
      tokenAddress,
      block: block ? { number: block } : null
    },
    fetchPolicy: 'cache-first'
  })
}

export const getTopTokens = async (price: number, priceOld: number): Promise<Token[]> => {
  const utcCurrentTime = dayjs()
  const utcOneDayBack = utcCurrentTime.subtract(1, 'day').unix()
  const utcTwoDaysBack = utcCurrentTime.subtract(2, 'day').unix()
  const oneDayBlock = await getBlockFromTimestamp(utcOneDayBack)
  const twoDayBlock = await getBlockFromTimestamp(utcTwoDaysBack)

  try {
    const current = await fetchTokens()
    const oneDayResult = await fetchTokens(oneDayBlock)
    const twoDayResult = await fetchTokens(twoDayBlock)

    const oneDayData = oneDayResult?.data?.tokens.reduce((obj: Record<string, Token>, cur: Token) => {
      return { ...obj, [cur.id]: cur }
    }, {})

    const twoDayData = twoDayResult?.data?.tokens.reduce((obj: Record<string, Token>, cur: Token) => {
      return { ...obj, [cur.id]: cur }
    }, {})

    const bulkResults = await Promise.all(
      current &&
        oneDayData &&
        twoDayData &&
        current?.data?.tokens.map(async (token: Token) => {
          const data = { ...token }

          // let liquidityDataThisToken = liquidityData?.[token.id]
          let oneDayHistory = oneDayData?.[token.id]
          let twoDayHistory = twoDayData?.[token.id]

          // catch the case where token wasnt in top list in previous days
          if (!oneDayHistory) {
            const oneDayResult = await fetchTokenData(token.id, oneDayBlock)
            oneDayHistory = oneDayResult.data.tokens[0]
          }
          if (!twoDayHistory) {
            const twoDayResult = await fetchTokenData(token.id, twoDayBlock)
            twoDayHistory = twoDayResult.data.tokens[0]
          }

          // calculate percentage changes and daily changes
          const [oneDayVolumeUSD, volumeChangeUSD] = get2DayPercentChange(
            data.tradeVolumeUSD,
            oneDayHistory?.tradeVolumeUSD ?? 0,
            twoDayHistory?.tradeVolumeUSD ?? 0
          )
          const [oneDayTxns, txnChange] = get2DayPercentChange(
            data.txCount,
            oneDayHistory?.txCount ?? 0,
            twoDayHistory?.txCount ?? 0
          )

          const currentLiquidityUSD = +data?.totalLiquidity * price * +data?.derivedETH
          const oldLiquidityUSD = oneDayHistory?.totalLiquidity * priceOld * oneDayHistory?.derivedETH

          // percent changes
          const priceChangeUSD = getPercentChange(
            +data?.derivedETH * price,
            oneDayHistory?.derivedETH ? oneDayHistory?.derivedETH * priceOld : 0
          )

          // set data
          data.priceUSD = +data?.derivedETH * price
          data.totalLiquidityUSD = currentLiquidityUSD
          data.oneDayVolumeUSD = oneDayVolumeUSD
          data.volumeChangeUSD = volumeChangeUSD
          data.priceChangeUSD = priceChangeUSD
          data.liquidityChangeUSD = getPercentChange(currentLiquidityUSD ?? 0, oldLiquidityUSD ?? 0)
          data.oneDayTxns = oneDayTxns
          data.txnChange = txnChange
          data.name = TOKEN_OVERRIDES[data.id]?.name ?? data.name
          data.symbol = TOKEN_OVERRIDES[data.id]?.symbol ?? data.symbol

          // new tokens
          if (!oneDayHistory && data) {
            data.oneDayVolumeUSD = +data.tradeVolumeUSD
            data.oneDayVolumeETH = +data.tradeVolume * +data.derivedETH
            data.oneDayTxns = +data.txCount
          }

          return data
        })
    )

    return bulkResults
  } catch (e) {
    return []
  }
}

export const getTokenData = async (address: string, price: number, priceOld: number): Promise<Token | undefined> => {
  const utcCurrentTime = dayjs()
  const utcOneDayBack = utcCurrentTime.subtract(1, 'day').startOf('minute').unix()
  const utcTwoDaysBack = utcCurrentTime.subtract(2, 'day').startOf('minute').unix()
  const oneDayBlock = await getBlockFromTimestamp(utcOneDayBack)
  const twoDayBlock = await getBlockFromTimestamp(utcTwoDaysBack)

  // initialize data arrays
  let data: Token | undefined
  let oneDayData: Token | undefined
  let twoDayData: Token | undefined

  try {
    // fetch all current and historical data
    const result = await fetchTokenData(address)
    data = { ...result?.data?.tokens?.[0] }
    if (data) {
      // get results from 24 hours in past
      const oneDayResult = await fetchTokenData(address, oneDayBlock)
      oneDayData = { ...oneDayResult.data.tokens[0] }

      // get results from 48 hours in past
      const twoDayResult = await fetchTokenData(address, twoDayBlock)
      twoDayData = { ...twoDayResult.data.tokens[0] }

      // FIXME: WTF????
      // catch the case where token wasnt in top list in previous days
      if (!oneDayData) {
        const oneDayResult = await fetchTokenData(address, oneDayBlock)
        oneDayData = oneDayResult.data.tokens[0]
      }
      if (!twoDayData) {
        const twoDayResult = await fetchTokenData(address, twoDayBlock)
        twoDayData = twoDayResult.data.tokens[0]
      }

      // calculate percentage changes and daily changes
      const [oneDayVolumeUSD, volumeChangeUSD] = get2DayPercentChange(
        data.tradeVolumeUSD,
        oneDayData?.tradeVolumeUSD ?? 0,
        twoDayData?.tradeVolumeUSD ?? 0
      )

      // calculate percentage changes and daily changes
      const [oneDayVolumeUT, volumeChangeUT] = get2DayPercentChange(
        data.untrackedVolumeUSD,
        oneDayData?.untrackedVolumeUSD ?? 0,
        twoDayData?.untrackedVolumeUSD ?? 0
      )

      // calculate percentage changes and daily changes
      const [oneDayTxns, txnChange] = get2DayPercentChange(
        data.txCount,
        oneDayData?.txCount ?? 0,
        twoDayData?.txCount ?? 0
      )

      const priceChangeUSD = getPercentChange(
        +data.derivedETH * price,
        parseFloat(oneDayData?.derivedETH ?? '0') * priceOld
      )

      const currentLiquidityUSD = +data.totalLiquidity * price * +data.derivedETH
      const oldLiquidityUSD =
        parseFloat(oneDayData?.totalLiquidity ?? '0') * priceOld * parseFloat(oneDayData?.derivedETH ?? '0')
      const liquidityChangeUSD = getPercentChange(currentLiquidityUSD ?? 0, oldLiquidityUSD ?? 0)

      // set data
      data.priceUSD = +data.derivedETH * price
      data.totalLiquidityUSD = currentLiquidityUSD
      data.oneDayVolumeUSD = oneDayVolumeUSD
      data.volumeChangeUSD = volumeChangeUSD
      data.priceChangeUSD = priceChangeUSD
      data.oneDayVolumeUT = oneDayVolumeUT
      data.volumeChangeUT = volumeChangeUT
      data.liquidityChangeUSD = liquidityChangeUSD
      data.oneDayTxns = oneDayTxns
      data.txnChange = txnChange
      data.name = TOKEN_OVERRIDES[data.id]?.name ?? data.name
      data.symbol = TOKEN_OVERRIDES[data.id]?.symbol ?? data.symbol

      // new tokens
      if (!oneDayData && data) {
        data.oneDayVolumeUSD = +data.tradeVolumeUSD
        data.oneDayVolumeETH = +data.tradeVolume * +data.derivedETH
        data.oneDayTxns = +data.txCount
      }
    }
  } catch (e) {
    console.log(e)
  }
  return data
}

export const getTokenPairs = async (tokenAddress: string) => {
  try {
    // fetch all current and historical data
    const result = await fetchTokenData(tokenAddress)
    return result.data?.['pairs0'].concat(result.data?.['pairs1']).map((p: { id: string }) => p.id)
  } catch (e) {
    console.log(e)
  }
}

export const getIntervalTokenData = async (
  tokenAddress: string,
  startTime: number,
  interval = 3600,
  latestBlock: number
): Promise<TimeWindowItem[]> => {
  const utcEndTime = dayjs.utc()
  let time = startTime

  // create an array of hour start times until we reach current hour
  // buffer by half hour to catch case where graph isnt synced to latest block
  const timestamps = []
  while (time < utcEndTime.unix()) {
    timestamps.push(time)
    time += interval
  }

  // backout if invalid timestamp format
  if (timestamps.length === 0) {
    return []
  }

  // once you have all the timestamps, get the blocks for each timestamp in a bulk query
  let blocks
  try {
    blocks = await getBlocksFromTimestamps(timestamps, 100)

    // catch failing case
    if (!blocks || blocks.length === 0) {
      return []
    }

    if (latestBlock) {
      blocks = blocks.filter(b => b.number <= latestBlock)
    }

    // FIXME: refactor splitQuery
    const result: any = await splitQuery(
      (params: BlockHeight[]) =>
        client.query({
          query: PRICES_BY_BLOCK(tokenAddress, params),
          fetchPolicy: 'cache-first'
        }),
      blocks,
      50
    )
    // format token ETH price results
    const values: { timestamp: string; derivedETH: number; priceUSD?: number }[] = []
    for (const row in result) {
      const timestamp = row.split('t')[1]
      const derivedETH = parseFloat(result[row]?.derivedETH)
      if (timestamp) {
        values.push({
          timestamp,
          derivedETH
        })
      }
    }

    // go through eth usd prices and assign to original values array
    let index = 0
    for (const brow in result) {
      const timestamp = brow.split('b')[1]
      if (timestamp) {
        if (result[brow]) {
          values[index].priceUSD = result[brow].ethPrice * values[index].derivedETH
        }
        index += 1
      }
    }

    const formattedHistory: TimeWindowItem[] = []

    // for each hour, construct the open and close price
    for (let i = 0; i < values.length - 1; i++) {
      formattedHistory.push({
        timestamp: values[i].timestamp,
        open: values[i].priceUSD!,
        close: values[i + 1].priceUSD!
      })
    }

    return formattedHistory
  } catch (e) {
    console.log(e)
    console.log('error fetching blocks')
    return []
  }
}

export const getTokenChartData = async (tokenAddress: string): Promise<TokenDayData[]> => {
  let data: TokenDayData[] = []
  const utcEndTime = dayjs.utc()
  const utcStartTime = utcEndTime.subtract(1, 'year')
  const startTime = utcStartTime.startOf('minute').unix() - 1

  try {
    let allFound = false
    let skip = 0
    while (!allFound) {
      const result = await client.query({
        query: TOKEN_CHART,
        variables: {
          tokenAddr: tokenAddress,
          skip
        },
        fetchPolicy: 'cache-first'
      })
      if (result.data.tokenDayDatas.length < 1000) {
        allFound = true
      }
      skip += 1000
      data = data.concat(result.data.tokenDayDatas)
    }

    const dayIndexSet = new Set()
    const dayIndexArray: TokenDayData[] = []
    const oneDay = 24 * 60 * 60
    data.forEach((dayData, i) => {
      // add the day index to the set of days
      dayIndexSet.add((data[i].date / oneDay).toFixed(0))
      dayIndexArray.push(data[i])
      dayData.dailyVolumeUSD = +dayData.dailyVolumeUSD
    })

    // fill in empty days
    let timestamp = data[0] && data[0].date ? data[0].date : startTime
    let latestLiquidityUSD = data[0] && data[0].totalLiquidityUSD
    let latestPriceUSD = data[0] && data[0].priceUSD
    let index = 1
    while (timestamp < utcEndTime.startOf('minute').unix() - oneDay) {
      const nextDay = timestamp + oneDay
      const currentDayIndex = (nextDay / oneDay).toFixed(0)
      if (!dayIndexSet.has(currentDayIndex)) {
        data.push({
          date: nextDay,
          dayString: nextDay,
          dailyVolumeUSD: 0,
          priceUSD: latestPriceUSD,
          totalLiquidityUSD: latestLiquidityUSD
        })
      } else {
        latestLiquidityUSD = dayIndexArray[index].totalLiquidityUSD
        latestPriceUSD = dayIndexArray[index].priceUSD
        index = index + 1
      }
      timestamp = nextDay
    }
    data = data.sort((a, b) => (a.date > b.date ? 1 : -1))
  } catch (e) {
    console.error(e)
  }

  return data
}
