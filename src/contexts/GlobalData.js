import React, { createContext, useContext, useReducer, useMemo, useCallback, useEffect, useState } from 'react'
import dayjs from 'dayjs'
import merge from 'deepmerge'
import utc from 'dayjs/plugin/utc'
import { useTimeframe, useExchangeClients } from './Application'
import {
  getPercentChange,
  getBlockFromTimestamp,
  getBlocksFromTimestamps,
  getTimeframe,
  memoRequest,
  overwriteArrayMerge,
} from '../utils'
import { GLOBAL_DATA, GLOBAL_TXNS, GLOBAL_CHART, ETH_PRICE, ALL_PAIRS, ALL_TOKENS, TOP_LPS_PER_POOLS } from '../apollo/queries'
import weekOfYear from 'dayjs/plugin/weekOfYear'
import { useAllPoolData } from './PoolData'
import { useNetworksInfo } from './NetworkInfo'
import { calculateValuesOnGlobalData } from '../utils/aggregateData'
import { stringify } from 'querystring'
const UPDATE = 'UPDATE'
const UPDATE_TXNS = 'UPDATE_TXNS'
const UPDATE_CHART = 'UPDATE_CHART'
const UPDATE_ETH_PRICE = 'UPDATE_ETH_PRICE'
const ETH_PRICE_KEY = 'ETH_PRICE_KEY'
const UPDATE_ALL_PAIRS_IN_KYBERSWAP = 'UPDATE_ALL_PAIRS_IN_KYBERSWAP'
const UPDATE_ALL_TOKENS_IN_KYBERSWAP = 'UPDATE_ALL_TOKENS_IN_KYBERSWAP'
const UPDATE_TOP_LPS = 'UPDATE_TOP_LPS'
const UPDATE_WHITELIST_TOKEN_MAP = 'UPDATE_WHITELIST_TOKEN_MAP'

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
      const { data, chainId } = payload
      return merge(state, { [chainId]: { globalData: data } })
    }
    case UPDATE_TXNS: {
      const { transactions, chainId } = payload
      return merge(state, { [chainId]: { transactions } })
    }
    case UPDATE_CHART: {
      const { daily, weekly, chainId } = payload
      return merge(state, { [chainId]: { chartData: { daily, weekly } } })
    }
    case UPDATE_ETH_PRICE: {
      const { chainId, ethPrice, oneDayPrice } = payload
      return merge(state, { [chainId]: { [ETH_PRICE_KEY]: ethPrice, oneDayPrice: oneDayPrice } })
    }

    case UPDATE_ALL_PAIRS_IN_KYBERSWAP: {
      const { allPairs, chainId } = payload
      return merge(state, { [chainId]: { allPairs } }, { arrayMerge: overwriteArrayMerge })
    }

    case UPDATE_ALL_TOKENS_IN_KYBERSWAP: {
      const { allTokens, chainId } = payload
      return merge(state, { [chainId]: { allTokens } }, { arrayMerge: overwriteArrayMerge })
    }

    case UPDATE_WHITELIST_TOKEN_MAP: {
      const { whitelistTokenMap, chainId } = payload
      return merge(state, { [chainId]: { whitelistTokenMap } }, { arrayMerge: overwriteArrayMerge })
    }

    case UPDATE_TOP_LPS: {
      const { topLps, chainId } = payload
      return merge(state, { [chainId]: { topLps } }, { arrayMerge: overwriteArrayMerge })
    }
    default: {
      throw Error(`Unexpected action type in DataContext reducer: '${type}'.`)
    }
  }
}

