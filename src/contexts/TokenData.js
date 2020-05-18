import React, { createContext, useContext, useReducer, useMemo, useCallback, useEffect, useState } from 'react'

import { client } from '../apollo/client'
import { TOKEN_DATA, All_TOKENS, TOKEN_TXNS, TOKEN_CHART } from '../apollo/queries'

import { useEthPrice } from './GlobalData'

import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'

import { get2DayPercentChange, getPercentChange, getBlockFromTimestamp } from '../helpers'

const UPDATE = 'UPDATE'
const UPDATE_TOKEN_TXNS = 'UPDATE_TOKEN_TXNS'
const UPDATE_CHART_DATA = 'UPDATE_CHART_DATA'

dayjs.extend(utc)

export function safeAccess(object, path) {
  return object
    ? path.reduce(
        (accumulator, currentValue) => (accumulator && accumulator[currentValue] ? accumulator[currentValue] : null),
        object
      )
    : null
}

const TokenDataContext = createContext()

function useTokenDataContext() {
  return useContext(TokenDataContext)
}

function reducer(state, { type, payload }) {
  switch (type) {
    case UPDATE: {
      const { data } = payload
      const store = {}
      Object.keys(data).map(item => {
        return (store[item] = data[item])
      })
      return {
        ...state,
        [data.id]: {
          ...(safeAccess(state, [data.id]) || {}),
          ...store
        }
      }
    }
    case UPDATE_TOKEN_TXNS: {
      const { address, transactions } = payload
      return {
        ...state,
        [address]: {
          ...(safeAccess(state, [address]) || {}),
          txns: transactions
        }
      }
    }
    case UPDATE_CHART_DATA: {
      const { address, chartData } = payload
      return {
        ...state,
        [address]: {
          ...(safeAccess(state, [address]) || {}),
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
  const update = useCallback(data => {
    dispatch({
      type: UPDATE,
      payload: {
        data
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
      value={useMemo(() => [state, { update, updateTokenTxns, updateChartData }], [
        state,
        update,
        updateTokenTxns,
        updateChartData
      ])}
    >
      {children}
    </TokenDataContext.Provider>
  )
}

const getAllTokens = async () => {
  let data = []
  try {
    let result = await client.query({
      query: All_TOKENS,
      fetchPolicy: 'cache-first'
    })
    data = data.concat(result.data.tokens)
  } catch (e) {
    console.log(e)
  }
  return data
}

const getTokenData = async (address, ethPrice) => {
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

    const [oneDayVolumeETH, volumeChangeETH] = get2DayPercentChange(
      data.tradeVolumeETH,
      oneDayData?.tradeVolumeETH ? oneDayData?.tradeVolumeETH : 0,
      twoDayData?.tradeVolumeETH ? twoDayData?.tradeVolumeETH : 0
    )

    const oneDayTxns = parseFloat(data.txCount) - parseFloat(oneDayData?.txCount)

    const priceChangeUSD = getPercentChange(data?.derivedETH, oneDayData?.derivedETH)
    const priceChangeETH = getPercentChange(data?.derivedETH, oneDayData?.priceETH)
    const liquidityChangeUSD = getPercentChange(data?.totalLiquidityUSD, oneDayData?.totalLiquidityUSD)
    const liquidityChangeETH = getPercentChange(data?.totalLiquidityETH, oneDayData?.totalLiquidityETH)

    // set data
    data.priceUSD = data?.derivedETH * ethPrice
    data.totalLiquidityUSD = data?.totalLiquidity * ethPrice * data?.derivedETH
    data.oneDayVolumeUSD = oneDayVolumeUSD
    data.oneDayVolumeETH = oneDayVolumeETH
    data.volumeChangeUSD = volumeChangeUSD
    data.volumeChangeETH = volumeChangeETH
    data.priceChangeUSD = priceChangeUSD
    data.priceChangeETH = priceChangeETH
    data.liquidityChangeUSD = liquidityChangeUSD
    data.liquidityChangeETH = liquidityChangeETH
    data.oneDayTxns = oneDayTxns

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
          totalLiquidityUSD: latestLiquidityUSD,
          mostLiquidPairs: latestPairDatas
        })
      } else {
        latestLiquidityUSD = dayIndexArray[index].totalLiquidityUSD
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
  const [, { update, updateChartData }] = useTokenDataContext()
  const ethPrice = useEthPrice()
  useEffect(() => {
    ethPrice &&
      getAllTokens().then(allTokens => {
        allTokens.map(async token => {
          let data = await getTokenData(token.id, ethPrice)
          data && update(data)
        })
      })
  }, [update, updateChartData, ethPrice])
  return null
}

export function useTokenData(tokenAddress) {
  const [state, { update }] = useTokenDataContext()
  const ethPrice = useEthPrice()
  const tokenData = safeAccess(state, [tokenAddress])
  if (!tokenAddress) {
    return {}
  }
  if (!tokenData && ethPrice) {
    getTokenData(tokenAddress, ethPrice).then(data => {
      update(data)
    })
  }

  return tokenData || {}
}

export function useTokenTransactions(tokenAddress) {
  const [state, { updateTokenTxns }] = useTokenDataContext()
  const tokenTxns = safeAccess(state, [tokenAddress, 'txns'])

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

  return useMemo(() => {
    return tokenTxns
  }, [tokenTxns])
}

export function useTokenChartData(tokenAddress) {
  const [state, { updateChartData }] = useTokenDataContext()
  const chartData = safeAccess(state, [tokenAddress, 'chartData'])
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

export function useAllTokens() {
  const [allTokens, setAllTokens] = useState()
  useEffect(() => {
    async function getTokens() {
      const tokens = await getAllTokens()
      setAllTokens(tokens)
    }
    getTokens()
  }, [])

  return allTokens
}

export function useAllTokenData() {
  const [state] = useTokenDataContext()
  return state
}
