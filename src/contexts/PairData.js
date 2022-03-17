import React, { createContext, useContext, useReducer, useMemo, useCallback, useEffect, useState } from 'react'
import merge from 'deepmerge'

import { getWETH_ADDRESS } from '../constants'
import {
  PAIR_DATA,
  PAIR_CHART,
  PAIR_POOLS_DATA,
  FILTERED_TRANSACTIONS,
  PAIRS_CURRENT,
  PAIRS_BULK,
  PAIRS_HISTORICAL_BULK,
  HOURLY_PAIR_RATES,
} from '../apollo/queries'

import { useEthPrice } from './GlobalData'

import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'

import {
  getPercentChange,
  get2DayPercentChange,
  isAddress,
  getBlocksFromTimestamps,
  getTimestampsForChanges,
  splitQuery,
  overwriteArrayMerge,
  memoRequest,
} from '../utils'

import { timeframeOptions } from '../constants'
import { useExchangeClient, useLatestBlocks } from './Application'
import { getBulkPoolData } from './PoolData'
import { getNativeTokenSymbol, getNativeTokenWrappedName } from '../utils'
import { useNetworksInfo } from './NetworkInfo'

const UPDATE = 'UPDATE'
const UPDATE_PAIR_POOLS = 'UPDATE_PAIR_POOLS'
const UPDATE_PAIR_TXNS = 'UPDATE_PAIR_TXNS'
const UPDATE_CHART_DATA = 'UPDATE_CHART_DATA'
const UPDATE_TOP_PAIRS = 'UPDATE_TOP_PAIRS'
const UPDATE_HOURLY_DATA = 'UPDATE_HOURLY_DATA'

dayjs.extend(utc)

export function safeAccess(object, path) {
  return object
    ? path.reduce(
        (accumulator, currentValue) => (accumulator && accumulator[currentValue] ? accumulator[currentValue] : null),
        object
      )
    : null
}

const PairDataContext = createContext()

function usePairDataContext() {
  return useContext(PairDataContext)
}

function reducer(state, { type, payload }) {
  switch (type) {
    case UPDATE: {
      const { pairAddress, data, chainId } = payload
      if (!data) return merge(state, { [chainId]: { [pairAddress]: { name: 'error-pair' } } })
      return merge(state, { [chainId]: { [pairAddress]: data } })
    }

    case UPDATE_TOP_PAIRS: {
      const { topPairs, chainId } = payload
      let added = {}
      topPairs && topPairs.forEach(pair => (added[pair.id] = pair))
      return merge(state, { [chainId]: added })
    }

    case UPDATE_PAIR_POOLS: {
      const { address, pools, chainId } = payload
      return merge(state, { [chainId]: { [address]: { pools } } }, { arrayMerge: overwriteArrayMerge })
    }

    case UPDATE_PAIR_TXNS: {
      const { address, transactions, chainId } = payload
      return merge(state, { [chainId]: { [address]: { txns: transactions } } }, { arrayMerge: overwriteArrayMerge })
    }

    case UPDATE_CHART_DATA: {
      const { address, chartData, chainId } = payload
      return merge(state, { [chainId]: { [address]: { chartData } } }, { arrayMerge: overwriteArrayMerge })
    }

    case UPDATE_HOURLY_DATA: {
      const { address, hourlyData, timeWindow, chainId } = payload
      return merge(
        state,
        { [chainId]: { [address]: { hourlyData: { [timeWindow]: hourlyData } } } },
        { arrayMerge: overwriteArrayMerge }
      )
    }

    default: {
      throw Error(`Unexpected action type in DataContext reducer: '${type}'.`)
    }
  }
}

