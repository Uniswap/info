import { timeframeOptions } from '../../../constants'
import {
  getTopTokens,
  getTokenData,
  getTokenTransactions,
  getTokenPairs,
  getTokenChartData,
  getIntervalTokenData
} from 'data/ethereum/tokens'
import dayjs from 'dayjs'
import { isAddress } from 'ethers/lib/utils'
import { useEffect } from 'react'
import { useActiveNetworkId, useLatestBlocks } from '../application/hooks'
import { useEthPrice } from '../global/hooks'
import { useAppDispatch, useAppSelector } from 'state/hooks'
import { setAllPairs, setChartData, setPriceData, setToken, setTopTokens, setTransactions } from './slice'

export function useTokenUpdater() {
  const dispatch = useAppDispatch()
  const activeNetwork = useActiveNetworkId()
  const [price, priceOld] = useEthPrice()

  useEffect(() => {
    async function fetchData() {
      // get top pairs for overview list
      const topTokens = await getTopTokens(price, priceOld)
      topTokens && dispatch(setTopTokens({ networkId: activeNetwork, topTokens }))
    }
    price && priceOld && fetchData()
  }, [price, priceOld, activeNetwork])
}

export function useTokenData(tokenAddress: string) {
  const dispatch = useAppDispatch()
  const activeNetwork = useActiveNetworkId()
  const [price, priceOld] = useEthPrice()
  const tokenData = useAppSelector(state => state.token[activeNetwork]?.[tokenAddress])

  useEffect(() => {
    async function fetchData() {
      console.log('fetch data')
      const data = await getTokenData(tokenAddress, price, priceOld)
      data && dispatch(setToken({ tokenAddress, networkId: activeNetwork, data }))
    }
    // TODO: isAddress only validate ETH address
    if (!tokenData && price && priceOld && isAddress(tokenAddress)) {
      fetchData()
    }
  }, [price, priceOld, tokenAddress, tokenData, activeNetwork])

  return tokenData || {}
}

export function useTokenTransactions(tokenAddress: string) {
  const dispatch = useAppDispatch()
  const activeNetwork = useActiveNetworkId()
  const tokenTransactions = useAppSelector(state => state.token[activeNetwork]?.[tokenAddress]?.transactions)
  const tokenPairs = useAppSelector(state => state.token[activeNetwork]?.[tokenAddress]?.tokenPairs)
  const allPairsFormatted = tokenPairs?.map(pair => pair.id)

  useEffect(() => {
    async function checkForTransactions() {
      if (!tokenTransactions && allPairsFormatted) {
        const transactions = await getTokenTransactions(allPairsFormatted)
        dispatch(setTransactions({ networkId: activeNetwork, transactions, address: tokenAddress }))
      }
    }
    checkForTransactions()
  }, [tokenTransactions, tokenAddress, allPairsFormatted, activeNetwork])

  return tokenTransactions || []
}

export function useTokenPairs(tokenAddress: string) {
  const dispatch = useAppDispatch()
  const activeNetwork = useActiveNetworkId()
  const tokenPairs = useAppSelector(state => state.token[activeNetwork]?.[tokenAddress]?.tokenPairs)

  useEffect(() => {
    async function fetchData() {
      const allPairs = await getTokenPairs(tokenAddress)
      dispatch(setAllPairs({ networkId: activeNetwork, allPairs, address: tokenAddress }))
    }
    if (!tokenPairs && isAddress(tokenAddress)) {
      fetchData()
    }
  }, [tokenAddress, tokenPairs, activeNetwork])

  return tokenPairs || []
}

export function useTokenChartData(tokenAddress: string) {
  const dispatch = useAppDispatch()
  const activeNetwork = useActiveNetworkId()
  const chartData = useAppSelector(state => state.token[activeNetwork]?.[tokenAddress]?.chartData)
  useEffect(() => {
    async function checkForChartData() {
      if (!chartData) {
        const data = await getTokenChartData(tokenAddress)
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
      const data = await getIntervalTokenData(tokenAddress, startTime, interval, latestBlock)
      dispatch(setPriceData({ networkId: activeNetwork, timeWindow, interval, data, address: tokenAddress }))
    }
    if (!chartData) {
      fetch()
    }
  }, [chartData, interval, timeWindow, tokenAddress, latestBlock, activeNetwork])

  return chartData
}

export function useAllTokenData() {
  const activeNetwork = useActiveNetworkId()
  return useAppSelector(state => state.token[activeNetwork])
}
