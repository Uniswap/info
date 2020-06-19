import React, { createContext, useContext, useReducer, useMemo, useCallback, useEffect } from 'react'

import { client } from '../apollo/client'
import { TOKEN_DATA, TOKEN_TXNS, TOKEN_CHART, TOKENS_CURRENT, TOKENS_DYNAMIC } from '../apollo/queries'

import { useEthPrice } from './GlobalData'

import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'

import { get2DayPercentChange, getPercentChange, getBlockFromTimestamp, isAddress } from '../helpers'

const UPDATE = 'UPDATE'
const UPDATE_TOKEN_TXNS = 'UPDATE_TOKEN_TXNS'
const UPDATE_CHART_DATA = 'UPDATE_CHART_DATA'
const UPDATE_TOP_TOKENS = ' UPDATE_TOP_TOKENS'

dayjs.extend(utc)

const TokenDataContext = createContext()

function useTokenDataContext() {
  return useContext(TokenDataContext)
}

function reducer(state, { type, payload }) {
  switch (type) {
    case UPDATE: {
      const { tokenAddress, data } = payload
      return {
        ...state,
        [tokenAddress]: {
          ...state?.[tokenAddress],
          ...data
        }
      }
    }
    case UPDATE_TOP_TOKENS: {
      const { topTokens } = payload
      let added = {}
      topTokens &&
        topTokens.map(token => {
          return (added[token.id] = token)
        })
      return {
        ...state,
        ...added
      }
    }

    case UPDATE_TOKEN_TXNS: {
      const { address, transactions } = payload
      return {
        ...state,
        [address]: {
          ...state?.[address],
          txns: transactions
        }
      }
    }
    case UPDATE_CHART_DATA: {
      const { address, chartData } = payload
      return {
        ...state,
        [address]: {
          ...state?.[address],
          chartData
        }
      }
    }
    default: {
      throw Error(`Unexpected action type in DataContext reducer: '${type}'.`)
    }
  }
}

export default function Provider({ children }) {
  const [state, dispatch] = useReducer(reducer, {})
  const update = useCallback((tokenAddress, data) => {
    dispatch({
      type: UPDATE,
      payload: {
        tokenAddress,
        data
      }
    })
  }, [])

  const updateTopTokens = useCallback(topTokens => {
    dispatch({
      type: UPDATE_TOP_TOKENS,
      payload: {
        topTokens
      }
    })
  }, [])

  const updateTokenTxns = useCallback((address, transactions) => {
    dispatch({
      type: UPDATE_TOKEN_TXNS,
      payload: { address, transactions }
    })
  }, [])

  const updateChartData = useCallback((address, chartData) => {
    dispatch({
      type: UPDATE_CHART_DATA,
      payload: { address, chartData }
    })
  }, [])

  return (
    <TokenDataContext.Provider
      value={useMemo(() => [state, { update, updateTokenTxns, updateChartData, updateTopTokens }], [
        state,
        update,
        updateTokenTxns,
        updateChartData,
        updateTopTokens
      ])}
    >
      {children}
    </TokenDataContext.Provider>
  )
}