export default function Provider({ children }) {
  const [state, dispatch] = useReducer(reducer, {})

  // update pair specific data
  const update = useCallback((pairAddress, data, chainId) => {
    dispatch({
      type: UPDATE,
      payload: {
        pairAddress,
        data,
        chainId,
      },
    })
  }, [])

  const updateTopPairs = useCallback((topPairs, chainId) => {
    dispatch({
      type: UPDATE_TOP_PAIRS,
      payload: {
        topPairs,
        chainId,
      },
    })
  }, [])

  const updatePairPools = useCallback((address, pools, chainId) => {
    dispatch({
      type: UPDATE_PAIR_POOLS,
      payload: { address, pools, chainId },
    })
  }, [])

  const updatePairTxns = useCallback((address, transactions, chainId) => {
    dispatch({
      type: UPDATE_PAIR_TXNS,
      payload: { address, transactions, chainId },
    })
  }, [])

  const updateChartData = useCallback((address, chartData, chainId) => {
    dispatch({
      type: UPDATE_CHART_DATA,
      payload: { address, chartData, chainId },
    })
  }, [])

  const updateHourlyData = useCallback((address, hourlyData, timeWindow, chainId) => {
    dispatch({
      type: UPDATE_HOURLY_DATA,
      payload: { address, hourlyData, timeWindow, chainId },
    })
  }, [])

  return (
    <PairDataContext.Provider
      value={useMemo(
        () => [
          state,
          {
            update,
            updatePairPools,
            updatePairTxns,
            updateChartData,
            updateTopPairs,
            updateHourlyData,
          },
        ],
        [state, update, updatePairTxns, updateChartData, updateTopPairs, updateHourlyData, updatePairPools]
      )}
    >
      {children}
    </PairDataContext.Provider>
  )
}

async function getBulkPairData(client, pairList, ethPrice, networksInfo) {
  const [t1, t2, tWeek] = getTimestampsForChanges()
  let [{ number: b1 }, { number: b2 }, { number: bWeek }] = await getBlocksFromTimestamps([t1, t2, tWeek], networksInfo)
  try {
    let current = await client.query({
      query: PAIRS_BULK,
      variables: {
        allPairs: pairList,
      },
      fetchPolicy: 'cache-first',
    })

    let [oneDayResult, twoDayResult, oneWeekResult] = await Promise.all(
      [b1, b2, bWeek].map(async block => {
        let result = client.query({
          query: PAIRS_HISTORICAL_BULK(block, pairList),
          fetchPolicy: 'cache-first',
        })
        return result
      })
    )

    let oneDayData = oneDayResult?.data?.pairs.reduce((obj, cur, i) => {
      return { ...obj, [cur.id]: cur }
    }, {})

    let twoDayData = twoDayResult?.data?.pairs.reduce((obj, cur, i) => {
      return { ...obj, [cur.id]: cur }
    }, {})

    let oneWeekData = oneWeekResult?.data?.pairs.reduce((obj, cur, i) => {
      return { ...obj, [cur.id]: cur }
    }, {})

    let pairData = await Promise.all(
      current &&
        current.data.pairs.map(async pair => {
          let data = pair
          let oneDayHistory = oneDayData?.[pair.id]
          if (!oneDayHistory) {
            let newData = await client.query({
              query: PAIR_DATA(pair.id, b1),
              fetchPolicy: 'cache-first',
            })
            oneDayHistory = newData.data.pairs[0]
          }
          let twoDayHistory = twoDayData?.[pair.id]
          if (!twoDayHistory) {
            let newData = await client.query({
              query: PAIR_DATA(pair.id, b2),
              fetchPolicy: 'cache-first',
            })
            twoDayHistory = newData.data.pairs[0]
          }
          let oneWeekHistory = oneWeekData?.[pair.id]
          if (!oneWeekHistory) {
            let newData = await client.query({
              query: PAIR_DATA(pair.id, bWeek),
              fetchPolicy: 'cache-first',
            })
            oneWeekHistory = newData.data.pairs[0]
          }
          data = parseData(data, oneDayHistory, twoDayHistory, oneWeekHistory, ethPrice, b1, networksInfo)
          return data
        })
    )

    return pairData
  } catch (e) {
    console.log(e)
  }
}

