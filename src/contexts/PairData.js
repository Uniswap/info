import { createContext, useContext, useReducer, useMemo, useCallback, useEffect, useState } from 'react'
import { EthereumNetworkInfo, TronNetworkInfo } from '../constants/networks'

import { useEthPrice } from 'state/features/global/hooks'
import { useActiveNetworkId, useLatestBlocks } from 'state/features/application/hooks'

import dayjs from 'dayjs'

import {
  getPercentChange,
  get2DayPercentChange,
  isAddress,
  getBlocksFromTimestamps,
  getTimestampsForChanges,
  splitQuery
} from 'utils'
import { timeframeOptions } from '../constants'
import { updateNameData } from 'utils/data'
import { pairApi } from 'api'

const UPDATE = 'UPDATE'
const UPDATE_PAIR_TXNS = 'UPDATE_PAIR_TXNS'
const UPDATE_CHART_DATA = 'UPDATE_CHART_DATA'
const UPDATE_TOP_PAIRS = 'UPDATE_TOP_PAIRS'
const UPDATE_HOURLY_DATA = 'UPDATE_HOURLY_DATA'

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

const INITIAL_STATE = {
  [EthereumNetworkInfo.id]: {},
  [TronNetworkInfo.id]: {}
}

function reducer(state, { type, payload }) {
  switch (type) {
    case UPDATE: {
      const { pairAddress, data, networkId } = payload
      return {
        ...state,
        [networkId]: {
          ...state[networkId],
          [pairAddress]: {
            ...state[networkId]?.[pairAddress],
            ...data
          }
        }
      }
    }

    case UPDATE_TOP_PAIRS: {
      const { topPairs, networkId } = payload
      let added = {}
      topPairs.map(pair => {
        return (added[pair.id] = pair)
      })
      return {
        ...state,
        [networkId]: {
          ...state[networkId],
          ...added
        }
      }
    }

    case UPDATE_PAIR_TXNS: {
      const { address, transactions, networkId } = payload
      return {
        ...state,
        [networkId]: {
          ...state[networkId],
          [address]: {
            ...(safeAccess(state[networkId], [address]) || {}),
            txns: transactions
          }
        }
      }
    }
    case UPDATE_CHART_DATA: {
      const { address, chartData, networkId } = payload
      return {
        ...state,
        [networkId]: {
          ...state[networkId],
          [address]: {
            ...(safeAccess(state[networkId], [address]) || {}),
            chartData
          }
        }
      }
    }

    case UPDATE_HOURLY_DATA: {
      const { address, hourlyData, timeWindow, networkId } = payload
      return {
        ...state,
        [networkId]: {
          ...state[networkId],
          [address]: {
            ...state[networkId]?.[address],
            hourlyData: {
              ...state[networkId]?.[address]?.hourlyData,
              [timeWindow]: hourlyData
            }
          }
        }
      }
    }

    default: {
      throw Error(`Unexpected action type in DataContext reducer: '${type}'.`)
    }
  }
}

export default function Provider({ children }) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE)

  // update pair specific data
  const update = useCallback((pairAddress, data, networkId) => {
    dispatch({
      type: UPDATE,
      payload: {
        pairAddress,
        networkId,
        data
      }
    })
  }, [])

  const updateTopPairs = useCallback((topPairs, networkId) => {
    dispatch({
      type: UPDATE_TOP_PAIRS,
      payload: {
        topPairs,
        networkId
      }
    })
  }, [])

  const updatePairTxns = useCallback((address, transactions, networkId) => {
    dispatch({
      type: UPDATE_PAIR_TXNS,
      payload: { address, transactions, networkId }
    })
  }, [])

  const updateChartData = useCallback((address, chartData, networkId) => {
    dispatch({
      type: UPDATE_CHART_DATA,
      payload: { address, chartData, networkId }
    })
  }, [])

  const updateHourlyData = useCallback((address, hourlyData, timeWindow, networkId) => {
    dispatch({
      type: UPDATE_HOURLY_DATA,
      payload: { address, hourlyData, timeWindow, networkId }
    })
  }, [])

  return (
    <PairDataContext.Provider
      value={useMemo(
        () => [
          state,
          {
            update,
            updatePairTxns,
            updateChartData,
            updateTopPairs,
            updateHourlyData
          }
        ],
        [state, update, updatePairTxns, updateChartData, updateTopPairs, updateHourlyData]
      )}
    >
      {children}
    </PairDataContext.Provider>
  )
}

