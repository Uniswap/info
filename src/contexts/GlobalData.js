import React, { createContext, useContext, useReducer, useMemo, useCallback, useEffect, useState } from 'react'
import { client } from '../apollo/client'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { useTimeframe } from './Application'
import { timeframeOptions } from '../constants'
import { getPercentChange, getBlockFromTimestamp, get2DayPercentChange } from '../helpers'
import {
  GLOBAL_DATA,
  GLOBAL_TXNS,
  GLOBAL_CHART,
  ETH_PRICE,
  ALL_PAIRS,
  ALL_TOKENS,
  GLOBAL_SUBSCRIPTION
} from '../apollo/queries'
import weekOfYear from 'dayjs/plugin/weekOfYear'
import { getV1Data } from './V1Data'
import { useSubscription } from 'react-apollo'

const UPDATE = 'UPDATE'
const UPDATE_V1 = 'UPDATE_V1'
const UPDATE_STAGED = 'UPDATE_STAGED'
const UPDATE_TXNS = 'UPDATE_TXNS'
const UPDATE_CHART = 'UPDATE_CHART'
const UPDATE_ETH_PRICE = 'UPDATE_ETH_PRICE'
const ETH_PRICE_KEY = 'ETH_PRICE_KEY'
const UPDATE_ALL_PAIRS_IN_UNISWAP = 'UPDAUPDATE_ALL_PAIRS_IN_UNISWAPTE_TOP_PAIRS'
const UPDATE_ALL_TOKENS_IN_UNISWAP = 'UPDATE_ALL_TOKENS_IN_UNISWAP'

dayjs.extend(utc)
dayjs.extend(weekOfYear)

const GlobalDataContext = createContext()

function useGlobalDataContext() {
  return useContext(GlobalDataContext)
}

function reducer(state, { type, payload }) {
  switch (type) {
    case UPDATE: {
      const { data } = payload
      return {
        ...state,
        globalData: data
      }
    }
    case UPDATE_V1: {
      const { v1Data } = payload
      return {
        ...state,
        v1Data
      }
    }
    case UPDATE_STAGED: {
      const { current, oneDay, twoDay } = payload
      return {
        ...state,
        current,
        oneDay,
        twoDay
      }
    }
    case UPDATE_TXNS: {
      const { transactions } = payload
      return {
        ...state,
        transactions
      }
    }
    case UPDATE_CHART: {
      const { daily, weekly } = payload
      return {
        ...state,
        chartData: {
          daily,
          weekly
        }
      }
    }
    case UPDATE_ETH_PRICE: {
      const { ethPrice, ethPriceChange } = payload
      return {
        ETH_PRICE_KEY: ethPrice,
        ethPriceChange
      }
    }

    case UPDATE_ALL_PAIRS_IN_UNISWAP: {
      const { allPairs } = payload
      return {
        ...state,
        allPairs
      }
    }

    case UPDATE_ALL_TOKENS_IN_UNISWAP: {
      const { allTokens } = payload
      return {
        ...state,
        allTokens
      }
    }
    default: {
      throw Error(`Unexpected action type in DataContext reducer: '${type}'.`)
    }
  }
}

export default function Provider({ children }) {
  const [state, dispatch] = useReducer(reducer, {})

  const update = useCallback(data => {
    dispatch({
      type: UPDATE,
      payload: {
        data
      }
    })
  }, [])

  const updateV1 = useCallback(v1Data => {
    dispatch({
      type: UPDATE_V1,
      payload: {
        v1Data
      }
    })
  }, [])

  const updateStaged = useCallback((current, oneDay, twoDay) => {
    dispatch({
      type: UPDATE_STAGED,
      payload: {
        current,
        oneDay,
        twoDay
      }
    })
  }, [])

  const updateTransactions = useCallback(transactions => {
    dispatch({
      type: UPDATE_TXNS,
      payload: {
        transactions
      }
    })
  }, [])

  const updateChart = useCallback((daily, weekly) => {
    dispatch({
      type: UPDATE_CHART,
      payload: {
        daily,
        weekly
      }
    })
  }, [])

  const updateEthPrice = useCallback((ethPrice, ethPriceChange) => {
    dispatch({
      type: UPDATE_ETH_PRICE,
      payload: {
        ethPrice,
        ethPriceChange
      }
    })
  }, [])

  const updateAllPairsInUniswap = useCallback(allPairs => {
    dispatch({
      type: UPDATE_ALL_PAIRS_IN_UNISWAP,
      payload: {
        allPairs
      }
    })
  }, [])

  const updateAllTokensInUniswap = useCallback(allTokens => {
    dispatch({
      type: UPDATE_ALL_TOKENS_IN_UNISWAP,
      payload: {
        allTokens
      }
    })
  }, [])
  return (
    <GlobalDataContext.Provider
      value={useMemo(
        () => [
          state,
          {
            update,
            updateV1,
            updateStaged,
            updateTransactions,
            updateChart,
            updateEthPrice,
            updateAllPairsInUniswap,
            updateAllTokensInUniswap
          }
        ],
        [
          state,
          update,
          updateV1,
          updateStaged,
          updateTransactions,
          updateChart,
          updateEthPrice,
          updateAllPairsInUniswap,
          updateAllTokensInUniswap
        ]
      )}
    >
      {children}
    </GlobalDataContext.Provider>
  )
}