function parseData(data, oneDayData, twoDayData, oneWeekData, ethPrice, oneDayBlock, networksInfo) {
  // get volume changes
  const [oneDayVolumeUSD, volumeChangeUSD] = get2DayPercentChange(
    data?.volumeUSD,
    oneDayData?.volumeUSD ? oneDayData.volumeUSD : 0,
    twoDayData?.volumeUSD ? twoDayData.volumeUSD : 0
  )

  const [oneDayFeeUSD] = get2DayPercentChange(
    data?.feeUSD,
    oneDayData?.feeUSD ? oneDayData.feeUSD : 0,
    twoDayData?.feeUSD ? twoDayData.feeUSD : 0
  )
  const [oneDayVolumeUntracked, volumeChangeUntracked] = get2DayPercentChange(
    data?.untrackedVolumeUSD,
    oneDayData?.untrackedVolumeUSD ? parseFloat(oneDayData?.untrackedVolumeUSD) : 0,
    twoDayData?.untrackedVolumeUSD ? twoDayData?.untrackedVolumeUSD : 0
  )
  const [oneDayFeeUntracked] = get2DayPercentChange(
    data?.untrackedFeeUSD,
    oneDayData?.untrackedFeeUSD ? parseFloat(oneDayData?.untrackedFeeUSD) : 0,
    twoDayData?.untrackedFeeUSD ? twoDayData?.untrackedFeeUSD : 0
  )
  const oneWeekVolumeUSD = parseFloat(oneWeekData ? data?.volumeUSD - oneWeekData?.volumeUSD : data.volumeUSD)

  const oneWeekVolumeUntracked = parseFloat(
    oneWeekData ? data?.untrackedVolumeUSD - oneWeekData?.untrackedVolumeUSD : data.untrackedVolumeUSD
  )

  // set volume properties
  data.oneDayVolumeUSD = parseFloat(oneDayVolumeUSD)
  data.oneWeekVolumeUSD = oneWeekVolumeUSD
  data.oneDayFeeUSD = oneDayFeeUSD
  data.oneDayFeeUntracked = oneDayFeeUntracked
  data.volumeChangeUSD = volumeChangeUSD
  data.oneDayVolumeUntracked = oneDayVolumeUntracked
  data.oneWeekVolumeUntracked = oneWeekVolumeUntracked
  data.volumeChangeUntracked = volumeChangeUntracked

  // set liquiditry properties
  data.trackedReserveUSD = data.trackedReserveETH * ethPrice
  data.liquidityChangeUSD = getPercentChange(data.reserveUSD, oneDayData?.reserveUSD)

  // format if pair hasnt existed for a day or a week
  if (!oneDayData && data && data.createdAtBlockNumber > oneDayBlock) {
    data.oneDayVolumeUSD = parseFloat(data.volumeUSD)
  }
  if (!oneDayData && data) {
    data.oneDayVolumeUSD = parseFloat(data.volumeUSD)
  }
  if (!oneWeekData && data) {
    data.oneWeekVolumeUSD = parseFloat(data.volumeUSD)
  }
  if (data?.token0?.id === getWETH_ADDRESS(networksInfo)) {
    data.token0.name = getNativeTokenWrappedName(networksInfo)
    data.token0.symbol = getNativeTokenSymbol(networksInfo)
  }
  if (data?.token1?.id === getWETH_ADDRESS(networksInfo)) {
    data.token1.name = getNativeTokenWrappedName(networksInfo)
    data.token1.symbol = getNativeTokenSymbol(networksInfo)
  }

  return data
}

const getPairPools = async (client, pairAddress) => {
  let pools = {}

  try {
    let result = await client.query({
      query: PAIR_POOLS_DATA(pairAddress),
      fetchPolicy: 'no-cache',
    })
    pools = result.data.pools
  } catch (e) {
    console.log(e)
  }

  return pools
}

const getPairTransactions = async (client, pairAddress) => {
  const transactions = {}

  try {
    let result = await client.query({
      query: FILTERED_TRANSACTIONS,
      variables: {
        allPairs: [pairAddress],
      },
      fetchPolicy: 'no-cache',
    })
    transactions.mints = result.data.mints
    transactions.burns = result.data.burns
    transactions.swaps = result.data.swaps
  } catch (e) {
    console.log(e)
  }

  return transactions
}

const getPairChartData = async (client, pairAddress) => {
  let data = []
  const utcEndTime = dayjs.utc()
  let utcStartTime = utcEndTime.subtract(1, 'year').startOf('minute')
  let startTime = utcStartTime.unix() - 1

  try {
    let allFound = false
    let skip = 0
    while (!allFound) {
      let result = await client.query({
        query: PAIR_CHART,
        variables: {
          pairAddress: pairAddress,
          skip,
        },
        fetchPolicy: 'cache-first',
      })
      skip += 1000
      data = data.concat(result.data.pairDayDatas)
      if (result.data.pairDayDatas.length < 1000) {
        allFound = true
      }
    }

    let dayIndexSet = new Set()
    let dayIndexArray = []
    const oneDay = 24 * 60 * 60
    data.forEach((dayData, i) => {
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
        let currentDayIndex = (nextDay / oneDay).toFixed(0)
        if (!dayIndexSet.has(currentDayIndex)) {
          data.push({
            date: nextDay,
            dayString: nextDay,
            dailyVolumeUSD: 0,
            reserveUSD: latestLiquidityUSD,
          })
        } else {
          latestLiquidityUSD = dayIndexArray[index].reserveUSD
          index = index + 1
        }
        timestamp = nextDay
      }
    }

    data = data.sort((a, b) => (parseInt(a.date) > parseInt(b.date) ? 1 : -1))
  } catch (e) {
    console.log(e)
  }

  return data
}