async function getBulkPairData(pairList, price) {
  const [t1, t2, tWeek] = getTimestampsForChanges()
  let [{ number: b1 }, { number: b2 }, { number: bWeek }] = await getBlocksFromTimestamps([t1, t2, tWeek])

  try {
    let current = await pairApi.getPairsBulk(pairList)

    let [oneDayResult, twoDayResult, oneWeekResult] = await Promise.all(
      [b1, b2, bWeek].map(async block => {
        let result = await pairApi.getPairsHistoricalBulk(block, pairList)
        return result
      })
    )

    let oneDayData = oneDayResult?.data?.pairs.reduce((obj, cur) => {
      return { ...obj, [cur.id]: cur }
    }, {})

    let twoDayData = twoDayResult?.data?.pairs.reduce((obj, cur) => {
      return { ...obj, [cur.id]: cur }
    }, {})

    let oneWeekData = oneWeekResult?.data?.pairs.reduce((obj, cur) => {
      return { ...obj, [cur.id]: cur }
    }, {})

    let pairData = await Promise.all(
      current &&
        current.data.pairs.map(async pair => {
          let data = pair
          let oneDayHistory = oneDayData?.[pair.id]
          if (!oneDayHistory) {
            let newData = await pairApi.getPairData(pair.id, b1)
            oneDayHistory = newData.data.pairs[0]
          }
          let twoDayHistory = twoDayData?.[pair.id]
          if (!twoDayHistory) {
            let newData = await pairApi.getPairData(pair.id, b2)
            twoDayHistory = newData.data.pairs[0]
          }
          let oneWeekHistory = oneWeekData?.[pair.id]
          if (!oneWeekHistory) {
            let newData = await pairApi.getPairData(pair.id, bWeek)
            oneWeekHistory = newData.data.pairs[0]
          }
          data = parseData(data, oneDayHistory, twoDayHistory, oneWeekHistory, price, b1)
          return data
        })
    )
    return pairData
  } catch (e) {
    console.log(e)
  }
}

function parseData(data, oneDayData, twoDayData, oneWeekData, price, oneDayBlock) {
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

  // set volume properties
  data.oneDayVolumeUSD = parseFloat(oneDayVolumeUSD)
  data.oneWeekVolumeUSD = oneWeekVolumeUSD
  data.volumeChangeUSD = volumeChangeUSD
  data.oneDayVolumeUntracked = oneDayVolumeUntracked
  data.volumeChangeUntracked = volumeChangeUntracked

  // set liquidity properties
  // TODO: trackedReserveETH
  data.trackedReserveUSD = data.trackedReserveETH * price
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

  // format incorrect names
  updateNameData(data)

  return data
}

// TODO: can be improved using useQuery
const getPairTransactions = async pairAddress => {
  const transactions = {}

  try {
    const result = await pairApi.getFilteredTransactions([pairAddress])
    transactions.mints = result.data.mints
    transactions.burns = result.data.burns
    transactions.swaps = result.data.swaps
  } catch (e) {
    console.log(e)
  }

  return transactions
}

const getPairChartData = async pairAddress => {
  let data = []
  const utcEndTime = dayjs.utc()
  let utcStartTime = utcEndTime.subtract(1, 'year').startOf('minute')
  let startTime = utcStartTime.unix() - 1

  try {
    let allFound = false
    let skip = 0
    while (!allFound) {
      let result = await pairApi.getPairChart(pairAddress, skip)
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
            reserveUSD: latestLiquidityUSD
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

const getHourlyRateData = async (pairAddress, startTime, latestBlock) => {
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
        return parseFloat(b.number) <= parseFloat(latestBlock)
      })
    }

    // TODO: refactor
    const result = await splitQuery(params => pairApi.getPairHourlyRates(pairAddress, params), blocks)

    // format token ETH price results
    let values = []
    for (var row in result) {
      let timestamp = row.split('t')[1]
      if (timestamp) {
        values.push({
          timestamp,
          rate0: parseFloat(result[row]?.token0Price),
          rate1: parseFloat(result[row]?.token1Price)
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
        close: parseFloat(values[i + 1].rate0)
      })
      formattedHistoryRate1.push({
        timestamp: values[i].timestamp,
        open: parseFloat(values[i].rate1),
        close: parseFloat(values[i + 1].rate1)
      })
    }

    return [formattedHistoryRate0, formattedHistoryRate1]
  } catch (e) {
    console.log(e)
    return [[], []]
  }
}

