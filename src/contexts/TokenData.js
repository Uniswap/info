import React, { createContext, useContext, useReducer, useMemo, useCallback, useEffect } from 'react'
import merge from 'deepmerge'

import {
  TOKEN_DATA,
  FILTERED_TRANSACTIONS,
  TOKEN_CHART,
  TOKENS_CURRENT,
  TOKENS_DYNAMIC,
  PRICES_BY_BLOCK,
  PAIR_DATA,
} from '../apollo/queries'

import { useEthPrice } from './GlobalData'

import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'

import {
  get2DayPercentChange,
  getPercentChange,
  getBlockFromTimestamp,
  isAddress,
  getBlocksFromTimestamps,
  splitQuery,
  overwriteArrayMerge,
  memoRequest,
} from '../utils'

import { timeframeOptions, getWETH_ADDRESS } from '../constants'
import { useExchangeClient, useLatestBlocks } from './Application'
import { getNativeTokenSymbol, getNativeTokenWrappedName } from '../utils'
import { useNetworksInfo } from './NetworkInfo'

const UPDATE = 'UPDATE'
const UPDATE_TOKEN_TXNS = 'UPDATE_TOKEN_TXNS'
const UPDATE_CHART_DATA = 'UPDATE_CHART_DATA'
const UPDATE_PRICE_DATA = 'UPDATE_PRICE_DATA'
const UPDATE_TOP_TOKENS = 'UPDATE_TOP_TOKENS'
const UPDATE_ALL_PAIRS = 'UPDATE_ALL_PAIRS'

const TOKEN_PAIRS_KEY = 'TOKEN_PAIRS_KEY'

dayjs.extend(utc)

const TokenDataContext = createContext()

function useTokenDataContext() {
  return useContext(TokenDataContext)
}

function reducer(state, { type, payload }) {
  switch (type) {
    case UPDATE: {
      const { tokenAddress, data, chainId } = payload
      if (!data) return merge(state, { [chainId]: { [tokenAddress]: { name: 'error-token' } } })
      return merge(state, { [chainId]: { [tokenAddress]: data } })
    }
    case UPDATE_TOP_TOKENS: {
      const { topTokens, chainId } = payload
      let added = {}
      topTokens && topTokens.forEach(token => (added[token.id] = token))
      return merge(state, { [chainId]: added })
    }
    case UPDATE_TOKEN_TXNS: {
      const { address, transactions, chainId } = payload
      return merge(state, { [chainId]: { [address]: { txns: transactions } } }, { arrayMerge: overwriteArrayMerge })
    }
    case UPDATE_CHART_DATA: {
      const { address, chartData, chainId } = payload
      return merge(state, { [chainId]: { [address]: { chartData } } }, { arrayMerge: overwriteArrayMerge })
    }
    case UPDATE_PRICE_DATA: {
      const { address, data, timeWindow, interval, chainId } = payload
      return merge(
        state,
        { [chainId]: { [address]: { [timeWindow]: { [interval]: data } } } },
        { arrayMerge: overwriteArrayMerge }
      )
    }
    case UPDATE_ALL_PAIRS: {
      const { address, allPairs, chainId } = payload
      return merge(state, { [chainId]: { [address]: { [TOKEN_PAIRS_KEY]: allPairs } } }, { arrayMerge: overwriteArrayMerge })
    }
    default: {
      throw Error(`Unexpected action type in DataContext reducer: '${type}'.`)
    }
  }
}