const getRateData = async (client, pairAddress, startTime, latestBlock, frequency = 300) => {
  const run = async () => {
    try {
      const utcEndTime = dayjs.utc()
      let time = startTime

      // create an array of hour start times until we reach current hour
      const timestamps = []
      while (time <= utcEndTime.unix() - frequency) {
        timestamps.push(time)
        time += frequency
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
          return parseFloat(b.number) <= parseFloat(latestBlock)
        })
      }

      const result = await splitQuery(HOURLY_PAIR_RATES, client, [pairAddress], blocks, 100)

      // format token ETH price results
      let values = []
      for (var row in result) {
        let timestamp = row.split('t')[1]
        if (timestamp) {
          values.push({
            timestamp,
            rate0: parseFloat(result[row]?.token0Price),
            rate1: parseFloat(result[row]?.token1Price),
          })
        }
      }

      let formattedHistoryRate0 = []
      let formattedHistoryRate1 = []

      // for each hour, construct the open and close price
      for (let i = 0; i < values.length - 1; i++) {
        formattedHistoryRate0.push({
          timestamp: values[i].timestamp,
          open: parseFloat(values[i].rate0),
          close: parseFloat(values[i + 1].rate0),
        })
        formattedHistoryRate1.push({
          timestamp: values[i].timestamp,
          open: parseFloat(values[i].rate1),
          close: parseFloat(values[i + 1].rate1),
        })
      }

      return [formattedHistoryRate0, formattedHistoryRate1]
    } catch (e) {
      console.log(e)
      return [[], []]
    }
  }
  return await memoRequest(run, JSON.stringify({ pairAddress, startTime, latestBlock, frequency }))
}

// let cacheGetRateData = {}
// const getRateData2 = async (client, pairAddress, startTime, latestBlock, networksInfo, frequency = 300) => {
//   if (cacheGetRateData?.[networksInfo.CHAIN_ID]?.[pairAddress + startTime + latestBlock + frequency])
//     return await cacheGetRateData[networksInfo.CHAIN_ID][pairAddress + startTime + latestBlock + frequency]
//   if (!cacheGetRateData?.[networksInfo.CHAIN_ID]) cacheGetRateData[networksInfo.CHAIN_ID] = {}
//   let promise = new Promise(async (resolve, reject) => {
//     try {
//       const utcEndTime = dayjs.utc()
//       let time = startTime

//       // create an array of hour start times until we reach current hour
//       const timestamps = []
//       while (time <= utcEndTime.unix() - frequency) {
//         timestamps.push(time)
//         time += frequency
//       }

//       // backout if invalid timestamp format
//       if (timestamps.length === 0) {
//         resolve([])
//       }

//       // once you have all the timestamps, get the blocks for each timestamp in a bulk query
//       let blocks

//       blocks = await getBlocksFromTimestamps(timestamps, networksInfo, 100)

//       // catch failing case
//       if (!blocks || blocks?.length === 0) {
//         resolve([])
//       }

//       if (latestBlock) {
//         blocks = blocks.filter(b => {
//           return parseFloat(b.number) <= parseFloat(latestBlock)
//         })
//       }

//       const result = await splitQuery(HOURLY_PAIR_RATES, client, [pairAddress], blocks, 100)

//       // format token ETH price results
//       let values = []
//       for (var row in result) {
//         let timestamp = row.split('t')[1]
//         if (timestamp) {
//           values.push({
//             timestamp,
//             rate0: parseFloat(result[row]?.token0Price),
//             rate1: parseFloat(result[row]?.token1Price),
//           })
//         }
//       }

//       let formattedHistoryRate0 = []
//       let formattedHistoryRate1 = []

//       // for each hour, construct the open and close price
//       for (let i = 0; i < values.length - 1; i++) {
//         formattedHistoryRate0.push({
//           timestamp: values[i].timestamp,
//           open: parseFloat(values[i].rate0),
//           close: parseFloat(values[i + 1].rate0),
//         })
//         formattedHistoryRate1.push({
//           timestamp: values[i].timestamp,
//           open: parseFloat(values[i].rate1),
//           close: parseFloat(values[i + 1].rate1),
//         })
//       }