const getTopTokens = async (ethPrice, ethPriceOld) => {
  const utcCurrentTime = dayjs()
  const utcOneDayBack = utcCurrentTime.subtract(1, 'day').unix()
  const utcTwoDaysBack = utcCurrentTime.subtract(2, 'day').unix()
  let oneDayBlock = await getBlockFromTimestamp(utcOneDayBack)
  let twoDayBlock = await getBlockFromTimestamp(utcTwoDaysBack)

  try {
    let current = await client.query({
      query: TOKENS_CURRENT,
      fetchPolicy: 'cache-first'
    })

    let oneDayResult = await client.query({
      query: TOKENS_DYNAMIC(oneDayBlock),
      fetchPolicy: 'cache-first'
    })

    let twoDayResult = await client.query({
      query: TOKENS_DYNAMIC(twoDayBlock),
      fetchPolicy: 'cache-first'
    })

    let oneDayData = oneDayResult?.data?.tokens.reduce((obj, cur, i) => {
      return { ...obj, [cur.id]: cur }
    }, {})

    let twoDayData = twoDayResult?.data?.tokens.reduce((obj, cur, i) => {
      return { ...obj, [cur.id]: cur }
    }, {})

    return (
      current &&
      oneDayData &&
      twoDayData &&
      current?.data?.tokens.map(token => {
        let data = token

        let oneDayHistory = oneDayData?.[token.id]
        let twoDayHistory = twoDayData?.[token.id]

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

        // percent changes
        const priceChangeUSD = getPercentChange(
          data?.derivedETH * ethPrice,
          oneDayHistory?.derivedETH ? oneDayHistory?.derivedETH * ethPriceOld : 0
        )
        const liquidityChangeUSD = getPercentChange(data?.totalLiquidityUSD, oneDayHistory?.totalLiquidityUSD ?? 0)

        // set data
        data.priceUSD = data?.derivedETH * ethPrice
        data.totalLiquidityUSD = data?.totalLiquidity * ethPrice * data?.derivedETH
        data.oneDayVolumeUSD = oneDayVolumeUSD
        data.volumeChangeUSD = volumeChangeUSD
        data.priceChangeUSD = priceChangeUSD
        data.liquidityChangeUSD = liquidityChangeUSD
        data.oneDayTxns = oneDayTxns
        data.txnChange = txnChange

        // new tokens
        if (!oneDayHistory && data) {
          data.oneDayVolumeUSD = data.tradeVolumeUSD
          data.oneDayVolumeETH = data.tradeVolume * data.derivedETH
          data.oneDayTxns = data.txCount
        }

        if (data.id === '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2') {
          data.name = 'ETH (Wrapped)'
          data.symbol = 'ETH'
        }
        return data
      })
    )

    // calculate percentage changes and daily changes
  } catch (e) {
    console.log(e)
  }
}

const getTokenData = async (address, ethPrice, ethPriceOld) => {
  const utcCurrentTime = dayjs()
  const utcOneDayBack = utcCurrentTime.subtract(1, 'day').unix()
  const utcTwoDaysBack = utcCurrentTime.subtract(2, 'day').unix()
  let oneDayBlock = await getBlockFromTimestamp(utcOneDayBack)
  let twoDayBlock = await getBlockFromTimestamp(utcTwoDaysBack)

  // initialize data arrays
  let data = {}
  let oneDayData = {}
  let twoDayData = {}

  try {
    // fetch all current and historical data
    let result = await client.query({
      query: TOKEN_DATA(address),
      fetchPolicy: 'cache-first'
    })
    data = result?.data?.tokens?.[0]

    if (data.id === '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2') {
      data.tradeVolumeUSD = data.tradeVolumeUSD - 46662149
    }

    // get results from 24 hours in past
    let oneDayResult = await client.query({
      query: TOKEN_DATA(address, oneDayBlock),
      fetchPolicy: 'cache-first'
    })
    oneDayData = oneDayResult.data.tokens[0]

    // get results from 48 hours in past
    let twoDayResult = await client.query({
      query: TOKEN_DATA(address, twoDayBlock),
      fetchPolicy: 'cache-first'
    })
    twoDayData = twoDayResult.data.tokens[0]

    // calculate percentage changes and daily changes
    const [oneDayVolumeUSD, volumeChangeUSD] = get2DayPercentChange(
      data.tradeVolumeUSD,
      oneDayData?.tradeVolumeUSD,
      twoDayData?.tradeVolumeUSD
    )

    // calculate percentage changes and daily changes
    const [oneDayTxns, txnChange] = get2DayPercentChange(data.txCount, oneDayData?.txCount, twoDayData?.txCount)

    const priceChangeUSD = getPercentChange(data?.derivedETH * ethPrice, oneDayData?.derivedETH * ethPriceOld)
    const liquidityChangeUSD = getPercentChange(data?.totalLiquidityUSD, oneDayData?.totalLiquidityUSD)

    // set data
    data.priceUSD = data?.derivedETH * ethPrice
    data.totalLiquidityUSD = data?.totalLiquidity * ethPrice * data?.derivedETH
    data.oneDayVolumeUSD = oneDayVolumeUSD
    data.volumeChangeUSD = volumeChangeUSD
    data.priceChangeUSD = priceChangeUSD
    data.liquidityChangeUSD = liquidityChangeUSD
    data.oneDayTxns = oneDayTxns
    data.txnChange = txnChange

    // new tokens
    if (!oneDayData && data) {
      data.oneDayVolumeUSD = data.tradeVolumeUSD
      data.oneDayVolumeETH = data.tradeVolume * data.derivedETH
      data.oneDayTxns = data.txCount
    }

    if (data.id === '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2') {
      data.name = 'ETH (Wrapped)'
      data.symbol = 'ETH'
    }
  } catch (e) {
    console.log(e)
  }
  return data
}

