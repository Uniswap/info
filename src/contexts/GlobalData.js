import React, { createContext, useContext, useReducer, useMemo, useCallback, useEffect, useState } from 'react'
import { client } from '../apollo/client'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { useTimeframe } from './Application'
import {
  getPercentChange,
  getBlockFromTimestamp,
  getBlocksFromTimestamps,
  get2DayPercentChange,
  getTimeframe
} from '../utils'
import {
  GLOBAL_DATA,
  GLOBAL_TXNS,
  GLOBAL_CHART,
  ETH_PRICE,
  ALL_PAIRS,
  ALL_TOKENS,
  TOP_LPS_PER_PAIRS
} from '../apollo/queries'
import weekOfYear from 'dayjs/plugin/weekOfYear'
import { useAllPairData } from './PairData'
const UPDATE = 'UPDATE'
const UPDATE_TXNS = 'UPDATE_TXNS'
const UPDATE_CHART = 'UPDATE_CHART'
const UPDATE_ETH_PRICE = 'UPDATE_ETH_PRICE'
const ETH_PRICE_KEY = 'ETH_PRICE_KEY'
const UPDATE_ALL_PAIRS_IN_UNISWAP = 'UPDAUPDATE_ALL_PAIRS_IN_UNISWAPTE_TOP_PAIRS'
const UPDATE_ALL_TOKENS_IN_UNISWAP = 'UPDATE_ALL_TOKENS_IN_UNISWAP'
const UPDATE_TOP_LPS = 'UPDATE_TOP_LPS'