//       resolve([formattedHistoryRate0, formattedHistoryRate1])
//     } catch (e) {
//       console.log(e)
//       resolve([[], []])
//     }
//   })
//   cacheGetRateData[networksInfo.CHAIN_ID][pairAddress + startTime + latestBlock + frequency] = promise
//   return await promise
// }

export function Updater() {
  const exchangeSubgraphClient = useExchangeClient()
  const [, { updateTopPairs }] = usePairDataContext()
  const [ethPrice] = useEthPrice()
  const [networksInfo] = useNetworksInfo()

  useEffect(() => {
    let canceled = false
    async function getData() {
      // get top pairs by reserves
      let {
        data: { pairs },
      } = await exchangeSubgraphClient.query({
        query: PAIRS_CURRENT,
        fetchPolicy: 'cache-first',
      })

      // format as array of addresses
      const formattedPairs = pairs.map(pair => pair.id)

      // get data for every pair in list
      let topPairs = await getBulkPairData(exchangeSubgraphClient, formattedPairs, ethPrice, networksInfo)
      !canceled && topPairs && updateTopPairs(topPairs, networksInfo.CHAIN_ID)
    }
    ethPrice && getData()
    return () => (canceled = true)
  }, [ethPrice, updateTopPairs, exchangeSubgraphClient, networksInfo])
  return null
}

export function usePairRateData(pairAddress, timeWindow, frequency) {
  const exchangeSubgraphClient = useExchangeClient()
  const [state, { updateHourlyData }] = usePairDataContext()
  const [networksInfo] = useNetworksInfo()
  const chartData = state?.[networksInfo.CHAIN_ID]?.[pairAddress]?.hourlyData?.[timeWindow]
  const [latestBlock] = useLatestBlocks()

  useEffect(() => {
    const currentTime = dayjs.utc()
    let startTime

    switch (timeWindow) {
      case timeframeOptions.FOUR_HOURS:
        startTime = currentTime.subtract(4, 'hour').startOf('second').unix()
        break
      case timeframeOptions.ONE_DAY:
        startTime = currentTime.subtract(1, 'day').startOf('minute').unix()
        break
      case timeframeOptions.THERE_DAYS:
        startTime = currentTime.subtract(3, 'day').startOf('hour').unix()
        break
      case timeframeOptions.WEEK:
        startTime = currentTime.subtract(1, 'week').startOf('hour').unix()
        break
      case timeframeOptions.MONTH:
        startTime = currentTime.subtract(1, 'month').startOf('hour').unix()
        break
      default:
        startTime = currentTime.subtract(3, 'day').startOf('hour').unix()
        break
    }

    async function fetch() {
      let data = await getRateData(exchangeSubgraphClient, pairAddress, startTime, latestBlock, networksInfo, frequency)
      updateHourlyData(pairAddress, data, timeWindow, networksInfo.CHAIN_ID)
    }
    if (!chartData) {
      fetch()
    }
  }, [chartData, timeWindow, pairAddress, updateHourlyData, latestBlock, frequency, exchangeSubgraphClient, networksInfo])

  return chartData
}

/**
 * @todo
 * store these updates to reduce future redundant calls
 */
export function useDataForList(pairList) {
  const exchangeSubgraphClient = useExchangeClient()
  const [state] = usePairDataContext()
  const [ethPrice] = useEthPrice()

  const [stale, setStale] = useState(false)
  const [fetched, setFetched] = useState()
  const [networksInfo] = useNetworksInfo()

  // reset
  useEffect(() => {
    if (pairList) {
      setStale(false)
      setFetched()
    }
  }, [pairList])

  useEffect(() => {
    async function fetchNewPairData() {
      let newFetched = []
      let unfetched = []

      pairList.forEach(pair => {
        let currentData = state?.[networksInfo.CHAIN_ID]?.[pair.id]
        if (!currentData) {
          unfetched.push(pair.id)
        } else {
          newFetched.push(currentData)
        }
      })

      let newPairData = await getBulkPairData(
        exchangeSubgraphClient,
        unfetched.map(pair => {
          return pair
        }),
        ethPrice,
        networksInfo
      )
      setFetched(newFetched.concat(newPairData ? newPairData : []), networksInfo.CHAIN_ID)
    }
    if (ethPrice && pairList && pairList.length > 0 && !fetched?.length && !stale) {
      setStale(true)
      fetchNewPairData()
    }
  }, [ethPrice, state, pairList, stale, fetched, exchangeSubgraphClient, networksInfo])

  let formattedFetch =
    fetched &&
    fetched.reduce((obj, cur) => {
      return { ...obj, [cur?.id]: cur }
    }, {})

  return formattedFetch
}