async function getStagedData() {
  let data = {}
  let oneDayData = {}
  let twoDayData = {}

  try {
    const utcCurrentTime = dayjs()
    const utcOneDayBack = utcCurrentTime.subtract(1, 'day').unix()
    const utcTwoDaysBack = utcCurrentTime.subtract(2, 'day').unix()
    let oneDayBlock = await getBlockFromTimestamp(utcOneDayBack)
    let twoDayBlock = await getBlockFromTimestamp(utcTwoDaysBack)

    let result = await client.query({
      query: GLOBAL_DATA(),
      fetchPolicy: 'cache-first'
    })
    data = result.data.uniswapFactories[0]

    let oneDayResult = await client.query({
      query: GLOBAL_DATA(oneDayBlock),
      fetchPolicy: 'cache-first'
    })
    oneDayData = oneDayResult.data.uniswapFactories[0]

    let twoDayResult = await client.query({
      query: GLOBAL_DATA(twoDayBlock),
      fetchPolicy: 'cache-first'
    })
    twoDayData = twoDayResult.data.uniswapFactories[0]
  } catch (e) {
    console.log(e)
  }

  return [data, oneDayData, twoDayData]
}

const getChartData = async oldestDateToFetch => {
  let data = []
  let weeklyData = []

  const utcEndTime = dayjs.utc()

  try {
    let result = await client.query({
      query: GLOBAL_CHART,
      variables: {
        startTime: oldestDateToFetch
      },
      fetchPolicy: 'cache-first'
    })
    data = result.data.uniswapDayDatas

    if (data) {
      let dayIndexSet = new Set()
      let dayIndexArray = []
      const oneDay = 24 * 60 * 60
      data.forEach((dayData, i) => {
        // add the day index to the set of days
        dayIndexSet.add((data[i].date / oneDay).toFixed(0))
        dayIndexArray.push(data[i])
        dayData.dailyVolumeUSD = parseFloat(dayData.dailyVolumeUSD)
      })

      // fill in empty days
      let timestamp = data[0].date ? data[0].date : oldestDateToFetch
      let latestLiquidityUSD = data[0].totalLiquidityUSD
      let latestDayDats = data[0].mostLiquidTokens
      let index = 1
      while (timestamp < utcEndTime.unix() - oneDay) {
        const nextDay = timestamp + oneDay
        let currentDayIndex = (nextDay / oneDay).toFixed(0)
        if (!dayIndexSet.has(currentDayIndex)) {
          data.push({
            date: nextDay,
            dailyVolumeUSD: 0,
            totalLiquidityUSD: latestLiquidityUSD,
            mostLiquidTokens: latestDayDats
          })
        } else {
          latestLiquidityUSD = dayIndexArray[index].totalLiquidityUSD
          latestDayDats = dayIndexArray[index].mostLiquidTokens
          index = index + 1
        }
        timestamp = nextDay
      }
    }
    data[data.length - 1].totalLiquidityUSD = data[data.length - 1].totalLiquidityUSD - 61807123

    data = data.sort((a, b) => (parseInt(a.date) > parseInt(b.date) ? 1 : -1))
    let startIndexWeekly = -1
    let currentWeek = -1
    data.forEach((dayData, i) => {
      const week = dayjs.utc(dayjs.unix(data[i].date)).week()
      if (week !== currentWeek) {
        currentWeek = week
        startIndexWeekly++
      }
      weeklyData[startIndexWeekly] = weeklyData[startIndexWeekly] || {}
      weeklyData[startIndexWeekly].date = data[i].date
      weeklyData[startIndexWeekly].weeklyVolumeUSD = weeklyData[startIndexWeekly].weeklyVolumeUSD
        ? weeklyData[startIndexWeekly].weeklyVolumeUSD + data[i].dailyVolumeUSD
        : data[i].dailyVolumeUSD
    })
  } catch (e) {
    console.log(e)
  }

  return [data, weeklyData]
}