const getTokenTransactions = async (tokenAddress, allPairsFormatted) => {
  const transactions = {}
  try {
    let result = await client.query({
      query: TOKEN_TXNS,
      variables: {
        tokenAddr: tokenAddress,
        allPairs: allPairsFormatted
      },
      fetchPolicy: 'cache-first'
    })
    transactions.mints = result.data.mints
    transactions.burns = result.data.burns
    transactions.swaps = result.data.swaps
  } catch (e) {
    console.log(e)
  }
  return transactions
}

const getTokenChartData = async tokenAddress => {
  let data = []
  const utcEndTime = dayjs.utc()
  let utcStartTime = utcEndTime.subtract(1, 'year')
  let startTime = utcStartTime.unix() - 1

  try {
    let result = await client.query({
      query: TOKEN_CHART,
      variables: {
        tokenAddr: tokenAddress
      },
      fetchPolicy: 'cache-first'
    })
    data = data.concat(result.data.tokenDayDatas)
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
    let latestPairDatas = data[0] && data[0].mostLiquidPairs
    let index = 1
    while (timestamp < utcEndTime.unix() - oneDay) {
      const nextDay = timestamp + oneDay
      let currentDayIndex = (nextDay / oneDay).toFixed(0)
      if (!dayIndexSet.has(currentDayIndex)) {
        data.push({
          date: nextDay,
          dayString: nextDay,
          dailyVolumeUSD: 0,
          priceUSD: latestPriceUSD,
          totalLiquidityUSD: latestLiquidityUSD,
          mostLiquidPairs: latestPairDatas
        })
      } else {
        latestLiquidityUSD = dayIndexArray[index].totalLiquidityUSD
        latestPriceUSD = dayIndexArray[index].priceUSD
        latestPairDatas = dayIndexArray[index].mostLiquidPairs
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
  const [, { updateTopTokens }] = useTokenDataContext()
  const [ethPrice, ethPriceOld] = useEthPrice()
  useEffect(() => {
    async function getData() {
      // get top pairs for overview list
      let topTokens = await getTopTokens(ethPrice, ethPriceOld)
      topTokens && updateTopTokens(topTokens)
    }
    ethPrice && ethPriceOld && getData()
  }, [ethPrice, ethPriceOld, updateTopTokens])
  return null
}

export function useTokenData(tokenAddress) {
  const [state, { update }] = useTokenDataContext()
  const [ethPrice, ethPriceOld] = useEthPrice()
  const tokenData = state?.[tokenAddress]

  useEffect(() => {
    if (!tokenData && ethPrice && ethPriceOld && isAddress(tokenAddress)) {
      getTokenData(tokenAddress, ethPrice, ethPriceOld).then(data => {
        update(tokenAddress, data)
      })
    }
  }, [ethPrice, ethPriceOld, tokenAddress, tokenData, update])

  return tokenData || {}
}

export function useTokenTransactions(tokenAddress) {
  const [state, { updateTokenTxns }] = useTokenDataContext()
  const tokenTxns = state?.[tokenAddress]?.txns

  const allPairsFormatted =
    state[tokenAddress] &&
    state[tokenAddress].allPairs &&
    state[tokenAddress].allPairs.map(pair => {
      return pair.id
    })

  useEffect(() => {
    async function checkForTxns() {
      if (!tokenTxns && allPairsFormatted) {
        let transactions = await getTokenTransactions(tokenAddress, allPairsFormatted)
        updateTokenTxns(tokenAddress, transactions)
      }
    }
    checkForTxns()
  }, [tokenTxns, tokenAddress, updateTokenTxns, allPairsFormatted])

  return tokenTxns
}

export function useTokenChartData(tokenAddress) {
  const [state, { updateChartData }] = useTokenDataContext()
  const chartData = state?.[tokenAddress]?.chartData
  useEffect(() => {
    async function checkForChartData() {
      if (!chartData) {
        let data = await getTokenChartData(tokenAddress)
        updateChartData(tokenAddress, data)
      }
    }
    checkForChartData()
  }, [chartData, tokenAddress, updateChartData])
  return chartData
}

export function useAllTokenData() {
  const [state] = useTokenDataContext()
  return state
}