export function usePairUpdater() {
  const [, { updateTopPairs }] = usePairDataContext()
  const activeNetwork = useActiveNetworkId()
  const [price] = useEthPrice()

  useEffect(() => {
    async function getData() {
      // get top pairs by reserves
      let {
        data: { pairs }
      } = await pairApi.getCurrentPairs()

      // format as array of addresses
      const formattedPairs = pairs.map(pair => {
        return pair.id
      })

      // get data for every pair in list
      let topPairs = await getBulkPairData(formattedPairs, price)
      topPairs && updateTopPairs(topPairs, activeNetwork)
    }
    price && getData()
  }, [price, updateTopPairs, activeNetwork])
}

export function useHourlyRateData(pairAddress, timeWindow) {
  const [state, { updateHourlyData }] = usePairDataContext()
  const activeNetwork = useActiveNetworkId()
  const [latestBlock] = useLatestBlocks()
  const chartData = state[activeNetwork]?.[pairAddress]?.hourlyData?.[timeWindow]

  useEffect(() => {
    const currentTime = dayjs.utc()
    const windowSize = timeWindow === timeframeOptions.MONTH ? 'month' : 'week'
    const startTime =
      timeWindow === timeframeOptions.ALL_TIME ? 1589760000 : currentTime.subtract(1, windowSize).startOf('hour').unix()

    async function fetch() {
      let data = await getHourlyRateData(pairAddress, startTime, latestBlock)
      updateHourlyData(pairAddress, data, timeWindow, activeNetwork)
    }
    if (!chartData) {
      fetch()
    }
  }, [chartData, timeWindow, pairAddress, updateHourlyData, latestBlock, activeNetwork])

  return chartData
}

/**
 * @todo
 * store these updates to reduce future redundant calls
 */
export function useDataForList(pairList) {
  const [state] = usePairDataContext()
  const [price] = useEthPrice()
  const activeNetwork = useActiveNetworkId()

  const [stale, setStale] = useState(false)
  const [fetched, setFetched] = useState([])

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

      pairList.map(async pair => {
        let currentData = state[activeNetwork]?.[pair.id]
        if (!currentData) {
          unfetched.push(pair.id)
        } else {
          newFetched.push(currentData)
        }
      })

      let newPairData = await getBulkPairData(
        unfetched.map(pair => {
          return pair
        }),
        price
      )
      setFetched(newFetched.concat(newPairData))
    }
    if (price && pairList && pairList.length > 0 && !fetched && !stale) {
      setStale(true)
      fetchNewPairData()
    }
  }, [price, state, pairList, stale, fetched, activeNetwork])

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
  const [state, { update }] = usePairDataContext()
  const activeNetwork = useActiveNetworkId()
  const [price] = useEthPrice()
  const pairData = state[activeNetwork]?.[pairAddress]

  useEffect(() => {
    async function fetchData() {
      let data = await getBulkPairData([pairAddress], price)
      data && update(pairAddress, data[0], activeNetwork)
    }
    // TODO: isAddress() only work for eth not for trx
    if (!pairData && pairAddress && price && isAddress(pairAddress)) {
      fetchData()
    }
  }, [pairAddress, pairData, update, price, activeNetwork])

  return pairData || {}
}

/**
 * Get most recent txns for a pair
 */
export function usePairTransactions(pairAddress) {
  const [state, { updatePairTxns }] = usePairDataContext()
  const activeNetwork = useActiveNetworkId()
  const pairTxns = state[activeNetwork]?.[pairAddress]?.txns
  useEffect(() => {
    async function checkForTxns() {
      if (!pairTxns) {
        let transactions = await getPairTransactions(pairAddress)
        updatePairTxns(pairAddress, transactions, activeNetwork)
      }
    }
    checkForTxns()
  }, [pairTxns, pairAddress, updatePairTxns, activeNetwork])
  return pairTxns
}

export function usePairChartData(pairAddress) {
  const [state, { updateChartData }] = usePairDataContext()
  const activeNetwork = useActiveNetworkId()
  const chartData = state[activeNetwork]?.[pairAddress]?.chartData

  useEffect(() => {
    async function checkForChartData() {
      if (!chartData) {
        let data = await getPairChartData(pairAddress)
        updateChartData(pairAddress, data, activeNetwork)
      }
    }
    checkForChartData()
  }, [chartData, pairAddress, updateChartData, activeNetwork])
  return chartData
}

/**
 * Get list of all pairs in Uniswap
 */
export function useAllPairData() {
  const [state] = usePairDataContext()
  const activeNetwork = useActiveNetworkId()
  return state[activeNetwork] || {}
}
