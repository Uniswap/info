import { timeframeOptions } from '../../../constants'
import dayjs from 'dayjs'
import { useEffect } from 'react'
import { useLatestBlocks } from '../application/hooks'
import { useActiveNetworkId } from '../application/selectors'
import { useAppDispatch, useAppSelector } from 'state/hooks'
import { setTokenPairs, setChartData, setPriceData, setToken, setTopTokens, setTransactions } from './slice'
import { useActiveTokenOneDayPrice, useActiveTokenPrice } from '../global/selectors'
import DataService from 'data/DataService'
import { isValidAddress } from 'utils'

export function useFetchTokens() {
  const dispatch = useAppDispatch()
  const activeNetwork = useActiveNetworkId()
  const price = useActiveTokenPrice()
  const oneDayPrice = useActiveTokenOneDayPrice()

  useEffect(() => {
    async function fetchData() {
      // get top pairs for overview list
      const topTokens = await DataService.tokens.getTopTokens(price, oneDayPrice)
      topTokens && dispatch(setTopTokens({ networkId: activeNetwork, topTokens }))
    }
    price && oneDayPrice && fetchData()
  }, [price, oneDayPrice, activeNetwork])
}

export function useTokenData(tokenAddress: string) {
  const dispatch = useAppDispatch()
  const activeNetwork = useActiveNetworkId()
  const price = useActiveTokenPrice()
  const oneDayPrice = useActiveTokenOneDayPrice()
  const tokenData = useAppSelector(state => state.token[activeNetwork]?.[tokenAddress])

  useEffect(() => {
    async function fetchData() {
      const data = await DataService.tokens.getTokenData(tokenAddress, price, oneDayPrice)
      data && dispatch(setToken({ tokenAddress, networkId: activeNetwork, data }))
    }
    // TODO: isAddress only validate ETH address
    if (!tokenData && price && oneDayPrice && isValidAddress(tokenAddress, activeNetwork)) {
      fetchData()
    }
  }, [price, oneDayPrice, tokenAddress, tokenData, activeNetwork])

  return tokenData || {}
}

export function useTokenTransactions(tokenAddress: string) {
  const dispatch = useAppDispatch()
  const activeNetwork = useActiveNetworkId()
  const tokenTransactions = useAppSelector(state => state.token[activeNetwork]?.[tokenAddress]?.transactions)
  const tokenPairs = useAppSelector(state => state.token[activeNetwork]?.[tokenAddress]?.tokenPairs)

  useEffect(() => {
    async function checkForTransactions() {
      if (!tokenTransactions && tokenPairs) {
        const transactions = await DataService.transactions.getTransactions(tokenPairs)
        dispatch(setTransactions({ networkId: activeNetwork, transactions, address: tokenAddress }))
      }
    }
    checkForTransactions()
  }, [tokenTransactions, tokenAddress, tokenPairs, activeNetwork])

  return tokenTransactions || []
}

export function useTokenPairsIds(tokenAddress: string) {
  const dispatch = useAppDispatch()
  const activeNetwork = useActiveNetworkId()
  const tokenPairs = useAppSelector(state => state.token[activeNetwork]?.[tokenAddress]?.tokenPairs)

  useEffect(() => {
    async function fetchData() {
      const allPairs = await DataService.tokens.getTokenPairs(tokenAddress)
      dispatch(setTokenPairs({ networkId: activeNetwork, allPairs, address: tokenAddress }))
    }
    if (!tokenPairs && isValidAddress(tokenAddress, activeNetwork)) {
      fetchData()
    }
  }, [tokenAddress, tokenPairs, activeNetwork])

  return tokenPairs || []
}

export function useTokenPairs(pairIds: string[]) {
  const activeNetwork = useActiveNetworkId()
  const pairs = useAppSelector(state => state.pairs[activeNetwork])
  const tokenPairs = Object.fromEntries(Object.entries(pairs).filter(([key]) => pairIds.indexOf(key) >= 0))
  return tokenPairs
}

export function useTokenChartData(tokenAddress: string) {
  const dispatch = useAppDispatch()
  const activeNetwork = useActiveNetworkId()
  const chartData = useAppSelector(state => state.token[activeNetwork]?.[tokenAddress]?.chartData)
  useEffect(() => {
    async function checkForChartData() {
      if (!chartData) {
        const data = await DataService.tokens.getTokenChartData(tokenAddress)
        dispatch(setChartData({ networkId: activeNetwork, chartData: data, address: tokenAddress }))
      }
    }
    checkForChartData()
  }, [chartData, tokenAddress, chartData])
  return chartData
}

/**
 * get candlestick data for a token - saves in context based on the window and the
 * interval size
 * @param {*} tokenAddress
 * @param {*} timeWindow // a preset time window from constant - how far back to look
 * @param {*} interval  // the chunk size in seconds - default is 1 hour of 3600s
 */
export function useTokenPriceData(tokenAddress: string, timeWindow: string, interval = 3600) {
  const dispatch = useAppDispatch()
  const activeNetwork = useActiveNetworkId()
  const chartData = useAppSelector(
    state => state.token[activeNetwork]?.[tokenAddress]?.timeWindowData?.[timeWindow]?.[interval]
  )
  const [latestBlock] = useLatestBlocks()

  useEffect(() => {
    const currentTime = dayjs.utc()
    const windowSize = timeWindow === timeframeOptions.MONTH ? 'month' : 'week'
    const startTime =
      timeWindow === timeframeOptions.ALL_TIME ? 1589760000 : currentTime.subtract(1, windowSize).startOf('hour').unix()

    async function fetch() {
      const data = await DataService.tokens.getIntervalTokenData(tokenAddress, startTime, interval, latestBlock)
      dispatch(setPriceData({ networkId: activeNetwork, timeWindow, interval, data, address: tokenAddress }))
    }
    if (!chartData) {
      fetch()
    }
  }, [chartData, interval, timeWindow, tokenAddress, latestBlock, activeNetwork])

  return chartData
}