export default function Provider({ children }) {
  const [state, dispatch] = useReducer(reducer, {})
  const update = useCallback((tokenAddress, data, chainId) => {
    dispatch({
      type: UPDATE,
      payload: {
        tokenAddress,
        data,
        chainId,
      },
    })
  }, [])

  const updateTopTokens = useCallback((topTokens, chainId) => {
    dispatch({
      type: UPDATE_TOP_TOKENS,
      payload: {
        topTokens,
        chainId,
      },
    })
  }, [])

  const updateTokenTxns = useCallback((address, transactions, chainId) => {
    dispatch({
      type: UPDATE_TOKEN_TXNS,
      payload: { address, transactions, chainId },
    })
  }, [])

  const updateChartData = useCallback((address, chartData, chainId) => {
    dispatch({
      type: UPDATE_CHART_DATA,
      payload: { address, chartData, chainId },
    })
  }, [])

  const updateAllPairs = useCallback((address, allPairs, chainId) => {
    dispatch({
      type: UPDATE_ALL_PAIRS,
      payload: { address, allPairs, chainId },
    })
  }, [])

  const updatePriceData = useCallback((address, data, timeWindow, interval, chainId) => {
    dispatch({
      type: UPDATE_PRICE_DATA,
      payload: { address, data, timeWindow, interval, chainId },
    })
  }, [])

  return (
    <TokenDataContext.Provider
      value={useMemo(
        () => [
          state,
          {
            update,
            updateTokenTxns,
            updateChartData,
            updateTopTokens,
            updateAllPairs,
            updatePriceData,
          },
        ],
        [state, update, updateTokenTxns, updateChartData, updateTopTokens, updateAllPairs, updatePriceData]
      )}
    >
      {children}
    </TokenDataContext.Provider>
  )
}