const getGlobalTransactions = async () => {
  let transactions = {}

  try {
    let result = await client.query({
      query: GLOBAL_TXNS,
      fetchPolicy: 'cache-first'
    })
    transactions.mints = []
    transactions.burns = []
    transactions.swaps = []
    result?.data?.transactions &&
      result.data.transactions.map(transaction => {
        if (transaction.mints.length > 0) {
          transaction.mints.map(mint => {
            return transactions.mints.push(mint)
          })
        }
        if (transaction.burns.length > 0) {
          transaction.burns.map(burn => {
            return transactions.burns.push(burn)
          })
        }
        if (transaction.swaps.length > 0) {
          transaction.swaps.map(swap => {
            return transactions.swaps.push(swap)
          })
        }
        return true
      })
  } catch (e) {
    console.log(e)
  }

  return transactions
}

const getEthPrice = async () => {
  const utcCurrentTime = dayjs()
  const utcOneDayBack = utcCurrentTime.subtract(1, 'day').unix()

  let ethPrice = 0
  let priceChangeETH = 0

  try {
    let oneDayBlock = await getBlockFromTimestamp(utcOneDayBack)
    let result = await client.query({
      query: ETH_PRICE(),
      fetchPolicy: 'cache-first'
    })
    let resultOneDay = await client.query({
      query: ETH_PRICE(oneDayBlock),
      fetchPolicy: 'cache-first'
    })
    priceChangeETH = getPercentChange(result?.data?.bundles[0]?.ethPrice, resultOneDay?.data?.bundles[0]?.ethPrice)
    ethPrice = result?.data?.bundles[0]?.ethPrice
  } catch (e) {
    console.log(e)
  }

  return [ethPrice, priceChangeETH]
}

async function getAllPairsOnUniswap() {
  try {
    let allFound = false
    let pairs = []
    while (!allFound) {
      let result = await client.query({
        query: ALL_PAIRS,
        fetchPolicy: 'cache-first'
      })
      pairs = pairs.concat(result?.data?.pairs)
      if (pairs?.length < 1000) {
        allFound = true
      }
    }
    return pairs
  } catch (e) {
    console.log(e)
  }
}

async function getAllTokensOnUniswap() {
  try {
    let allFound = false
    let tokens = []
    while (!allFound) {
      let result = await client.query({
        query: ALL_TOKENS,
        fetchPolicy: 'cache-first'
      })
      tokens = tokens.concat(result?.data?.tokens)
      if (tokens?.length < 1000) {
        allFound = true
      }
    }
    return tokens
  } catch (e) {
    console.log(e)
  }
}

function formatCombined(data, oneDayData, twoDayData, ethPrice) {
  const [oneDayVolumeUSD, volumeChangeUSD] = get2DayPercentChange(
    data.totalVolumeUSD,
    oneDayData.totalVolumeUSD ? oneDayData.totalVolumeUSD : 0,
    twoDayData.totalVolumeUSD ? twoDayData.totalVolumeUSD : 0
  )

  const [oneDayVolumeETH, volumeChangeETH] = get2DayPercentChange(
    data.totalVolumeETH,
    oneDayData.totalVolumeETH ? oneDayData.totalVolumeETH : 0,
    twoDayData.totalVolumeETH ? twoDayData.totalVolumeETH : 0
  )

  const [oneDayTxns, txnChange] = get2DayPercentChange(
    data.txCount,
    oneDayData.txCount ? oneDayData.txCount : 0,
    twoDayData.txCount ? twoDayData.txCount : 0
  )

  data.totalLiquidityUSD = data.totalLiquidityETH * ethPrice - 61807123
  const liquidityChangeUSD = getPercentChange(data.totalLiquidityETH, oneDayData.totalLiquidityETH)
  const liquidityChangeETH = getPercentChange(data.totalLiquidityETH, oneDayData.totalLiquidityETH)
  data.oneDayVolumeUSD = oneDayVolumeUSD
  data.volumeChangeUSD = volumeChangeUSD
  data.oneDayVolumeETH = oneDayVolumeETH
  data.volumeChangeETH = volumeChangeETH
  data.liquidityChangeUSD = liquidityChangeUSD
  data.liquidityChangeETH = liquidityChangeETH
  data.oneDayTxns = oneDayTxns
  data.txnChange = txnChange

  return data
}

