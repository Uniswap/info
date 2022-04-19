import { createContext, useContext, useReducer, useMemo, useCallback, useEffect } from 'react'
import { EthereumNetworkInfo, TronNetworkInfo } from '../constants/networks'

import { tokenApi, pairApi, globalApi } from 'api'

import { useEthPrice } from 'state/features/global/hooks'
import { useActiveNetworkId, useLatestBlocks } from 'state/features/application/hooks'

import dayjs from 'dayjs'

import {
  get2DayPercentChange,
  getPercentChange,
  getBlockFromTimestamp,
  isAddress,
  getBlocksFromTimestamps,
  splitQuery
} from '../utils'
import { timeframeOptions } from '../constants'
import { updateNameData } from '../utils/data'

const UPDATE = 'UPDATE'
const UPDATE_TOKEN_TXNS = 'UPDATE_TOKEN_TXNS'
const UPDATE_CHART_DATA = 'UPDATE_CHART_DATA'
const UPDATE_PRICE_DATA = 'UPDATE_PRICE_DATA'
const UPDATE_TOP_TOKENS = ' UPDATE_TOP_TOKENS'
const UPDATE_ALL_PAIRS = 'UPDATE_ALL_PAIRS'

const TOKEN_PAIRS_KEY = 'TOKEN_PAIRS_KEY'

const TokenDataContext = createContext()

function useTokenDataContext() {
  return useContext(TokenDataContext)
}

const INITIAL_STATE = {
  [EthereumNetworkInfo.id]: {},
  [TronNetworkInfo.id]: {}
}

