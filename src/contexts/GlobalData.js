import React, { createContext, useContext, useReducer, useMemo, useCallback, useEffect, useState } from 'react'
import { client, v1Client } from '../apollo/client'
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
  UNISWAP_GLOBALS_QUERY,
  UNISWAP_GLOBALS_24HOURS_AGO_QUERY
} from '../apollo/queries'
import weekOfYear from 'dayjs/plugin/weekOfYear'

const UPDATE = 'UPDATE'
const UPDATE_TXNS = 'UPDATE_TXNS'
const UPDATE_CHART = 'UPDATE_CHART'
const UPDATE_ETH_PRICE = 'UPDATE_ETH_PRICE'
const ETH_PRICE_KEY = 'ETH_PRICE_KEY'

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
    case UPDATE_TXNS: {
      const { transactions } = payload
      return {
        ...state,
        transactions
      }
    }
    case UPDATE_CHART: {
      const { chartData } = payload
      return {
        ...state,
        chartData
      }
    }
    case UPDATE_ETH_PRICE: {
      const { ethPrice, ethPriceChange } = payload
      return {
        ETH_PRICE_KEY: ethPrice,
        ethPriceChange
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

  const updateTransactions = useCallback(transactions => {
    dispatch({
      type: UPDATE_TXNS,
      payload: {
        transactions
      }
    })
  }, [])

  const updateChart = useCallback(chartData => {
    dispatch({
      type: UPDATE_CHART,
      payload: {
        chartData
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

  return (
    <GlobalDataContext.Provider
      value={useMemo(() => [state, { update, updateTransactions, updateChart, updateEthPrice }], [
        state,
        update,
        updateTransactions,
        updateChart,
        updateEthPrice
      ])}
    >
      {children}
    </GlobalDataContext.Provider>
  )
}

async function getGlobalData(ethPrice) {
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

    if (data && oneDayData && twoDayData) {
      const [oneDayVolumeUSD, volumeChangeUSD] = get2DayPercentChange(
        data.totalVolumeUSD - 21082593545,
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

      data.totalLiquidityUSD = data.totalLiquidityETH * ethPrice
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

      const v1Data = await getV1Data()
      data.v1Data = v1Data
    }
  } catch (e) {
    console.log(e)
  }

  return data
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

async function getV1Data() {
  dayjs.extend(utc)

  let data = {}
  let data24HoursAgo = {}
  let data48HoursAgo = {}
  const utcCurrentTime = dayjs()
  try {
    // get the current data
    let result = await v1Client.query({
      query: UNISWAP_GLOBALS_QUERY,
      fetchPolicy: 'cache-first'
    })
    if (result) {
      data.totalVolumeUSD = result.data.uniswap.totalVolumeUSD
      data.liquidityUsd = result.data.uniswap.totalLiquidityUSD
      data.txCount = result.data.uniswap.txCount
    }
  } catch (err) {
    console.log('error: ', err)
  }

  try {
    const utcOneDayBack = utcCurrentTime.subtract(1, 'day')
    // get data one day ago
    let result = await v1Client.query({
      query: UNISWAP_GLOBALS_24HOURS_AGO_QUERY,
      variables: {
        date: utcOneDayBack.unix()
      },
      fetchPolicy: 'cache-first'
    })
    if (result) {
      data24HoursAgo.totalVolumeUSD = result.data.uniswapHistoricalDatas[0].totalVolumeUSD
      data24HoursAgo.liquidityUsd = result.data.uniswapHistoricalDatas[0].totalLiquidityUSD
      data24HoursAgo.txCount = result.data.uniswapHistoricalDatas[0].txCount
    }
  } catch (err) {
    console.log('error: ', err)
  }
  // get two day stats
  const utcTwoDaysBack = utcCurrentTime.subtract(2, 'day')
  try {
    let resultTwoDays = await v1Client.query({
      query: UNISWAP_GLOBALS_24HOURS_AGO_QUERY,
      variables: {
        date: utcTwoDaysBack.unix()
      },
      fetchPolicy: 'cache-first'
    })
    if (resultTwoDays) {
      // set two day data
      data48HoursAgo.totalVolumeUSD = resultTwoDays.data.uniswapHistoricalDatas[0].totalVolumeUSD
      data48HoursAgo.liquidityUsd = resultTwoDays.data.uniswapHistoricalDatas[0].totalLiquidityUSD
      data48HoursAgo.txCount = resultTwoDays.data.uniswapHistoricalDatas[0].txCount
    }
  } catch (err) {
    console.log('error: ', err)
  }

  // 48 hour windows
  let [volumeChangeUSD, volumePercentChangeUSD] = get2DayPercentChange(
    data.totalVolumeUSD,
    data24HoursAgo.totalVolumeUSD,
    data48HoursAgo.totalVolumeUSD
  )

  let [txCountChange, txCountPercentChange] = get2DayPercentChange(
    data.txCount,
    data24HoursAgo.txCount,
    data48HoursAgo.txCount
  )

  // regular percent changes
  let liquidityPercentChangeUSD = getPercentChange(data.liquidityUsd, data24HoursAgo.liquidityUsd)

  data.liquidityPercentChangeUSD = liquidityPercentChangeUSD
  data.volumePercentChangeUSD = volumePercentChangeUSD
  data.txCount = txCountChange
  data.txCountPercentChange = txCountPercentChange
  data.dailyVolumeUSD = volumeChangeUSD

  return data
}

export function useGlobalData() {
  const [state, { update }] = useGlobalDataContext()
  const ethPrice = useEthPrice()

  const data = state?.globalData

  useEffect(() => {
    async function fetchData() {
      if (!data && ethPrice) {
        let globalData = await getGlobalData(ethPrice)
        globalData && update(globalData)
      }
    }
    fetchData()
  }, [ethPrice, update, data])

  return data || {}
}

export function useGlobalChartData() {
  const [chartData, setChartData] = useState()
  const [weeklyData, setWeeklyData] = useState()
  const [oldestDateFetch, setOldestDateFetched] = useState()
  const [activeWindow] = useTimeframe()

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
      setChartData(newChartData)
      setWeeklyData(newWeeklyData)
    }
    oldestDateFetch && fetchData()
  }, [oldestDateFetch])

  return [chartData, weeklyData]
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