export function useGlobalData() {
  const [state, { update, updateStaged, updateAllPairsInUniswap, updateAllTokensInUniswap }] = useGlobalDataContext()
  const ethPrice = useEthPrice()

  const [current, oneDay, twoDay] = [state?.current, state?.oneDay, state?.twoDay]
  const storedData = state?.globalData

  useSubscription(GLOBAL_SUBSCRIPTION, {
    client: client,
    onSubscriptionData: ({ subscriptionData }) => {
      let newCurrentData = subscriptionData?.data?.uniswapFactories[0]
      if (oneDay && twoDay && ethPrice) {
        let newCombined = formatCombined(newCurrentData, oneDay, twoDay, ethPrice)
        if (storedData.txCount !== newCurrentData.txCount) {
          update(newCombined)
          console.log('updating')
        }
      }
    }
  })

  useEffect(() => {
    if (current && oneDay && twoDay && ethPrice && !storedData) {
      let newCombined = formatCombined(current, oneDay, twoDay, ethPrice)
      update(newCombined)
    }
  }, [current, ethPrice, oneDay, storedData, twoDay, update])

  useEffect(() => {
    async function fetchData() {
      if (!storedData && ethPrice) {
        let [currentData, oneDayData, twoDayData] = await getStagedData()
        updateStaged(currentData, oneDayData, twoDayData)

        let allPairs = await getAllPairsOnUniswap()
        updateAllPairsInUniswap(allPairs)

        let allTokens = await getAllTokensOnUniswap()
        updateAllTokensInUniswap(allTokens)
      }
    }
    fetchData()
  }, [ethPrice, storedData, updateAllPairsInUniswap, updateAllTokensInUniswap, updateStaged])

  return storedData || {}
}

export function useV1Data() {
  const [state, { updateV1 }] = useGlobalDataContext()
  const v1Data = state?.v1Data

  useEffect(() => {
    async function fetch() {
      let newData = await getV1Data()
      updateV1(newData)
    }
    if (!v1Data) {
      fetch()
    }
  }, [updateV1, v1Data])

  return v1Data
}

export function useGlobalChartData() {
  const [state, { updateChart }] = useGlobalDataContext()
  const [oldestDateFetch, setOldestDateFetched] = useState()
  const [activeWindow] = useTimeframe()

  const chartDataDaily = state?.chartData?.daily
  const chartDataWeekly = state?.chartData?.weekly

  // monitor the old date fetched
  useEffect(() => {
    const utcEndTime = dayjs.utc()
    // based on window, get starttime
    let utcStartTime
    switch (activeWindow) {
      case timeframeOptions.WEEK:
        utcStartTime = utcEndTime.subtract(1, 'week').startOf('day')
        break
      case timeframeOptions.ALL_TIME:
        utcStartTime = utcEndTime.subtract(1, 'year')
        break
      default:
        utcStartTime = utcEndTime.subtract(1, 'year').startOf('year')
        break
    }
    let startTime = utcStartTime.unix() - 1

    if ((activeWindow && startTime < oldestDateFetch) || !oldestDateFetch) {
      setOldestDateFetched(startTime)
    }
  }, [activeWindow, oldestDateFetch])

  useEffect(() => {
    async function fetchData() {
      // historical stuff for chart
      let [newChartData, newWeeklyData] = await getChartData(oldestDateFetch)
      updateChart(newChartData, newWeeklyData)
    }
    if (oldestDateFetch && !(chartDataDaily && chartDataWeekly)) {
      fetchData()
    }
  }, [chartDataDaily, chartDataWeekly, oldestDateFetch, updateChart])

  return [chartDataDaily, chartDataWeekly]
}

export function useGlobalTransactions() {
  const [state, { updateTransactions }] = useGlobalDataContext()
  const transactions = state?.transactions
  useEffect(() => {
    async function fetchData() {
      if (!transactions) {
        let txns = await getGlobalTransactions()
        updateTransactions(txns)
      }
    }
    fetchData()
  }, [updateTransactions, transactions])
  return transactions
}

export function useEthPrice() {
  const [state, { updateEthPrice }] = useGlobalDataContext()
  const ethPrice = state?.[ETH_PRICE_KEY]
  useEffect(() => {
    async function checkForEthPrice() {
      if (!ethPrice) {
        let [newPrice, priceChange] = await getEthPrice()
        updateEthPrice(newPrice, priceChange)
      }
    }
    checkForEthPrice()
  }, [ethPrice, updateEthPrice])

  return ethPrice
}

export function useAllPairsInUniswap() {
  const [state] = useGlobalDataContext()
  let allPairs = state?.allPairs

  return allPairs || []
}

export function useAllTokensInUniswap() {
  const [state] = useGlobalDataContext()
  let allTokens = state?.allTokens

  return allTokens || []
}
