import { createContext, useContext, useReducer, useMemo, useCallback, useEffect, useState } from 'react'
import { client } from '../apollo/client'
import dayjs from 'dayjs'
import { useTimeframe, useActiveNetworkId } from 'state/features/application/hooks'
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
import { useAllPairData } from './PairData'
import { EthereumNetworkInfo, TronNetworkInfo } from 'constants/networks'
const UPDATE = 'UPDATE'
const UPDATE_TXNS = 'UPDATE_TXNS'
const UPDATE_CHART = 'UPDATE_CHART'
const UPDATE_PRICE = 'UPDATE_PRICE'
const UPDATE_ALL_PAIRS_IN_UNISWAP = 'UPDAUPDATE_ALL_PAIRS_IN_UNISWAPTE_TOP_PAIRS'
const UPDATE_ALL_TOKENS_IN_UNISWAP = 'UPDATE_ALL_TOKENS_IN_UNISWAP'
const UPDATE_TOP_LPS = 'UPDATE_TOP_LPS'

const GlobalDataContext = createContext()

function useGlobalDataContext() {
  return useContext(GlobalDataContext)
}

const initialGlobalNetworkState = {
  globalData: undefined,
  chartData: undefined,
  transactions: undefined,
  topLps: undefined,
  allPairs: [],
  allTokens: [],
  price: '',
  oneDayPrice: '',
  priceChange: 0
}

const INITIAL_STATE = {
  [EthereumNetworkInfo.id]: initialGlobalNetworkState,
  [TronNetworkInfo.id]: initialGlobalNetworkState
}