const getTopTokens = async (client, ethPrice, ethPriceOld, networkInfo) => {
  const utcCurrentTime = dayjs()
  const utcOneDayBack = utcCurrentTime.subtract(1, 'day').unix()
  const utcTwoDaysBack = utcCurrentTime.subtract(2, 'day').unix()
  let oneDayBlock = await getBlockFromTimestamp(utcOneDayBack, networkInfo)
  let twoDayBlock = await getBlockFromTimestamp(utcTwoDaysBack, networkInfo)

  try {
    let current = await client.query({
      query: TOKENS_CURRENT,
      fetchPolicy: 'cache-first',
    })

    let oneDayResult = await client.query({
      query: TOKENS_DYNAMIC(oneDayBlock),
      fetchPolicy: 'cache-first',
    })

    let twoDayResult = await client.query({
      query: TOKENS_DYNAMIC(twoDayBlock),
      fetchPolicy: 'cache-first',
    })

    let oneDayData = oneDayResult?.data?.tokens.reduce((obj, cur, i) => {
      return { ...obj, [cur.id]: cur }
    }, {})

    let twoDayData = twoDayResult?.data?.tokens.reduce((obj, cur, i) => {
      return { ...obj, [cur.id]: cur }
    }, {})

    let bulkResults = await Promise.all(
      current &&
        oneDayData &&
        twoDayData &&
        current?.data?.tokens.map(async token => {
          let data = token

          // let liquidityDataThisToken = liquidityData?.[token.id]
          let oneDayHistory = oneDayData?.[token.id]
          let twoDayHistory = twoDayData?.[token.id]

          // catch the case where token wasnt in top list in previous days
          if (!oneDayHistory) {
            let oneDayResult = await client.query({
              query: TOKEN_DATA(token.id, oneDayBlock),
              fetchPolicy: 'cache-first',
            })
            oneDayHistory = oneDayResult.data.tokens[0]
          }
          if (!twoDayHistory) {
            let twoDayResult = await client.query({
              query: TOKEN_DATA(token.id, twoDayBlock),
              fetchPolicy: 'cache-first',
            })
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

          const currentLiquidityUSD = data?.totalLiquidity * ethPrice * data?.derivedETH
          const oldLiquidityUSD = oneDayHistory?.totalLiquidity * ethPriceOld * oneDayHistory?.derivedETH

          // percent changes
          const priceChangeUSD = getPercentChange(
            data?.derivedETH * ethPrice,
            oneDayHistory?.derivedETH ? oneDayHistory?.derivedETH * ethPriceOld : 0
          )

          // set data
          data.priceUSD = data?.derivedETH * ethPrice
          data.totalLiquidityUSD = currentLiquidityUSD
          data.oneDayVolumeUSD = parseFloat(oneDayVolumeUSD)
          data.volumeChangeUSD = volumeChangeUSD
          data.priceChangeUSD = priceChangeUSD
          data.liquidityChangeUSD = getPercentChange(currentLiquidityUSD ?? 0, oldLiquidityUSD ?? 0)
          data.oneDayTxns = oneDayTxns
          data.txnChange = txnChange

          // new tokens
          if (!oneDayHistory && data) {
            data.oneDayVolumeUSD = data.tradeVolumeUSD
            data.oneDayVolumeETH = data.tradeVolume * data.derivedETH
            data.oneDayTxns = data.txCount
          }

          if (data.id === getWETH_ADDRESS(networkInfo)) {
            data.name = getNativeTokenWrappedName(networkInfo)
            data.symbol = getNativeTokenSymbol(networkInfo)
          }

          // HOTFIX for Aave
          if (data.id === '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9') {
            const aaveData = await client.query({
              query: PAIR_DATA('0xdfc14d2af169b0d36c4eff567ada9b2e0cae044f'),
              fetchPolicy: 'cache-first',
            })
            const result = aaveData.data.pairs[0]
            data.totalLiquidityUSD = parseFloat(result.reserveUSD) / 2
            data.liquidityChangeUSD = 0
            data.priceChangeUSD = 0
          }

          return data
        })
    )

    return bulkResults

    // calculate percentage changes and daily changes
  } catch (e) {
    console.trace(e)
  }
}

const getTokenData = async (client, address, ethPrice, ethPriceOld, networkInfo) => {
  const utcCurrentTime = dayjs()
  const utcOneDayBack = utcCurrentTime.subtract(1, 'day').startOf('minute').unix()
  const utcTwoDaysBack = utcCurrentTime.subtract(2, 'day').startOf('minute').unix()
  let oneDayBlock = await getBlockFromTimestamp(utcOneDayBack, networkInfo)
  let twoDayBlock = await getBlockFromTimestamp(utcTwoDaysBack, networkInfo)

  // initialize data arrays
  let data = {}
  let oneDayData = {}
  let twoDayData = {}

  try {
    // fetch all current and historical data
    let result = await client.query({
      query: TOKEN_DATA(address),
      fetchPolicy: 'cache-first',
    })
    data = result?.data?.tokens?.[0]

    // get results from 24 hours in past
    let oneDayResult = await client.query({
      query: TOKEN_DATA(address, oneDayBlock),
      fetchPolicy: 'cache-first',
    })
    oneDayData = oneDayResult.data.tokens[0]

    // get results from 48 hours in past
    let twoDayResult = await client.query({
      query: TOKEN_DATA(address, twoDayBlock),
      fetchPolicy: 'cache-first',
    })
    twoDayData = twoDayResult.data.tokens[0]

    // catch the case where token wasnt in top list in previous days
    if (!oneDayData) {
      let oneDayResult = await client.query({
        query: TOKEN_DATA(address, oneDayBlock),
        fetchPolicy: 'cache-first',
      })
      oneDayData = oneDayResult.data.tokens[0]
    }
    if (!twoDayData) {
      let twoDayResult = await client.query({
        query: TOKEN_DATA(address, twoDayBlock),
        fetchPolicy: 'cache-first',
      })
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
    const [oneDayTxns, txnChange] = get2DayPercentChange(data.txCount, oneDayData?.txCount ?? 0, twoDayData?.txCount ?? 0)

    const priceChangeUSD = getPercentChange(data?.derivedETH * ethPrice, parseFloat(oneDayData?.derivedETH ?? 0) * ethPriceOld)

    const currentLiquidityUSD = data?.totalLiquidity * ethPrice * data?.derivedETH
    const oldLiquidityUSD = oneDayData?.totalLiquidity * ethPriceOld * oneDayData?.derivedETH

    // set data
    data.priceUSD = data?.derivedETH * ethPrice
    data.totalLiquidityUSD = currentLiquidityUSD
    data.oneDayVolumeUSD = oneDayVolumeUSD
    data.volumeChangeUSD = volumeChangeUSD
    data.priceChangeUSD = priceChangeUSD
    data.oneDayVolumeUT = oneDayVolumeUT
    data.volumeChangeUT = volumeChangeUT
    const liquidityChangeUSD = getPercentChange(currentLiquidityUSD ?? 0, oldLiquidityUSD ?? 0)
    data.liquidityChangeUSD = liquidityChangeUSD
    data.oneDayTxns = oneDayTxns
    data.txnChange = txnChange

    // new tokens
    if (!oneDayData && data) {
      data.oneDayVolumeUSD = data.tradeVolumeUSD
      data.oneDayVolumeETH = data.tradeVolume * data.derivedETH
      data.oneDayTxns = data.txCount
    }

    // fix for WETH
    if (data.id === getWETH_ADDRESS(networkInfo)) {
      data.name = getNativeTokenWrappedName(networkInfo)
      data.symbol = getNativeTokenSymbol(networkInfo)
    }

    // HOTFIX for Aave
    if (data.id === '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9') {
      const aaveData = await client.query({
        query: PAIR_DATA('0xdfc14d2af169b0d36c4eff567ada9b2e0cae044f'),
        fetchPolicy: 'cache-first',
      })
      const result = aaveData.data.pairs[0]
      data.totalLiquidityUSD = parseFloat(result.reserveUSD) / 2
      data.liquidityChangeUSD = 0
      data.priceChangeUSD = 0
    }
  } catch (e) {
    console.log(e)
  }
  return data
}

const getTokenTransactions = async (client, allPairsFormatted) => {
  const transactions = {}
  try {
    let result = await client.query({
      query: FILTERED_TRANSACTIONS,
      variables: {
        allPairs: allPairsFormatted,
      },
      fetchPolicy: 'cache-first',
    })
    transactions.mints = result.data.mints
    transactions.burns = result.data.burns
    transactions.swaps = result.data.swaps
  } catch (e) {
    console.log(e)
  }
  return transactions
}

const getTokenPairs = async (client, tokenAddress) => {
  try {
    // fetch all current and historical data
    let result = await client.query({
      query: TOKEN_DATA(tokenAddress),
      fetchPolicy: 'cache-first',
    })
    return result.data?.['pairs0'].concat(result.data?.['pairs1'])
  } catch (e) {
    console.log(e)
  }
}

const getIntervalTokenData = async (client, tokenAddress, startTime, interval = 3600, latestBlock, networkInfo) => {
  const run = async () => {
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
      blocks = await getBlocksFromTimestamps(timestamps, networkInfo, 400)

      // catch failing case
      if (!blocks || blocks.length === 0) {
        return []
      }

      if (latestBlock) {
        blocks = blocks.filter(b => {
          return parseFloat(b.number) <= parseFloat(latestBlock)
        })
      }

      let result = await splitQuery(PRICES_BY_BLOCK, client, [tokenAddress], blocks, 400)

      // format token ETH price results
      let values = []
      for (var row in result) {
        let timestamp = row.split('t')[1]
        let derivedETH = parseFloat(result[row]?.derivedETH)
        if (timestamp) {
          values.push({
            timestamp,
            derivedETH,
          })
        }
      }

      // go through eth usd prices and assign to original values array
      let index = 0
      for (var brow in result) {
        let timestamp = brow.split('b')[1]
        if (timestamp) {
          values[index].priceUSD = result[brow].ethPrice * values[index].derivedETH
          index += 1
        }
      }

      let formattedHistory = []

      // for each hour, construct the open and close price
      for (let i = 0; i < values.length - 1; i++) {
        formattedHistory.push({
          timestamp: values[i].timestamp,
          open: parseFloat(values[i].priceUSD),
          close: parseFloat(values[i + 1].priceUSD),
        })
      }

      return formattedHistory
    } catch (e) {
      console.log(e)
      console.log('error fetching blocks')
      return []
    }
  }
  return await memoRequest(run, JSON.stringify({ tokenAddress, startTime, interval, latestBlock, networkInfo }))
}

const getTokenChartData = async (client, tokenAddress) => {
  let data = []
  const utcEndTime = dayjs.utc()
  let utcStartTime = utcEndTime.subtract(1, 'year')
  let startTime = utcStartTime.startOf('minute').unix() - 1

  try {
    let allFound = false
    let skip = 0
    while (!allFound) {
      let result = await client.query({
        query: TOKEN_CHART,
        variables: {
          tokenAddr: tokenAddress,
          skip,
        },
        fetchPolicy: 'cache-first',
      })
      if (result.data.tokenDayDatas.length < 1000) {
        allFound = true
      }
      skip += 1000
      data = data.concat(result.data.tokenDayDatas)
    }

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
    let timestamp = data[0] && data[0].date ? data[0].date : startTime
    let latestLiquidityUSD = data[0] && data[0].totalLiquidityUSD
    let latestPriceUSD = data[0] && data[0].priceUSD
    // let latestPairDatas = data[0] && data[0].mostLiquidPairs
    let index = 1
    while (timestamp < utcEndTime.startOf('minute').unix() - oneDay) {
      const nextDay = timestamp + oneDay
      let currentDayIndex = (nextDay / oneDay).toFixed(0)
      if (!dayIndexSet.has(currentDayIndex)) {
        data.push({
          date: nextDay,
          dayString: nextDay,
          dailyVolumeUSD: 0,
          priceUSD: latestPriceUSD,
          totalLiquidityUSD: latestLiquidityUSD,
          // mostLiquidPairs: latestPairDatas,
        })
      } else {
        latestLiquidityUSD = dayIndexArray[index].totalLiquidityUSD
        latestPriceUSD = dayIndexArray[index].priceUSD
        // latestPairDatas = dayIndexArray[index].mostLiquidPairs
        index = index + 1
      }
      timestamp = nextDay
    }
    data = data.sort((a, b) => (parseInt(a.date) > parseInt(b.date) ? 1 : -1))
  } catch (e) {
    console.log(e)
  }
  return data
}

export function Updater() {
  const exchangeSubgraphClient = useExchangeClient()
  const [, { updateTopTokens }] = useTokenDataContext()
  const [ethPrice, ethPriceOld] = useEthPrice()
  const [networksInfo] = useNetworksInfo()

  useEffect(() => {
    let canceled = false
    async function getData() {
      // get top pairs for overview list
      let topTokens = await getTopTokens(exchangeSubgraphClient, ethPrice, ethPriceOld, networksInfo)
      !canceled && topTokens && updateTopTokens(topTokens, networksInfo.CHAIN_ID)
    }
    ethPrice && ethPriceOld && getData()
    return () => (canceled = true)
  }, [ethPrice, ethPriceOld, updateTopTokens, exchangeSubgraphClient, networksInfo])

  return null
}

export function useTokenData(tokenAddress) {
  const exchangeSubgraphClient = useExchangeClient()
  const [state, { update }] = useTokenDataContext()
  const [ethPrice, ethPriceOld] = useEthPrice()
  const [networksInfo] = useNetworksInfo()
  const tokenData = state?.[networksInfo.CHAIN_ID]?.[tokenAddress]

  useEffect(() => {
    if (!tokenData && ethPrice && ethPriceOld && isAddress(tokenAddress)) {
      getTokenData(exchangeSubgraphClient, tokenAddress, ethPrice, ethPriceOld, networksInfo).then(data => {
        update(tokenAddress, data, networksInfo.CHAIN_ID)
      })
    }
  }, [ethPrice, ethPriceOld, tokenAddress, tokenData, update, exchangeSubgraphClient, networksInfo])

  return tokenData || {}
}

export function useTokenTransactions(tokenAddress) {
  const exchangeSubgraphClient = useExchangeClient()
  const [state, { updateTokenTxns }] = useTokenDataContext()
  const [networksInfo] = useNetworksInfo()
  const tokenTxns = state?.[networksInfo.CHAIN_ID]?.[tokenAddress]?.txns

  const allPairsFormatted = state?.[networksInfo.CHAIN_ID]?.[tokenAddress]?.TOKEN_PAIRS_KEY?.map?.(pair => pair.id)

  useEffect(() => {
    async function checkForTxns() {
      if (!tokenTxns && allPairsFormatted) {
        let transactions = await getTokenTransactions(exchangeSubgraphClient, allPairsFormatted)
        updateTokenTxns(tokenAddress, transactions, networksInfo.CHAIN_ID)
      }
    }
    checkForTxns()
  }, [state[tokenAddress], tokenTxns, tokenAddress, updateTokenTxns, allPairsFormatted, exchangeSubgraphClient])

  return tokenTxns || []
}

export function useTokenPairs(tokenAddress) {
  const exchangeSubgraphClient = useExchangeClient()
  const [state, { updateAllPairs }] = useTokenDataContext()
  const [networksInfo] = useNetworksInfo()
  const tokenPairs = state?.[networksInfo.CHAIN_ID]?.[tokenAddress]?.[TOKEN_PAIRS_KEY]

  useEffect(() => {
    async function fetchData() {
      let allPairs = await getTokenPairs(exchangeSubgraphClient, tokenAddress)
      updateAllPairs(tokenAddress, allPairs, networksInfo.CHAIN_ID)
    }
    if (!tokenPairs && isAddress(tokenAddress)) {
      fetchData()
    }
  }, [tokenAddress, tokenPairs, updateAllPairs, exchangeSubgraphClient])

  return tokenPairs || []
}

export function useTokenChartData(tokenAddress) {
  const exchangeSubgraphClient = useExchangeClient()
  const [state, { updateChartData }] = useTokenDataContext()
  const [networksInfo] = useNetworksInfo()
  const chartData = state?.[networksInfo.CHAIN_ID]?.[tokenAddress]?.chartData
  useEffect(() => {
    async function checkForChartData() {
      if (!chartData) {
        let data = await getTokenChartData(exchangeSubgraphClient, tokenAddress)
        updateChartData(tokenAddress, data, networksInfo.CHAIN_ID)
      }
    }
    checkForChartData()
  }, [chartData, tokenAddress, updateChartData, exchangeSubgraphClient])
  return chartData
}

/**
 * get candlestick data for a token - saves in context based on the window and the
 * interval size
 * @param {*} tokenAddress
 * @param {*} timeWindow // a preset time window from constant - how far back to look
 * @param {*} interval  // the chunk size in seconds - default is 1 hour of 3600s
 */
export function useTokenPriceData(tokenAddress, timeWindow, interval = 3600) {
  const exchangeSubgraphClient = useExchangeClient()
  const [state, { updatePriceData }] = useTokenDataContext()
  const [networksInfo] = useNetworksInfo()
  const [latestBlock] = useLatestBlocks()
  const chartData = state?.[networksInfo.CHAIN_ID]?.[tokenAddress]?.[timeWindow]?.[interval]

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
      let data = await getIntervalTokenData(exchangeSubgraphClient, tokenAddress, startTime, interval, latestBlock, networksInfo)
      updatePriceData(tokenAddress, data, timeWindow, interval, networksInfo.CHAIN_ID)
    }
    if (!chartData) {
      fetch()
    }
  }, [chartData, interval, timeWindow, tokenAddress, updatePriceData, latestBlock, exchangeSubgraphClient, networksInfo])

  return chartData
}

export function useAllTokenData() {
  const [state] = useTokenDataContext()
  const [networksInfo] = useNetworksInfo()
  return state?.[networksInfo.CHAIN_ID] || {}
}
