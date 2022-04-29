import { timeframeOptions } from '../../../constants'
import dayjs from 'dayjs'
import { isAddress } from 'ethers/lib/utils'
import { useEffect } from 'react'
import { useLatestBlocks } from '../application/hooks'
import { useActiveNetworkId } from '../application/selectors'
import { useAppDispatch, useAppSelector } from 'state/hooks'
import { setChartData, setHourlyData, setPair, setPairTransactions, setTopPairs } from './slice'
import { useActiveTokenPrice } from '../global/selectors'
import DataService from 'data/DataService'

export function useHourlyRateData(pairAddress: string, timeWindow: string) {
  const dispatch = useAppDispatch()
  const activeNetwork = useActiveNetworkId()
  const [latestBlock] = useLatestBlocks()
  const chartData = useAppSelector(state => state.pairs[activeNetwork]?.[pairAddress]?.timeWindowData?.[timeWindow])

  useEffect(() => {
    const currentTime = dayjs.utc()
    const windowSize = timeWindow === timeframeOptions.MONTH ? 'month' : 'week'
    const startTime =
      timeWindow === timeframeOptions.ALL_TIME ? 1589760000 : currentTime.subtract(1, windowSize).startOf('hour').unix()

    async function fetch() {
      const data = await DataService.pairs.getHourlyRateData(pairAddress, startTime, latestBlock)
      dispatch(setHourlyData({ address: pairAddress, hourlyData: data, timeWindow, networkId: activeNetwork }))
    }
    if (!chartData) {
      fetch()
    }
  }, [chartData, timeWindow, pairAddress, latestBlock, activeNetwork])

  return chartData
}

/**
 * Get all the current and 24hr changes for a pair
 */
export function usePairData(pairAddress: string) {
  const dispatch = useAppDispatch()
  const activeNetwork = useActiveNetworkId()
  const price = useActiveTokenPrice()
  const pairData = useAppSelector(state => state.pairs[activeNetwork]?.[pairAddress])

  useEffect(() => {
    async function fetchData() {
      const data = await DataService.pairs.getBulkPairData([pairAddress], price)
      data && dispatch(setPair({ networkId: activeNetwork, pairAddress, data: data[0] }))
    }
    // TODO: isAddress() only work for eth not for trx
    if (!pairData && pairAddress && price && isAddress(pairAddress)) {
      fetchData()
    }
  }, [pairAddress, pairData, price, activeNetwork])

  return pairData || {}
}

/**
 * Get most recent txns for a pair
 */
export function usePairTransactions(pairAddress: string) {
  const dispatch = useAppDispatch()
  const activeNetwork = useActiveNetworkId()
  const pairTxns = useAppSelector(state => state.pairs[activeNetwork]?.[pairAddress]?.txns)
  useEffect(() => {
    async function checkForTxns() {
      if (!pairTxns) {
        const transactions = await DataService.transactions.getTransactions([pairAddress])
        dispatch(setPairTransactions({ networkId: activeNetwork, transactions, address: pairAddress }))
      }
    }
    checkForTxns()
  }, [pairTxns, pairAddress, activeNetwork])
  return pairTxns
}

export function usePairChartData(pairAddress: string) {
  const dispatch = useAppDispatch()
  const activeNetwork = useActiveNetworkId()
  const chartData = useAppSelector(state => state.pairs[activeNetwork]?.[pairAddress]?.chartData)

  useEffect(() => {
    async function checkForChartData() {
      if (!chartData) {
        const data = await DataService.pairs.getPairChartData(pairAddress)
        dispatch(setChartData({ networkId: activeNetwork, chartData: data, address: pairAddress }))
      }
    }
    checkForChartData()
  }, [chartData, pairAddress, activeNetwork])
  return chartData
}

export function useFetchPairs() {
  const dispatch = useAppDispatch()
  const activeNetwork = useActiveNetworkId()
  const price = useActiveTokenPrice()

  useEffect(() => {
    async function getData() {
      const topPairs = await DataService.pairs.getPairList(price)
      topPairs && dispatch(setTopPairs({ topPairs, networkId: activeNetwork }))
    }
    price && getData()
  }, [price, activeNetwork])
}
