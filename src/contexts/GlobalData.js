import React, { createContext, useContext, useReducer, useMemo, useCallback, useEffect, useState, useRef } from 'react'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { useTimeframe, useExchangeClient } from './Application'
import { getPercentChange, getBlockFromTimestamp, getBlocksFromTimestamps, get2DayPercentChange, getTimeframe } from '../utils'
import { GLOBAL_DATA, GLOBAL_TXNS, GLOBAL_CHART, ETH_PRICE, ALL_PAIRS, ALL_TOKENS, TOP_LPS_PER_POOLS } from '../apollo/queries'
import weekOfYear from 'dayjs/plugin/weekOfYear'
import { useAllPoolData } from './PoolData'
import { useNetworksInfo as useNetworkInfo } from './NetworkInfo'
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
        globalData: data,
      }
    }
    case UPDATE_TXNS: {
      const { transactions } = payload
      return {
        ...state,
        transactions,
      }
    }
    case UPDATE_CHART: {
      const { daily, weekly } = payload
      return {
        ...state,
        chartData: {
          daily,
          weekly,
        },
      }
    }
    case UPDATE_ETH_PRICE: {
      const { chainId, ethPrice, oneDayPrice } = payload
      return {
        [ETH_PRICE_KEY]: { [chainId]: ethPrice },
        oneDayPrice: { [chainId]: oneDayPrice },
      }
    }

    case UPDATE_ALL_PAIRS_IN_UNISWAP: {
      const { allPairs } = payload
      return {
        ...state,
        allPairs,
      }
    }

    case UPDATE_ALL_TOKENS_IN_UNISWAP: {
      const { allTokens } = payload
      return {
        ...state,
        allTokens,
      }
    }

    case UPDATE_TOP_LPS: {
      const { topLps } = payload
      return {
        ...state,
        topLps,
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
        data,
      },
    })
  }, [])

  const updateTransactions = useCallback(transactions => {
    dispatch({
      type: UPDATE_TXNS,
      payload: {
        transactions,
      },
    })
  }, [])

  const updateChart = useCallback((daily, weekly) => {
    dispatch({
      type: UPDATE_CHART,
      payload: {
        daily,
        weekly,
      },
    })
  }, [])

  const updateEthPrice = useCallback((chainId, ethPrice, oneDayPrice) => {
    dispatch({
      type: UPDATE_ETH_PRICE,
      payload: {
        chainId,
        ethPrice,
        oneDayPrice,
      },
    })
  }, [])

  const updateAllPairsInUniswap = useCallback(allPairs => {
    dispatch({
      type: UPDATE_ALL_PAIRS_IN_UNISWAP,
      payload: {
        allPairs,
      },
    })
  }, [])

  const updateAllTokensInUniswap = useCallback(allTokens => {
    dispatch({
      type: UPDATE_ALL_TOKENS_IN_UNISWAP,
      payload: {
        allTokens,
      },
    })
  }, [])

  const updateTopLps = useCallback(topLps => {
    dispatch({
      type: UPDATE_TOP_LPS,
      payload: {
        topLps,
      },
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
            updateAllTokensInUniswap,
          },
        ],
        [
          state,
          update,
          updateTransactions,
          updateTopLps,
          updateChart,
          updateEthPrice,
          updateAllPairsInUniswap,
          updateAllTokensInUniswap,
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
async function getGlobalData(client, ethPrice, oldEthPrice, networksInfo) {
  // data for each day , historic data used for % changes
  let data = {}
  let oneDayData = {}
  let twoDayData = {}

  try {
    // get timestamps for the days
    const utcCurrentTime = dayjs()
    const utcOneDayBack = utcCurrentTime.subtract(1, 'day').unix()
    const utcTwoDaysBack = utcCurrentTime.subtract(2, 'day').unix()
    const utcOneWeekBack = utcCurrentTime.subtract(1, 'week').unix()
    const utcTwoWeeksBack = utcCurrentTime.subtract(2, 'week').unix()

    // get the blocks needed for time travel queries
    let [oneDayBlock, twoDayBlock, oneWeekBlock, twoWeekBlock] = await getBlocksFromTimestamps(
      [utcOneDayBack, utcTwoDaysBack, utcOneWeekBack, utcTwoWeeksBack],
      networksInfo
    )

    // fetch the global data
    let result = await client.query({
      query: GLOBAL_DATA(networksInfo),
      fetchPolicy: 'cache-first',
    })
    data = result.data.dmmFactories[0]

    // fetch the historical data
    let oneDayResult = await client.query({
      query: GLOBAL_DATA(networksInfo, oneDayBlock?.number),
      fetchPolicy: 'cache-first',
    })

    oneDayData = oneDayResult.data.dmmFactories[0]

    let twoDayResult = await client.query({
      query: GLOBAL_DATA(networksInfo, twoDayBlock?.number),
      fetchPolicy: 'cache-first',
    })
    twoDayData = twoDayResult.data.dmmFactories[0]

    let oneWeekResult = await client.query({
      query: GLOBAL_DATA(networksInfo, oneWeekBlock?.number),
      fetchPolicy: 'cache-first',
    })
    const oneWeekData = oneWeekResult.data.dmmFactories[0]

    let twoWeekResult = await client.query({
      query: GLOBAL_DATA(networksInfo, twoWeekBlock?.number),
      fetchPolicy: 'cache-first',
    })
    const twoWeekData = twoWeekResult.data.dmmFactories[0]

    if (data) {
      let [oneDayVolumeUSD, volumeChangeUSD] = get2DayPercentChange(
        data ? data.totalVolumeUSD : 0,
        oneDayData && oneDayData.totalVolumeUSD ? oneDayData.totalVolumeUSD : 0,
        twoDayData && twoDayData.totalVolumeUSD ? twoDayData.totalVolumeUSD : 0
      )

      let [oneDayFeeUSD, oneDayFeeChange] = get2DayPercentChange(
        data ? data.totalFeeUSD : 0,
        oneDayData && oneDayData.totalFeeUSD ? oneDayData.totalFeeUSD : 0,
        twoDayData && twoDayData.totalFeeUSD ? twoDayData.totalFeeUSD : 0
      )

      const [oneDayTxns, txnChange] = get2DayPercentChange(
        data ? data.txCount : 0,
        oneDayData && oneDayData.txCount ? oneDayData.txCount : 0,
        twoDayData && twoDayData.txCount ? twoDayData.txCount : 0
      )

      data.totalLiquidityUSD = data.totalLiquidityETH * ethPrice
      const liquidityChangeUSD = getPercentChange(
        data && ethPrice ? data.totalLiquidityETH * ethPrice : 0,
        oneDayData && oldEthPrice ? oneDayData.totalLiquidityETH * oldEthPrice : 0
      )

      data.oneDayVolumeUSD = oneDayVolumeUSD
      data.volumeChangeUSD = volumeChangeUSD
      data.oneDayFeeUSD = oneDayFeeUSD
      data.oneDayFeeChange = oneDayFeeChange
      data.liquidityChangeUSD = liquidityChangeUSD
      data.oneDayTxns = oneDayTxns
      data.txnChange = txnChange
    }

    if (data && oneWeekData && twoWeekData) {
      const [oneWeekVolume, weeklyVolumeChange] = get2DayPercentChange(
        data ? data.totalVolumeUSD : 0,
        oneWeekData ? oneWeekData.totalVolumeUSD : 0,
        twoWeekData ? twoWeekData.totalVolumeUSD : 0
      )
      data.oneWeekVolume = oneWeekVolume
      data.weeklyVolumeChange = weeklyVolumeChange
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
const getChartData = async (client, oldestDateToFetch) => {
  let data = []
  let weeklyData = []
  const utcEndTime = dayjs.utc()
  let skip = 0
  let allFound = false

  try {
    while (!allFound) {
      let result = await client.query({
        query: GLOBAL_CHART,
        variables: {
          startTime: oldestDateToFetch,
          skip,
        },
        fetchPolicy: 'cache-first',
      })
      skip += 1000
      data = data.concat(result.data.dmmDayDatas)
      if (result.data.dmmDayDatas.length < 1000) {
        allFound = true
      }
    }

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
      let timestamp = data[0] && data[0].date ? data[0].date : oldestDateToFetch
      let latestLiquidityUSD = data[0] ? data[0].totalLiquidityUSD : 0
      let latestDayDats = data[0] ? data[0].mostLiquidTokens : 0
      let index = 1
      while (timestamp < utcEndTime.unix() - oneDay) {
        const nextDay = timestamp + oneDay
        let currentDayIndex = (nextDay / oneDay).toFixed(0)
        if (!dayIndexSet.has(currentDayIndex)) {
          data.push({
            date: nextDay,
            dailyVolumeUSD: 0,
            totalLiquidityUSD: latestLiquidityUSD,
            mostLiquidTokens: latestDayDats,
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
      weeklyData[startIndexWeekly].weeklyVolumeUSD = (weeklyData[startIndexWeekly].weeklyVolumeUSD ?? 0) + data[i].dailyVolumeUSD
    })
  } catch (e) {
    console.log(e)
  }
  return [data, weeklyData]
}

/**
 * Get and format transactions for global page
 */
const getGlobalTransactions = async client => {
  let transactions = {}

  try {
    let result = await client.query({
      query: GLOBAL_TXNS,
      fetchPolicy: 'cache-first',
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
const getEthPrice = async (client, networksInfo) => {
  if (!client) {
    return [0, 0, 0]
  }

  const utcCurrentTime = dayjs()
  const utcOneDayBack = utcCurrentTime.subtract(1, 'day').startOf('minute').unix()

  let ethPrice = 0
  let ethPriceOneDay = 0
  let priceChangeETH = 0

  try {
    let oneDayBlock = await getBlockFromTimestamp(utcOneDayBack, networksInfo)
    let result = await client.query({
      query: ETH_PRICE(),
      fetchPolicy: 'cache-first',
    })
    let resultOneDay = await client.query({
      query: ETH_PRICE(oneDayBlock),
      fetchPolicy: 'cache-first',
    })
    const currentPrice = result?.data?.bundles[0]?.ethPrice
    const oneDayBackPrice = resultOneDay?.data?.bundles[0]?.ethPrice
    priceChangeETH = getPercentChange(currentPrice, oneDayBackPrice)
    ethPrice = currentPrice || 0
    ethPriceOneDay = oneDayBackPrice || currentPrice
  } catch (e) {
    console.log(e)
  }

  return [ethPrice, ethPriceOneDay, priceChangeETH]
}

const PAIRS_TO_FETCH = 500
const TOKENS_TO_FETCH = 500

/**
 * Loop through every pair on uniswap, used for search
 */
async function getAllPairsOnUniswap(client) {
  try {
    let allFound = false
    let pairs = []
    let skipCount = 0
    while (!allFound) {
      let result = await client.query({
        query: ALL_PAIRS,
        variables: {
          skip: skipCount,
        },
        fetchPolicy: 'cache-first',
      })
      skipCount = skipCount + PAIRS_TO_FETCH
      pairs = pairs.concat(result?.data?.pairs)
      if (result?.data?.pairs.length < PAIRS_TO_FETCH || pairs.length > PAIRS_TO_FETCH) {
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
async function getAllTokensOnUniswap(client) {
  try {
    let allFound = false
    let skipCount = 0
    let tokens = []
    while (!allFound) {
      let result = await client.query({
        query: ALL_TOKENS,
        variables: {
          skip: skipCount,
        },
        fetchPolicy: 'cache-first',
      })
      tokens = tokens.concat(result?.data?.tokens)
      if (result?.data?.tokens?.length < TOKENS_TO_FETCH || tokens.length > TOKENS_TO_FETCH) {
        allFound = true
      }
      skipCount = skipCount += TOKENS_TO_FETCH
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
  const exchangeSubgraphClient = useExchangeClient()
  const [state, { update, updateAllPairsInUniswap, updateAllTokensInUniswap }] = useGlobalDataContext()
  const [ethPrice, oldEthPrice] = useEthPrice()
  const [networksInfo] = useNetworkInfo()

  const data = state?.globalData
  const mounted = useRef()

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true
    } else {
      update()
      updateAllPairsInUniswap()
      updateAllTokensInUniswap()
    }
  }, [exchangeSubgraphClient, update, updateAllPairsInUniswap, updateAllTokensInUniswap])

  useEffect(() => {
    async function fetchData() {
      let globalData = await getGlobalData(exchangeSubgraphClient, ethPrice, oldEthPrice, networksInfo)
      globalData && update(globalData)

      let allPairs = await getAllPairsOnUniswap(exchangeSubgraphClient)
      updateAllPairsInUniswap(allPairs)

      let allTokens = await getAllTokensOnUniswap(exchangeSubgraphClient)
      updateAllTokensInUniswap(allTokens)
    }

    if (!data && ethPrice && oldEthPrice) {
      fetchData()
    }
  }, [
    ethPrice,
    oldEthPrice,
    update,
    data,
    updateAllPairsInUniswap,
    updateAllTokensInUniswap,
    exchangeSubgraphClient,
    networksInfo,
  ])

  return data || {}
}

export function useGlobalChartData() {
  const exchangeSubgraphClient = useExchangeClient()
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
      let [newChartData, newWeeklyData] = await getChartData(exchangeSubgraphClient, oldestDateFetch)
      updateChart(newChartData, newWeeklyData)
    }
    if (oldestDateFetch && !(chartDataDaily && chartDataWeekly)) {
      fetchData()
    }
  }, [chartDataDaily, chartDataWeekly, oldestDateFetch, updateChart, exchangeSubgraphClient])

  return [chartDataDaily, chartDataWeekly]
}

export function useGlobalTransactions() {
  const exchangeSubgraphClient = useExchangeClient()
  const [state, { updateTransactions }] = useGlobalDataContext()
  const transactions = state?.transactions

  useEffect(() => {
    updateTransactions()
  }, [exchangeSubgraphClient, updateTransactions])

  useEffect(() => {
    async function fetchData() {
      if (!transactions) {
        let txns = await getGlobalTransactions(exchangeSubgraphClient)
        updateTransactions(txns)
      }
    }
    fetchData()
  }, [updateTransactions, transactions, exchangeSubgraphClient])
  return transactions
}

export function useEthPrice(networkInfoParams) {
  const exchangeSubgraphClient = useExchangeClient()
  const [state, { updateEthPrice }] = useGlobalDataContext()
  const [currentNetworkInfo] = useNetworkInfo()
  const networkInfo = networkInfoParams || currentNetworkInfo
  const ethPrice = state?.[ETH_PRICE_KEY]?.[networkInfo.CHAIN_ID]
  const ethPriceOld = state?.oneDayPrice?.[networkInfo.CHAIN_ID]
  const mounted = useRef()

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true
    } else {
      updateEthPrice(networkInfo.CHAIN_ID)
    }
  }, [networkInfo, updateEthPrice])

  useEffect(() => {
    async function checkForEthPrice() {
      if (!ethPrice) {
        let [newPrice, oneDayPrice, priceChange] = await getEthPrice(exchangeSubgraphClient, networkInfo)
        updateEthPrice(networkInfo.CHAIN_ID, newPrice, oneDayPrice, priceChange)
      }
    }
    checkForEthPrice()
  }, [ethPrice, updateEthPrice, exchangeSubgraphClient, networkInfo])

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
  const exchangeSubgraphClient = useExchangeClient()
  const [state, { updateTopLps }] = useGlobalDataContext()
  let topLps = state?.topLps

  const allPools = useAllPoolData()

  useEffect(() => {
    async function fetchData() {
      // get top 20 by reserves
      let topPools = Object.keys(allPools)
        ?.sort((a, b) => parseFloat(allPools[a].reserveUSD > allPools[b].reserveUSD ? -1 : 1))
        ?.slice(0, 99)
        .map(pool => pool)

      let topLpLists = await Promise.all(
        topPools.map(async pool => {
          // for each one, fetch top LPs
          try {
            const { data: results } = await exchangeSubgraphClient.query({
              query: TOP_LPS_PER_POOLS,
              variables: {
                pool: pool.toString(),
              },
              fetchPolicy: 'cache-first',
            })
            if (results) {
              return results.liquidityPositions
            }
          } catch (e) {}
        })
      )

      // get the top lps from the results formatted
      const topLps = []
      topLpLists
        .filter(i => !!i) // check for ones not fetched correctly
        .map(list => {
          return list.map(entry => {
            const poolData = allPools[entry.pool.id]
            return topLps.push({
              user: entry.user,
              pairName: poolData.token0.symbol + '-' + poolData.token1.symbol,
              pairAddress: entry.pair.id,
              poolAddress: entry.pool.id,
              token0: poolData.token0.id,
              token1: poolData.token1.id,
              usd: (parseFloat(entry.liquidityTokenBalance) / parseFloat(poolData.totalSupply)) * parseFloat(poolData.reserveUSD),
            })
          })
        })

      const sorted = topLps.sort((a, b) => (a.usd > b.usd ? -1 : 1))
      const shorter = sorted.splice(0, 100)
      updateTopLps(shorter)
    }

    if (!topLps && allPools && Object.keys(allPools).length > 0) {
      fetchData()
    }
  })

  return topLps
}