// format dayjs with the libraries that we need
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
      const { ethPrice, oneDayPrice, ethPriceChange } = payload
      return {
        [ETH_PRICE_KEY]: ethPrice,
        oneDayPrice,
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

    case UPDATE_TOP_LPS: {
      const { topLps } = payload
      return {
        ...state,
        topLps
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

  const updateChart = useCallback((daily, weekly) => {
    dispatch({
      type: UPDATE_CHART,
      payload: {
        daily,
        weekly
      }
    })
  }, [])

  const updateEthPrice = useCallback((ethPrice, oneDayPrice, ethPriceChange) => {
    dispatch({
      type: UPDATE_ETH_PRICE,
      payload: {
        ethPrice,
        oneDayPrice,
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

  const updateTopLps = useCallback(topLps => {
    dispatch({
      type: UPDATE_TOP_LPS,
      payload: {
        topLps
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
            updateTransactions,
            updateChart,
            updateEthPrice,
            updateTopLps,
            updateAllPairsInUniswap,
            updateAllTokensInUniswap
          }
        ],
        [
          state,
          update,
          updateTransactions,
          updateTopLps,
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

/**
 * Gets all the global data for the overview page.
 * Needs current eth price and the old eth price to get
 * 24 hour USD changes.
 * @param {*} ethPrice
 * @param {*} oldEthPrice
 */
async function getGlobalData(ethPrice, oldEthPrice) {
  // data for each day , historic data used for % changes
  let data = {}
  let oneDayData = {}
  let twoDayData = {}

  try {
    // get timestamps for the days
    const utcCurrentTime = dayjs()
    const utcOneDayBack = utcCurrentTime.subtract(1, 'day').unix()
    const utcTwoDaysBack = utcCurrentTime.subtract(2, 'day').unix()

    // get the blocks needed for time travel queries
    let [oneDayBlock, twoDayBlock] = await getBlocksFromTimestamps([utcOneDayBack, utcTwoDaysBack])

    // fetch the global data
    let result = await client.query({
      query: GLOBAL_DATA(),
      fetchPolicy: 'cache-first'
    })
    data = result.data.uniswapFactories[0]

    // fetch the historical data
    let oneDayResult = await client.query({
      query: GLOBAL_DATA(oneDayBlock?.number),
      fetchPolicy: 'cache-first'
    })
    oneDayData = oneDayResult.data.uniswapFactories[0]
    let twoDayResult = await client.query({
      query: GLOBAL_DATA(twoDayBlock?.number),
      fetchPolicy: 'cache-first'
    })
    twoDayData = twoDayResult.data.uniswapFactories[0]

    if (data && oneDayData && twoDayData) {
      let [oneDayVolumeUSD, volumeChangeUSD] = get2DayPercentChange(
        data.untrackedVolumeUSD,
        oneDayData.untrackedVolumeUSD ? oneDayData.untrackedVolumeUSD : 0,
        twoDayData.untrackedVolumeUSD ? twoDayData.untrackedVolumeUSD : 0
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

      // format the total liquidity in USD
      data.totalLiquidityUSD = data.totalLiquidityETH * ethPrice
      const liquidityChangeUSD = getPercentChange(
        data.totalLiquidityETH * ethPrice,
        oneDayData.totalLiquidityETH * oldEthPrice
      )

      // add relevant fields with the calculated amounts
      data.oneDayVolumeUSD = oneDayVolumeUSD
      data.volumeChangeUSD = volumeChangeUSD
      data.oneDayVolumeETH = oneDayVolumeETH
      data.volumeChangeETH = volumeChangeETH
      data.liquidityChangeUSD = liquidityChangeUSD
      data.oneDayTxns = oneDayTxns
      data.txnChange = txnChange
    }
  } catch (e) {
    console.log(e)
  }

  return data
}

/**
 * Get historical data for volume and liquidity used in global charts
 * on main page
 * @param {*} oldestDateToFetch // start of window to fetch from
 */
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

    data = [...result.data.uniswapDayDatas]

    if (data) {
      let dayIndexSet = new Set()
      let dayIndexArray = []
      const oneDay = 24 * 60 * 60

      // for each day, parse the daily volume and format for chart array
      data.forEach((dayData, i) => {
        // add the day index to the set of days
        dayIndexSet.add((data[i].date / oneDay).toFixed(0))
        dayIndexArray.push(data[i])
        dayData.dailyVolumeUSD = parseFloat(dayData.dailyVolumeUSD)
      })

      // fill in empty days ( there will be no day datas if no trades made that day )
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

    // format weekly data for weekly sized chunks
    data = data.sort((a, b) => (parseInt(a.date) > parseInt(b.date) ? 1 : -1))
    let startIndexWeekly = -1
    let currentWeek = -1
    data.forEach((entry, i) => {
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

/**
 * Get and format transactions for global page
 */
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

/**
 * Gets the current price  of ETH, 24 hour price, and % change between them
 */
const getEthPrice = async () => {
  const utcCurrentTime = dayjs()
  const utcOneDayBack = utcCurrentTime
    .subtract(1, 'day')
    .startOf('minute')
    .unix()

  let ethPrice = 0
  let ethPriceOneDay = 0
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
    const currentPrice = result?.data?.bundles[0]?.ethPrice
    const oneDayBackPrice = resultOneDay?.data?.bundles[0]?.ethPrice
    priceChangeETH = getPercentChange(currentPrice, oneDayBackPrice)
    ethPrice = currentPrice
    ethPriceOneDay = oneDayBackPrice
  } catch (e) {
    console.log(e)
  }

  return [ethPrice, ethPriceOneDay, priceChangeETH]
}

/**
 * Loop through every pair on uniswap, used for search
 */
async function getAllPairsOnUniswap() {
  try {
    let allFound = false
    let pairs = []
    let skipCount = 0
    while (!allFound) {
      let result = await client.query({
        query: ALL_PAIRS,
        variables: {
          skip: skipCount
        },
        fetchPolicy: 'cache-first'
      })
      skipCount = skipCount + 500
      pairs = pairs.concat(result?.data?.pairs)
      if (result?.data?.pairs.length < 500 || pairs.length > 500) {
        allFound = true
      }
    }
    return pairs
  } catch (e) {
    console.log(e)
  }
}

/**
 * Loop through every token on uniswap, used for search
 */
async function getAllTokensOnUniswap() {
  try {
    let allFound = false
    let skipCount = 0
    let tokens = []
    while (!allFound) {
      let result = await client.query({
        query: ALL_TOKENS,
        variables: {
          skip: skipCount
        },
        fetchPolicy: 'cache-first'
      })
      tokens = tokens.concat(result?.data?.tokens)
      if (result?.data?.tokens?.length < 500 || tokens.length > 500) {
        allFound = true
      }
      skipCount = skipCount += 500
    }
    return tokens
  } catch (e) {
    console.log(e)
  }
}

/**
 * Hook that fetches overview data, plus all tokens and pairs for search
 */
export function useGlobalData() {
  const [state, { update, updateAllPairsInUniswap, updateAllTokensInUniswap }] = useGlobalDataContext()
  const [ethPrice, oldEthPrice] = useEthPrice()

  const data = state?.globalData

  useEffect(() => {
    async function fetchData() {
      let globalData = await getGlobalData(ethPrice, oldEthPrice)
      globalData && update(globalData)

      let allPairs = await getAllPairsOnUniswap()
      updateAllPairsInUniswap(allPairs)

      let allTokens = await getAllTokensOnUniswap()
      updateAllTokensInUniswap(allTokens)
    }
    if (!data && ethPrice && oldEthPrice) {
      fetchData()
    }
  }, [ethPrice, oldEthPrice, update, data, updateAllPairsInUniswap, updateAllTokensInUniswap])

  return data || {}
}

export function useGlobalChartData() {
  const [state, { updateChart }] = useGlobalDataContext()
  const [oldestDateFetch, setOldestDateFetched] = useState()
  const [activeWindow] = useTimeframe()

  const chartDataDaily = state?.chartData?.daily
  const chartDataWeekly = state?.chartData?.weekly

  /**
   * Keep track of oldest date fetched. Used to
   * limit data fetched until its actually needed.
   * (dont fetch year long stuff unless year option selected)
   */
  useEffect(() => {
    // based on window, get starttime
    let startTime = getTimeframe(activeWindow)

    if ((activeWindow && startTime < oldestDateFetch) || !oldestDateFetch) {
      setOldestDateFetched(startTime)
    }
  }, [activeWindow, oldestDateFetch])

  /**
   * Fetch data if none fetched or older data is needed
   */
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
  const ethPriceOld = state?.['oneDayPrice']
  useEffect(() => {
    async function checkForEthPrice() {
      if (!ethPrice) {
        let [newPrice, oneDayPrice, priceChange] = await getEthPrice()
        updateEthPrice(newPrice, oneDayPrice, priceChange)
      }
    }
    checkForEthPrice()
  }, [ethPrice, updateEthPrice])

  return [ethPrice, ethPriceOld]
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

/**
 * Get the top liquidity positions based on USD size
 * @TODO Not a perfect lookup needs improvement
 */
export function useTopLps() {
  const [state, { updateTopLps }] = useGlobalDataContext()
  let topLps = state?.topLps

  const allPairs = useAllPairData()

  useEffect(() => {
    async function fetchData() {
      // get top 20 by reserves
      let topPairs = Object.keys(allPairs)
        ?.sort((a, b) => parseFloat(allPairs[a].reserveUSD > allPairs[b].reserveUSD ? -1 : 1))
        ?.slice(0, 99)
        .map(pair => pair)

      let topLpLists = await Promise.all(
        topPairs.map(async pair => {
          // for each one, fetch top LPs
          const { data: results } = await client.query({
            query: TOP_LPS_PER_PAIRS,
            variables: {
              pair: pair.toString()
            },
            fetchPolicy: 'cache-first'
          })
          return results.liquidityPositions
        })
      )

      // get the top lps from the results formatted
      const topLps = []
      topLpLists.map(list => {
        return list.map(entry => {
          const pairData = allPairs[entry.pair.id]
          return topLps.push({
            user: entry.user,
            pairName: pairData.token0.symbol + '-' + pairData.token1.symbol,
            pairAddress: entry.pair.id,
            token0: pairData.token0.id,
            token1: pairData.token1.id,
            usd:
              (parseFloat(entry.liquidityTokenBalance) / parseFloat(pairData.totalSupply)) *
              parseFloat(pairData.reserveUSD)
          })
        })
      })

      const sorted = topLps.sort((a, b) => (a.usd > b.usd ? -1 : 1))
      const shorter = sorted.splice(0, 100)
      updateTopLps(shorter)
    }

    if (!topLps && allPairs && Object.keys(allPairs).length > 0) {
      fetchData()
    }
  })

  return topLps
}