/**
 * Get all the current and 24hr changes for a pair
 */
export function usePairData(pairAddress) {
  const exchangeSubgraphClient = useExchangeClient()
  const [state, { update }] = usePairDataContext()
  const [ethPrice] = useEthPrice()
  const [networksInfo] = useNetworksInfo()
  const pairData = state?.[networksInfo.CHAIN_ID]?.[pairAddress]

  useEffect(() => {
    async function fetchData() {
      if (!pairData && pairAddress) {
        let data = await getBulkPairData(exchangeSubgraphClient, [pairAddress], ethPrice, networksInfo)
        data && update(pairAddress, data[0], networksInfo.CHAIN_ID)
      }
    }
    if (!pairData && pairAddress && ethPrice && isAddress(pairAddress.split('_')[0]) && isAddress(pairAddress.split('_')[1])) {
      fetchData()
    }
  }, [pairAddress, pairData, update, ethPrice, exchangeSubgraphClient, networksInfo])

  return pairData || {}
}

/**
 * Get all pools for a pair
 */
export function usePairPools(pairAddress) {
  const exchangeSubgraphClient = useExchangeClient()
  const [state, { updatePairPools }] = usePairDataContext()
  const [ethPrice] = useEthPrice()
  const [networksInfo] = useNetworksInfo()
  const pairPools = state?.[networksInfo.CHAIN_ID]?.[pairAddress]?.pools

  useEffect(() => {
    async function checkForPairPools() {
      if (!pairPools) {
        let pools = await getPairPools(exchangeSubgraphClient, pairAddress)

        // format as array of addresses
        const formattedPools = pools.map(pool => {
          return pool.id
        })

        // get data for every pool in list
        let pairPoolsData = await getBulkPoolData(exchangeSubgraphClient, formattedPools, ethPrice, networksInfo)
        pairPoolsData && updatePairPools(pairAddress, pairPoolsData, networksInfo.CHAIN_ID)
      }
    }
    ethPrice && checkForPairPools()
  }, [pairPools, pairAddress, updatePairPools, ethPrice, exchangeSubgraphClient, networksInfo])

  return pairPools
}

/**
 * Get most recent txns for a pair
 * Seems deprecated
 */
export function usePairTransactions(pairAddress) {
  const exchangeSubgraphClient = useExchangeClient()
  const [state, { updatePairTxns }] = usePairDataContext()
  const [networksInfo] = useNetworksInfo()
  const pairTxns = state?.[networksInfo.CHAIN_ID]?.[pairAddress]?.txns
  useEffect(() => {
    async function checkForTxns() {
      if (!pairTxns) {
        let transactions = await getPairTransactions(exchangeSubgraphClient, pairAddress)
        updatePairTxns(pairAddress, transactions, networksInfo.CHAIN_ID)
      }
    }
    checkForTxns()
  }, [pairTxns, pairAddress, updatePairTxns, exchangeSubgraphClient])
  return pairTxns
}

export function usePairChartData(pairAddress) {
  const exchangeSubgraphClient = useExchangeClient()
  const [state, { updateChartData }] = usePairDataContext()
  const [networksInfo] = useNetworksInfo()
  const chartData = state?.[networksInfo.CHAIN_ID]?.[pairAddress]?.chartData

  useEffect(() => {
    async function checkForChartData() {
      if (!chartData) {
        let data = await getPairChartData(exchangeSubgraphClient, pairAddress)
        updateChartData(pairAddress, data, networksInfo.CHAIN_ID)
      }
    }
    checkForChartData()
  }, [chartData, pairAddress, updateChartData, exchangeSubgraphClient])
  return chartData
}

/**
 * Get list of all pairs in Uniswap
 */
export function useAllPairData() {
  const [state] = usePairDataContext()
  const [networksInfo] = useNetworksInfo()
  return state?.[networksInfo?.CHAIN_ID] || {}
}