function reducer(state, { type, payload }) {
  switch (type) {
    case UPDATE: {
      const { tokenAddress, data, networkId } = payload
      return {
        ...state,
        [networkId]: {
          ...state[networkId],
          [tokenAddress]: {
            ...state[networkId]?.[tokenAddress],
            ...data
          }
        }
      }
    }
    case UPDATE_TOP_TOKENS: {
      const { topTokens, networkId } = payload
      let added = {}
      topTokens &&
        topTokens.map(token => {
          return (added[token.id] = token)
        })
      return {
        ...state,
        [networkId]: {
          ...state[networkId],
          ...added
        }
      }
    }

    case UPDATE_TOKEN_TXNS: {
      const { address, transactions, networkId } = payload
      return {
        ...state,
        [networkId]: {
          ...state[networkId],
          [address]: {
            ...state[networkId]?.[address],
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
            ...state[networkId]?.[address],
            chartData
          }
        }
      }
    }

    case UPDATE_PRICE_DATA: {
      const { address, data, timeWindow, interval, networkId } = payload
      return {
        ...state,
        [networkId]: {
          ...state[networkId],
          [address]: {
            ...state[networkId]?.[address],
            [timeWindow]: {
              ...state[networkId]?.[address]?.[timeWindow],
              [interval]: data
            }
          }
        }
      }
    }

    case UPDATE_ALL_PAIRS: {
      const { address, allPairs, networkId } = payload
      return {
        ...state,
        [networkId]: {
          ...state[networkId],
          [address]: {
            ...state[networkId]?.[address],
            [TOKEN_PAIRS_KEY]: allPairs
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
  const update = useCallback((tokenAddress, data, networkId) => {
    dispatch({
      type: UPDATE,
      payload: {
        tokenAddress,
        data,
        networkId
      }
    })
  }, [])

  const updateTopTokens = useCallback((topTokens, networkId) => {
    dispatch({
      type: UPDATE_TOP_TOKENS,
      payload: {
        topTokens,
        networkId
      }
    })
  }, [])

  const updateTokenTxns = useCallback((address, transactions, networkId) => {
    dispatch({
      type: UPDATE_TOKEN_TXNS,
      payload: { address, transactions, networkId }
    })
  }, [])

  const updateChartData = useCallback((address, chartData, networkId) => {
    dispatch({
      type: UPDATE_CHART_DATA,
      payload: { address, chartData, networkId }
    })
  }, [])

  const updateAllPairs = useCallback((address, allPairs, networkId) => {
    dispatch({
      type: UPDATE_ALL_PAIRS,
      payload: { address, allPairs, networkId }
    })
  }, [])

  const updatePriceData = useCallback((address, data, timeWindow, interval, networkId) => {
    dispatch({
      type: UPDATE_PRICE_DATA,
      payload: { address, data, timeWindow, interval, networkId }
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
            updatePriceData
          }
        ],
        [state, update, updateTokenTxns, updateChartData, updateTopTokens, updateAllPairs, updatePriceData]
      )}
    >
      {children}
    </TokenDataContext.Provider>
  )
}

const getTopTokens = async (price, priceOld) => {
  const utcCurrentTime = dayjs()
  const utcOneDayBack = utcCurrentTime.subtract(1, 'day').unix()
  const utcTwoDaysBack = utcCurrentTime.subtract(2, 'day').unix()
  let oneDayBlock = await getBlockFromTimestamp(utcOneDayBack)
  let twoDayBlock = await getBlockFromTimestamp(utcTwoDaysBack)

  try {
    let current = await tokenApi.getTokens()
    let oneDayResult = await tokenApi.getTokens(oneDayBlock)
    let twoDayResult = await tokenApi.getTokens(twoDayBlock)

    let oneDayData = oneDayResult?.data?.tokens.reduce((obj, cur) => {
      return { ...obj, [cur.id]: cur }
    }, {})

    let twoDayData = twoDayResult?.data?.tokens.reduce((obj, cur) => {
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
            let oneDayResult = await tokenApi.getTokenData(token.id, oneDayBlock)
            oneDayHistory = oneDayResult.data.tokens[0]
          }
          if (!twoDayHistory) {
            let twoDayResult = await tokenApi.getTokenData(token.id, twoDayBlock)
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

          const currentLiquidityUSD = data?.totalLiquidity * price * data?.derivedETH
          const oldLiquidityUSD = oneDayHistory?.totalLiquidity * priceOld * oneDayHistory?.derivedETH

          // percent changes
          const priceChangeUSD = getPercentChange(
            data?.derivedETH * price,
            oneDayHistory?.derivedETH ? oneDayHistory?.derivedETH * priceOld : 0
          )

          // set data
          data.priceUSD = data?.derivedETH * price
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

          // update name data for
          updateNameData({
            token0: data
          })

          // HOTFIX for Aave
          if (data.id === '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9') {
            const aaveData = await pairApi.getPairData('0xdfc14d2af169b0d36c4eff567ada9b2e0cae044f')
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
    console.log(e)
  }
}

const getTokenData = async (address, price, priceOld) => {
  const utcCurrentTime = dayjs()
  const utcOneDayBack = utcCurrentTime.subtract(1, 'day').startOf('minute').unix()
  const utcTwoDaysBack = utcCurrentTime.subtract(2, 'day').startOf('minute').unix()
  let oneDayBlock = await getBlockFromTimestamp(utcOneDayBack)
  let twoDayBlock = await getBlockFromTimestamp(utcTwoDaysBack)

  // initialize data arrays
  let data = {}
  let oneDayData = {}
  let twoDayData = {}

  try {
    // fetch all current and historical data
    let result = await tokenApi.getTokenData(address)
    data = result?.data?.tokens?.[0]

    // get results from 24 hours in past
    let oneDayResult = await tokenApi.getTokenData(address, oneDayBlock)
    oneDayData = oneDayResult.data.tokens[0]

    // get results from 48 hours in past
    let twoDayResult = await tokenApi.getTokenData(address, twoDayBlock)
    twoDayData = twoDayResult.data.tokens[0]

    // catch the case where token wasnt in top list in previous days
    if (!oneDayData) {
      let oneDayResult = await tokenApi.getTokenData(address, oneDayBlock)
      oneDayData = oneDayResult.data.tokens[0]
    }
    if (!twoDayData) {
      let twoDayResult = await tokenApi.getTokenData(address, twoDayBlock)
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
      data?.derivedETH * price,
      parseFloat(oneDayData?.derivedETH ?? 0) * priceOld
    )

    const currentLiquidityUSD = data?.totalLiquidity * price * data?.derivedETH
    const oldLiquidityUSD = oneDayData?.totalLiquidity * priceOld * oneDayData?.derivedETH
    const liquidityChangeUSD = getPercentChange(currentLiquidityUSD ?? 0, oldLiquidityUSD ?? 0)

    // set data
    data.priceUSD = data?.derivedETH * price
    data.totalLiquidityUSD = currentLiquidityUSD
    data.oneDayVolumeUSD = oneDayVolumeUSD
    data.volumeChangeUSD = volumeChangeUSD
    data.priceChangeUSD = priceChangeUSD
    data.oneDayVolumeUT = oneDayVolumeUT
    data.volumeChangeUT = volumeChangeUT
    data.liquidityChangeUSD = liquidityChangeUSD
    data.oneDayTxns = oneDayTxns
    data.txnChange = txnChange

    // new tokens
    if (!oneDayData && data) {
      data.oneDayVolumeUSD = data.tradeVolumeUSD
      data.oneDayVolumeETH = data.tradeVolume * data.derivedETH
      data.oneDayTxns = data.txCount
    }

    // update name data for
    updateNameData({
      token0: data
    })

    // HOTFIX for Aave
    if (data.id === '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9') {
      const aaveData = await pairApi.getPairData('0xdfc14d2af169b0d36c4eff567ada9b2e0cae044f')
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

// TODO: can be improved by useQuery
const getTokenTransactions = async allPairsFormatted => {
  const transactions = {}
  try {
    let result = await pairApi.getFilteredTransactions(allPairsFormatted)
    transactions.mints = result.data.mints
    transactions.burns = result.data.burns
    transactions.swaps = result.data.swaps
  } catch (e) {
    console.log(e)
  }
  return transactions
}

const getTokenPairs = async tokenAddress => {
  try {
    // fetch all current and historical data
    let result = await tokenApi.getTokenData(tokenAddress)
    return result.data?.['pairs0'].concat(result.data?.['pairs1'])
  } catch (e) {
    console.log(e)
  }
}

const getIntervalTokenData = async (tokenAddress, startTime, interval = 3600, latestBlock) => {
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
      blocks = blocks.filter(b => {
        return parseFloat(b.number) <= parseFloat(latestBlock)
      })
    }

    // FIXME: refactor splitQuery
    let result = await splitQuery(params => globalApi.getPricesByBlock([tokenAddress], params), blocks, 50)
    // format token ETH price results
    let values = []
    for (var row in result) {
      let timestamp = row.split('t')[1]
      let derivedETH = parseFloat(result[row]?.derivedETH)
      if (timestamp) {
        values.push({
          timestamp,
          derivedETH
        })
      }
    }

    // go through eth usd prices and assign to original values array
    let index = 0
    for (var brow in result) {
      let timestamp = brow.split('b')[1]
      if (timestamp) {
        if (result[brow]) {
          values[index].priceUSD = result[brow].ethPrice * values[index].derivedETH
        }
        index += 1
      }
    }

    let formattedHistory = []

    // for each hour, construct the open and close price
    for (let i = 0; i < values.length - 1; i++) {
      formattedHistory.push({
        timestamp: values[i].timestamp,
        open: parseFloat(values[i].priceUSD),
        close: parseFloat(values[i + 1].priceUSD)
      })
    }

    return formattedHistory
  } catch (e) {
    console.log(e)
    console.log('error fetching blocks')
    return []
  }
}

const getTokenChartData = async tokenAddress => {
  let data = []
  const utcEndTime = dayjs.utc()
  let utcStartTime = utcEndTime.subtract(1, 'year')
  let startTime = utcStartTime.startOf('minute').unix() - 1

  try {
    let allFound = false
    let skip = 0
    while (!allFound) {
      let result = await tokenApi.getTokenChart(tokenAddress, skip)
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
          totalLiquidityUSD: latestLiquidityUSD
        })
      } else {
        latestLiquidityUSD = dayIndexArray[index].totalLiquidityUSD
        latestPriceUSD = dayIndexArray[index].priceUSD
        index = index + 1
      }
      timestamp = nextDay
    }
    data = data.sort((a, b) => (parseInt(a.date) > parseInt(b.date) ? 1 : -1))
  } catch (e) {
    console.error(e)
  }

  return data
}

export function useTokenUpdater() {
  const [, { updateTopTokens }] = useTokenDataContext()
  const activeNetwork = useActiveNetworkId()
  const [price, priceOld] = useEthPrice()

  useEffect(() => {
    async function fetchData() {
      // get top pairs for overview list
      let topTokens = await getTopTokens(price, priceOld)
      topTokens && updateTopTokens(topTokens, activeNetwork)
    }
    price && priceOld && fetchData()
  }, [price, priceOld, updateTopTokens, activeNetwork])
}

export function useTokenData(tokenAddress) {
  const [state, { update }] = useTokenDataContext()
  const activeNetwork = useActiveNetworkId()
  const [price, priceOld] = useEthPrice()
  const tokenData = state[activeNetwork]?.[tokenAddress]

  useEffect(() => {
    async function fetchData() {
      const data = await getTokenData(tokenAddress, price, priceOld)
      update(tokenAddress, data, activeNetwork)
    }
    // TODO: isAddress only validate ETH address
    if (!tokenData && price && priceOld && isAddress(tokenAddress)) {
      fetchData()
    }
  }, [price, priceOld, tokenAddress, tokenData, update, activeNetwork])

  return tokenData || {}
}

export function useTokenTransactions(tokenAddress) {
  const [state, { updateTokenTxns }] = useTokenDataContext()
  const activeNetwork = useActiveNetworkId()
  const token = state[activeNetwork]?.[tokenAddress]
  const tokenTxns = token?.txns

  const allPairsFormatted = token && token.TOKEN_PAIRS_KEY && token.TOKEN_PAIRS_KEY.map(pair => pair.id)

  useEffect(() => {
    async function checkForTxns() {
      if (!tokenTxns && allPairsFormatted) {
        let transactions = await getTokenTransactions(allPairsFormatted)
        updateTokenTxns(tokenAddress, transactions, activeNetwork)
      }
    }
    checkForTxns()
  }, [tokenTxns, tokenAddress, updateTokenTxns, allPairsFormatted, activeNetwork])

  return tokenTxns || []
}

export function useTokenPairs(tokenAddress) {
  const [state, { updateAllPairs }] = useTokenDataContext()
  const activeNetwork = useActiveNetworkId()
  const tokenPairs = state[activeNetwork]?.[tokenAddress]?.[TOKEN_PAIRS_KEY]

  useEffect(() => {
    async function fetchData() {
      let allPairs = await getTokenPairs(tokenAddress)
      updateAllPairs(tokenAddress, allPairs, activeNetwork)
    }
    if (!tokenPairs && isAddress(tokenAddress)) {
      fetchData()
    }
  }, [tokenAddress, tokenPairs, updateAllPairs, activeNetwork])

  return tokenPairs || []
}

export function useTokenChartData(tokenAddress) {
  const [state, { updateChartData }] = useTokenDataContext()
  const activeNetwork = useActiveNetworkId()
  const chartData = state[activeNetwork]?.[tokenAddress]?.chartData
  useEffect(() => {
    async function checkForChartData() {
      if (!chartData) {
        let data = await getTokenChartData(tokenAddress)
        updateChartData(tokenAddress, data, activeNetwork)
      }
    }
    checkForChartData()
  }, [chartData, tokenAddress, updateChartData, chartData])
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
  const [state, { updatePriceData }] = useTokenDataContext()
  const activeNetwork = useActiveNetworkId()
  const chartData = state[activeNetwork]?.[tokenAddress]?.[timeWindow]?.[interval]
  const [latestBlock] = useLatestBlocks()

  useEffect(() => {
    const currentTime = dayjs.utc()
    const windowSize = timeWindow === timeframeOptions.MONTH ? 'month' : 'week'
    const startTime =
      timeWindow === timeframeOptions.ALL_TIME ? 1589760000 : currentTime.subtract(1, windowSize).startOf('hour').unix()

    async function fetch() {
      let data = await getIntervalTokenData(tokenAddress, startTime, interval, latestBlock)
      updatePriceData(tokenAddress, data, timeWindow, interval, activeNetwork)
    }
    if (!chartData) {
      fetch()
    }
  }, [chartData, interval, timeWindow, tokenAddress, updatePriceData, latestBlock, activeNetwork])

  return chartData
}

export function useAllTokenData() {
  const [state] = useTokenDataContext()
  const activeNetwork = useActiveNetworkId()

  return state[activeNetwork]
}