function reducer(state, { type, payload }) {
  switch (type) {
    case UPDATE: {
      const { data, networkId } = payload
      return {
        ...state,
        [networkId]: {
          ...state[networkId],
          globalData: data
        }
      }
    }
    case UPDATE_TXNS: {
      const { transactions, networkId } = payload
      return {
        ...state,
        [networkId]: {
          ...state[networkId],
          transactions
        }
      }
    }
    case UPDATE_CHART: {
      const { daily, weekly, networkId } = payload
      return {
        ...state,
        [networkId]: {
          ...state[networkId],
          chartData: {
            daily,
            weekly
          }
        }
      }
    }
    case UPDATE_PRICE: {
      const { price, oneDayPrice, priceChange, networkId } = payload
      return {
        ...state,
        [networkId]: {
          ...state[networkId],
          price,
          oneDayPrice,
          priceChange
        }
      }
    }

    case UPDATE_ALL_PAIRS_IN_UNISWAP: {
      const { allPairs, networkId } = payload
      return {
        ...state,
        [networkId]: {
          ...state[networkId],
          allPairs
        }
      }
    }

    case UPDATE_ALL_TOKENS_IN_UNISWAP: {
      const { allTokens, networkId } = payload
      return {
        ...state,
        [networkId]: {
          ...state[networkId],
          allTokens
        }
      }
    }

    case UPDATE_TOP_LPS: {
      const { topLps, networkId } = payload
      return {
        ...state,
        [networkId]: {
          ...state[networkId],
          topLps
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
  const update = useCallback(({ data, networkId }) => {
    dispatch({
      type: UPDATE,
      payload: {
        data,
        networkId
      }
    })
  }, [])

  const updateTransactions = useCallback(({ transactions, networkId }) => {
    dispatch({
      type: UPDATE_TXNS,
      payload: {
        transactions,
        networkId
      }
    })
  }, [])

  const updateChart = useCallback(({ daily, weekly, networkId }) => {
    dispatch({
      type: UPDATE_CHART,
      payload: {
        daily,
        weekly,
        networkId
      }
    })
  }, [])

  const updatePrice = useCallback(({ price, oneDayPrice, priceChange, networkId }) => {
    dispatch({
      type: UPDATE_PRICE,
      payload: {
        price,
        oneDayPrice,
        priceChange,
        networkId
      }
    })
  }, [])

  const updateAllPairsInUniswap = useCallback(({ allPairs, networkId }) => {
    dispatch({
      type: UPDATE_ALL_PAIRS_IN_UNISWAP,
      payload: {
        allPairs,
        networkId
      }
    })
  }, [])

  const updateAllTokensInUniswap = useCallback(({ allTokens, networkId }) => {
    dispatch({
      type: UPDATE_ALL_TOKENS_IN_UNISWAP,
      payload: {
        allTokens,
        networkId
      }
    })
  }, [])

  const updateTopLps = useCallback(({ topLps, networkId }) => {
    dispatch({
      type: UPDATE_TOP_LPS,
      payload: {
        topLps,
        networkId
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
            updatePrice,
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
          updatePrice,
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
 * @param {*} price
 * @param {*} oldPrice
 */
async function getGlobalData(price, oldPrice) {
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
    let [oneDayBlock, twoDayBlock, oneWeekBlock, twoWeekBlock] = await getBlocksFromTimestamps([
      utcOneDayBack,
      utcTwoDaysBack,
      utcOneWeekBack,
      utcTwoWeeksBack
    ])

    // fetch the global data
    let result = await client.query({
      query: GLOBAL_DATA(),
      fetchPolicy: 'cache-first'
    })
    data = result.data.whiteSwapFactories[0]

    // fetch the historical data
    let oneDayResult = await client.query({
      query: GLOBAL_DATA(oneDayBlock?.number),
      fetchPolicy: 'cache-first'
    })
    oneDayData = oneDayResult.data.whiteSwapFactories[0]

    let twoDayResult = await client.query({
      query: GLOBAL_DATA(twoDayBlock?.number),
      fetchPolicy: 'cache-first'
    })
    twoDayData = twoDayResult.data.whiteSwapFactories[0]

    let oneWeekResult = await client.query({
      query: GLOBAL_DATA(oneWeekBlock?.number),
      fetchPolicy: 'cache-first'
    })
    const oneWeekData = oneWeekResult.data.whiteSwapFactories[0]

    let twoWeekResult = await client.query({
      query: GLOBAL_DATA(twoWeekBlock?.number),
      fetchPolicy: 'cache-first'
    })
    const twoWeekData = twoWeekResult.data.whiteSwapFactories[0]

    if (data && oneDayData && twoDayData) {
      let [oneDayVolumeUSD, volumeChangeUSD] = get2DayPercentChange(
        data.totalVolumeUSD,
        oneDayData.totalVolumeUSD ? oneDayData.totalVolumeUSD : 0,
        twoDayData.totalVolumeUSD ? twoDayData.totalVolumeUSD : 0
      )

      const [oneDayTxns, txnChange] = get2DayPercentChange(
        data.txCount,
        oneDayData.txCount ? oneDayData.txCount : 0,
        twoDayData.txCount ? twoDayData.txCount : 0
      )

      // format the total liquidity in USD
      data.totalLiquidityUSD = data.totalLiquidityETH * price
      const liquidityChangeUSD = getPercentChange(
        data.totalLiquidityETH * price,
        oneDayData.totalLiquidityETH * oldPrice
      )

      // add relevant fields with the calculated amounts
      data.oneDayVolumeUSD = oneDayVolumeUSD

      data.volumeChangeUSD = volumeChangeUSD
      data.liquidityChangeUSD = liquidityChangeUSD
      data.oneDayTxns = oneDayTxns
      data.txnChange = txnChange
    }

    if (data && oneDayData && twoDayData && twoWeekData) {
      const [oneWeekVolume, weeklyVolumeChange] = get2DayPercentChange(
        data.totalVolumeUSD,
        oneWeekData.totalVolumeUSD,
        twoWeekData.totalVolumeUSD
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
const getChartData = async oldestDateToFetch => {
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
          skip
        },
        fetchPolicy: 'cache-first'
      })
      skip += 1000
      data = data.concat(result.data.whiteSwapDayDatas)
      if (result.data.whiteSwapDayDatas.length < 1000) {
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
      weeklyData[startIndexWeekly].weeklyVolumeUSD =
        (weeklyData[startIndexWeekly].weeklyVolumeUSD ?? 0) + data[i].dailyVolumeUSD
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
const getPrice = async () => {
  const utcCurrentTime = dayjs()
  const utcOneDayBack = utcCurrentTime.subtract(1, 'day').startOf('minute').unix()

  let price = 0
  let priceOneDay = 0
  let priceChange = 0

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
    priceChange = getPercentChange(currentPrice, oneDayBackPrice)
    price = currentPrice
    priceOneDay = oneDayBackPrice
  } catch (e) {
    console.log(e)
  }

  return [price, priceOneDay, priceChange]
}

const PAIRS_TO_FETCH = 500
const TOKENS_TO_FETCH = 500

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
  const [state, { update, updateAllPairsInUniswap, updateAllTokensInUniswap }] = useGlobalDataContext()
  const activeNetwork = useActiveNetworkId()
  const [price, oldPrice] = useEthPrice()
  const data = state[activeNetwork]?.globalData

  useEffect(() => {
    async function fetchData() {
      let globalData = await getGlobalData(price, oldPrice)
      globalData && update({ data: globalData, networkId: activeNetwork })

      let allPairs = await getAllPairsOnUniswap()
      updateAllPairsInUniswap({ allPairs, networkId: activeNetwork })

      let allTokens = await getAllTokensOnUniswap()
      updateAllTokensInUniswap({ allTokens, networkId: activeNetwork })
    }
    if (!data && price && oldPrice) {
      fetchData()
    }
  }, [price, oldPrice, update, data, updateAllPairsInUniswap, updateAllTokensInUniswap, activeNetwork])

  return data || {}
}

export function useGlobalChartData() {
  const [state, { updateChart }] = useGlobalDataContext()
  const activeNetwork = useActiveNetworkId()
  const [oldestDateFetch, setOldestDateFetched] = useState()
  const [activeWindow] = useTimeframe()

  const daily = state[activeNetwork]?.chartData?.daily
  const weekly = state[activeNetwork]?.chartData?.weekly

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
      updateChart({ daily: newChartData, weekly: newWeeklyData, networkId: activeNetwork })
    }
    if (oldestDateFetch && !(daily && weekly)) {
      fetchData()
    }
  }, [daily, weekly, oldestDateFetch, updateChart, activeNetwork])

  return [daily, weekly]
}

export function useGlobalTransactions() {
  const [state, { updateTransactions }] = useGlobalDataContext()
  const activeNetwork = useActiveNetworkId()
  const { transactions } = state[activeNetwork]

  useEffect(() => {
    async function fetchData() {
      if (!transactions) {
        let txns = await getGlobalTransactions()
        updateTransactions({ transactions: txns, networkId: activeNetwork })
      }
    }
    fetchData()
  }, [updateTransactions, transactions, activeNetwork])
  return transactions
}

export function useEthPrice() {
  const [state, { updatePrice }] = useGlobalDataContext()
  const activeNetwork = useActiveNetworkId()
  const { price, oneDayPrice } = state[activeNetwork]

  useEffect(() => {
    async function checkForPrice() {
      if (!price) {
        let [newPrice, newOneDayPrice, priceChange] = await getPrice()
        updatePrice({ price: newPrice, oneDayPrice: newOneDayPrice, priceChange, networkId: activeNetwork })
      }
    }
    checkForPrice()
  }, [price, updatePrice, activeNetwork])

  return [price, oneDayPrice]
}

export function useAllPairsInUniswap() {
  const [state] = useGlobalDataContext()
  const activeNetwork = useActiveNetworkId()
  const { allPairs } = state[activeNetwork]

  return allPairs
}

export function useAllTokensInUniswap() {
  const [state] = useGlobalDataContext()
  const activeNetwork = useActiveNetworkId()
  const { allTokens } = state[activeNetwork]

  return allTokens
}

/**
 * Get the top liquidity positions based on USD size
 * @TODO Not a perfect lookup needs improvement
 */
export function useTopLps() {
  const [state, { updateTopLps }] = useGlobalDataContext()
  const activeNetwork = useActiveNetworkId()
  let topLps = state[activeNetwork]?.topLps

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
          try {
            const { data: results } = await client.query({
              query: TOP_LPS_PER_PAIRS,
              variables: {
                pair: pair.toString()
              },
              fetchPolicy: 'cache-first'
            })
            if (results) {
              return results.liquidityPositions
            }
          } catch (e) {
            console.error(e)
          }
        })
      )

      // get the top lps from the results formatted
      const topLps = []
      topLpLists
        .filter(i => !!i) // check for ones not fetched correctly
        .map(list => {
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
      updateTopLps({ topLps: shorter, networkId: activeNetwork })
    }

    if (!topLps && allPairs && Object.keys(allPairs).length > 0) {
      fetchData()
    }
  })

  return topLps
}