export default function Provider({ children }) {
  const [state, dispatch] = useReducer(reducer, {})
  const update = useCallback((data, chainId) => {
    dispatch({
      type: UPDATE,
      payload: {
        data,
        chainId,
      },
    })
  }, [])

  const updateTransactions = useCallback((transactions, chainId) => {
    dispatch({
      type: UPDATE_TXNS,
      payload: {
        transactions,
        chainId,
      },
    })
  }, [])

  const updateChart = useCallback((daily, weekly, chainId) => {
    dispatch({
      type: UPDATE_CHART,
      payload: {
        daily,
        weekly,
        chainId,
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

  const updateAllPairsInKyberswap = useCallback((allPairs, chainId) => {
    dispatch({
      type: UPDATE_ALL_PAIRS_IN_KYBERSWAP,
      payload: {
        allPairs,
        chainId,
      },
    })
  }, [])

  const updateAllTokensInKyberswap = useCallback((allTokens, chainId) => {
    dispatch({
      type: UPDATE_ALL_TOKENS_IN_KYBERSWAP,
      payload: {
        allTokens,
        chainId,
      },
    })
  }, [])

  const updateAllWhitelistToken = useCallback((whitelistTokenMap, chainId) => {
    dispatch({
      type: UPDATE_WHITELIST_TOKEN_MAP,
      payload: { whitelistTokenMap, chainId },
    })
  }, [])

  const updateTopLps = useCallback((topLps, chainId) => {
    dispatch({
      type: UPDATE_TOP_LPS,
      payload: {
        topLps,
        chainId,
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
            updateAllPairsInKyberswap,
            updateAllTokensInKyberswap,
            updateAllWhitelistToken,
          },
        ],
        [
          state,
          update,
          updateTransactions,
          updateTopLps,
          updateChart,
          updateEthPrice,
          updateAllPairsInKyberswap,
          updateAllTokensInKyberswap,
          updateAllWhitelistToken,
        ]
      )}
    >
      {children}
    </GlobalDataContext.Provider>
  )
}

const mergeFactoriesData = factories => {
  return factories.reduce((merged, factory) => {
    return {
      totalVolumeUSD: parseFloat(merged.totalVolumeUSD) + parseFloat(factory.totalVolumeUSD),
      totalFeeUSD: parseFloat(merged.totalFeeUSD) + parseFloat(factory.totalFeeUSD),
      untrackedVolumeUSD: parseFloat(merged.untrackedVolumeUSD) + parseFloat(factory.untrackedVolumeUSD),
      totalLiquidityUSD: parseFloat(merged.totalLiquidityUSD) + parseFloat(factory.totalLiquidityUSD),
      txCount: parseFloat(merged.txCount) + parseFloat(factory.txCount),
      pairCount: parseFloat(merged.pairCount) + parseFloat(factory.pairCount),
    }
  })
}

/**
 * Gets all the global data for the overview page.
 * Needs current eth price and the old eth price to get
 * 24 hour USD changes.
 * @param {*} ethPrice
 * @param {*} oldEthPrice
 */
async function getGlobalData(client, networksInfo) {
  // data for each day , historic data used for % changes
  let data = {}

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
      query: GLOBAL_DATA(),
      fetchPolicy: 'cache-first',
    })
    data = mergeFactoriesData(result.data.dmmFactories) || {}

    // fetch the historical data
    let oneDayResult = await client.query({
      query: GLOBAL_DATA(oneDayBlock?.number),
      fetchPolicy: 'cache-first',
    })

    data.oneDayData = { ...mergeFactoriesData(oneDayResult.data.dmmFactories) } //preventing fetchPolicy: 'cache-first' returning same object causing circular object

    let twoDayResult = await client.query({
      query: GLOBAL_DATA(twoDayBlock?.number),
      fetchPolicy: 'cache-first',
    })
    data.twoDayData = { ...mergeFactoriesData(twoDayResult.data.dmmFactories) } //preventing fetchPolicy: 'cache-first' returning same object causing circular object

    let oneWeekResult = await client.query({
      query: GLOBAL_DATA(oneWeekBlock?.number),
      fetchPolicy: 'cache-first',
    })
    data.oneWeekData = { ...mergeFactoriesData(oneWeekResult.data.dmmFactories) } //preventing fetchPolicy: 'cache-first' returning same object causing circular object

    let twoWeekResult = await client.query({
      query: GLOBAL_DATA(twoWeekBlock?.number),
      fetchPolicy: 'cache-first',
    })
    data.twoWeekData = { ...mergeFactoriesData(twoWeekResult.data.dmmFactories) } //preventing fetchPolicy: 'cache-first' returning same object causing circular object

    calculateValuesOnGlobalData(data)
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

    if (data.length) {
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
            id: nextDay / 86400 + '',
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
const getEthPrice = async (client, networkInfo) => {
  const run = async () => {
    if (!client) {
      return [0, 0, 0]
    }

    const utcCurrentTime = dayjs()
    const utcOneDayBack = utcCurrentTime.subtract(1, 'day').startOf('minute').unix()

    let ethPrice = 0
    let ethPriceOneDay = 0
    let priceChangeETH = 0

    try {
      let oneDayBlock = await getBlockFromTimestamp(utcOneDayBack, networkInfo)
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
  return await memoRequest(run, 'getEthPrice' + networkInfo.chainId, 10000)
}

const PAIRS_TO_FETCH = 500
const TOKENS_TO_FETCH = 500

/**
 * Loop through every pair on kyberswap, used for search
 */
async function getAllPairsOnKyberswap(client) {
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
 * Loop through every token on kyberswap, used for search
 */
async function getAllTokensOnKyberswap(client) {
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
  const exchangeSubgraphClient = useExchangeClients()
  const [
    state,
    { update, updateAllPairsInKyberswap, updateAllTokensInKyberswap, updateAllWhitelistToken },
  ] = useGlobalDataContext()
  const [ethPrice, oldEthPrice] = useEthPrice()
  const [networksInfo] = useNetworksInfo()
  const data = networksInfo.map(networkInfo => state?.[networkInfo.chainId]?.globalData)

  useEffect(() => {
    async function fetchData(index) {
      let globalData = await getGlobalData(exchangeSubgraphClient[index], networksInfo[index])
      globalData && update(globalData, networksInfo[index].chainId)

      const [allPairs, whitelistTokenMap, allTokens] = await Promise.all([
        getAllPairsOnKyberswap(exchangeSubgraphClient[index]),
        getWhitelistToken(networksInfo[index].chainId),
        getAllTokensOnKyberswap(exchangeSubgraphClient[index]),
      ])

      allPairs?.forEach(allPair => (allPair.chainId = networksInfo[index].chainId))
      updateAllPairsInKyberswap(allPairs, networksInfo[index].chainId)

      updateAllWhitelistToken(whitelistTokenMap, networksInfo[index].chainId)

      allTokens?.forEach(allToken => (allToken.chainId = networksInfo[index].chainId))
      updateAllTokensInKyberswap(allTokens, networksInfo[index].chainId)
    }

    networksInfo.forEach((networkInfo, index) => {
      if (!data[index] && ethPrice[index] && oldEthPrice[index]) {
        memoRequest(() => fetchData(index), 'useGlobalData' + networkInfo.chainId, 10000)
      }
    })
  }, [
    ethPrice,
    oldEthPrice,
    update,
    data,
    updateAllPairsInKyberswap,
    updateAllTokensInKyberswap,
    exchangeSubgraphClient,
    networksInfo,
    updateAllWhitelistToken,
  ])

  return data || []
}

export function useGlobalChartData() {
  const exchangeSubgraphClient = useExchangeClients()
  const [state, { updateChart }] = useGlobalDataContext()
  const [oldestDateFetch, setOldestDateFetched] = useState([])
  const [activeWindow] = useTimeframe()
  const [networksInfo] = useNetworksInfo()
  const chartDataDaily = networksInfo.map(networkInfo => state?.[networkInfo.chainId]?.chartData?.daily)
  const chartDataWeekly = networksInfo.map(networkInfo => state?.[networkInfo.chainId]?.chartData?.weekly)

  /**
   * Keep track of oldest date fetched. Used to
   * limit data fetched until its actually needed.
   * (dont fetch year long stuff unless year option selected)
   */
  useEffect(() => {
    networksInfo.forEach((networkInfo, index) => {
      // based on window, get starttime
      let startTime = getTimeframe(activeWindow[index])

      if ((activeWindow[index] && startTime < oldestDateFetch[index]) || !oldestDateFetch[index]) {
        setOldestDateFetched(oldestDateFetch => ((oldestDateFetch[index] = startTime), oldestDateFetch))
      }
    })
  }, [activeWindow, networksInfo, oldestDateFetch])

  /**
   * Fetch data if none fetched or older data is needed
   */
  useEffect(() => {
    async function fetchData(index) {
      // historical stuff for chart
      let [newChartData, newWeeklyData] = await getChartData(exchangeSubgraphClient[index], oldestDateFetch[index])
      updateChart(newChartData, newWeeklyData, networksInfo[index].chainId)
    }
    networksInfo.forEach((networkInfo, index) => {
      if (oldestDateFetch[index] && !(chartDataDaily[index] && chartDataWeekly[index])) {
        memoRequest(() => fetchData(index), 'useGlobalChartData' + networkInfo.chainId, 10000)
      }
    })
  }, [chartDataDaily, chartDataWeekly, oldestDateFetch, updateChart, exchangeSubgraphClient, networksInfo])

  return [chartDataDaily, chartDataWeekly]
}

export function useGlobalTransactions() {
  const exchangeSubgraphClient = useExchangeClients()
  const [state, { updateTransactions }] = useGlobalDataContext()
  const [networksInfo] = useNetworksInfo()
  const transactions = networksInfo.map(networkInfo => state?.[networkInfo.chainId]?.transactions)

  // useEffect(() => {
  //   updateTransactions()
  // }, [exchangeSubgraphClient, updateTransactions])

  useEffect(() => {
    async function fetchData(index) {
      let transactions = await getGlobalTransactions(exchangeSubgraphClient[index])
      transactions.burns?.forEach(burn => (burn.chainId = networksInfo[index].chainId))
      transactions.mints?.forEach(mint => (mint.chainId = networksInfo[index].chainId))
      transactions.swaps?.forEach(swap => (swap.chainId = networksInfo[index].chainId))
      updateTransactions(transactions, networksInfo[index].chainId)
    }
    networksInfo.forEach((networkInfo, index) => {
      if (!transactions[index]) {
        memoRequest(() => fetchData(index), 'useGlobalTransactions' + networkInfo.chainId, 10000)
      }
    })
  }, [updateTransactions, exchangeSubgraphClient, networksInfo, transactions])
  return transactions
}

export function useEthPrice() {
  const [networksInfo] = useNetworksInfo()
  const exchangeSubgraphClient = useExchangeClients()
  const [state, { updateEthPrice }] = useGlobalDataContext()
  const ethPrice = networksInfo.map(networkInfo => state?.[networkInfo.chainId]?.[ETH_PRICE_KEY])
  const ethPriceOld = networksInfo.map(networkInfo => state?.[networkInfo.chainId]?.oneDayPrice)

  useEffect(() => {
    let timeoutToken
    async function checkForEthPrice(index) {
      let [newPrice, oneDayPrice, priceChange] = await getEthPrice(exchangeSubgraphClient[index], networksInfo[index])
      updateEthPrice(networksInfo[index].chainId, newPrice, oneDayPrice, priceChange)
      timeoutToken = setTimeout(() => updateEthPrice(networksInfo[index].chainId, 0, 0, 0), 30000)
    }
    networksInfo.forEach((networkInfo, index) => {
      if (!ethPrice[index]) {
        memoRequest(() => checkForEthPrice(index), 'useEthPrice' + networkInfo.chainId, 10000)
      }
    })
    return () => timeoutToken && clearTimeout(timeoutToken)
  }, [ethPrice, updateEthPrice, exchangeSubgraphClient, networksInfo])

  return [ethPrice, ethPriceOld]
}

export function useAllPairsInKyberswap() {
  const [state] = useGlobalDataContext()
  const [[networkInfo]] = useNetworksInfo()
  const allPairs = state?.[networkInfo.chainId]?.allPairs

  return allPairs || []
}

export function useAllTokensInKyberswap() {
  const [state] = useGlobalDataContext()
  const [[networkInfo]] = useNetworksInfo()
  const allTokens = state?.[networkInfo.chainId]?.allTokens

  return allTokens || []
}

export function useWhitelistTokensMap(chainId) {
  const [state] = useGlobalDataContext()
  const allTokens = state?.[chainId]?.whitelistTokenMap

  return allTokens || {}
}

/**
 * Get the top liquidity positions based on USD size
 * @TODO Not a perfect lookup needs improvement
 */
export function useTopLps() {
  const exchangeSubgraphClient = useExchangeClients()
  const [state, { updateTopLps }] = useGlobalDataContext()
  const allPools = useAllPoolData()
  const [networksInfo] = useNetworksInfo()
  const topLps = networksInfo.map(networkInfo => state?.[networkInfo.chainId]?.topLps)

  useEffect(() => {
    async function fetchData(index) {
      // get top 20 by reserves
      let topPools = Object.keys(allPools[index])
        ?.sort((a, b) => parseFloat(allPools[index][a].reserveUSD > allPools[index][b].reserveUSD ? -1 : 1))
        ?.slice(0, 99)
        .map(pool => pool)

      let topLpLists = await Promise.all(
        topPools.map(async pool => {
          // for each one, fetch top LPs
          try {
            const { data: results } = await exchangeSubgraphClient[index].query({
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
        .filter(Boolean) // check for ones not fetched correctly
        .forEach(list => {
          list.forEach(entry => {
            const poolData = allPools[index][entry.pool.id]
            topLps.push({
              user: entry.user,
              pairName: poolData.token0.symbol + '-' + poolData.token1.symbol,
              pairAddress: entry.pair.id,
              poolAddress: entry.pool.id,
              token0: poolData.token0.id,
              token1: poolData.token1.id,
              usd: (parseFloat(entry.liquidityTokenBalance) / parseFloat(poolData.totalSupply)) * parseFloat(poolData.reserveUSD),
              chainId: networksInfo[index].chainId,
            })
          })
        })

      const sorted = topLps.sort((a, b) => (a.usd > b.usd ? -1 : 1))
      const shorter = sorted.splice(0, 100)
      updateTopLps(shorter, networksInfo[index].chainId)
    }
    networksInfo.forEach((networkInfo, index) => {
      if (!topLps[index] && allPools[index] && Object.keys(allPools[index]).length > 0) {
        memoRequest(() => fetchData(index), 'useTopLps' + networkInfo.chainId, 10000)
      }
    })
  })

  return topLps
}

function formatWhitelistToken(tokens) {
  return tokens.reduce((tokenMap, token) => {
    const address = token.address || ''
    if (address) tokenMap[address] = token
    return tokenMap
  }, {})
}

// loop to fetch all whitelist token
async function getWhitelistToken(chainId) {
  let tokens = []
  try {
    const pageSize = 100
    const maximumPage = 15
    let page = 1
    while (true) {
      const { data } = await fetch(
        `${process.env.REACT_APP_KS_SETTING_API}/v1/tokens?${stringify({
          pageSize,
          page,
          isWhitelisted: true,
          chainIds: chainId,
        })}`
      ).then(data => data.json())
      page++
      const tokensResponse = data.tokens ?? []
      tokens = tokens.concat(tokensResponse)
      if (tokensResponse.length < pageSize || page >= maximumPage) break // out of tokens, and prevent infinity loop
    }
  } catch (error) {
    console.log(`Failed to fetch list token of chainId ${chainId}`)
  }
  return formatWhitelistToken(tokens)
}
