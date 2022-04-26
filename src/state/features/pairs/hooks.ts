import { timeframeOptions } from '../../../constants'
import {
  getBulkPairData,
  getHourlyRateData,
  getPairTransactions,
  getPairChartData,
  getPairList
} from 'data/ethereum/pairs'
import dayjs from 'dayjs'
import { isAddress } from 'ethers/lib/utils'
import { useEffect, useState } from 'react'
import { useActiveNetworkId, useLatestBlocks } from '../application/hooks'
import { useAppDispatch, useAppSelector } from 'state/hooks'
import { setChartData, setHourlyData, setPair, setPairTransactions, setTopPairs } from './slice'
import { Pair } from './types'
import { useActiveTokenPrice } from '../global/selectors'

export function usePairUpdater() {
  const dispatch = useAppDispatch()
  const activeNetwork = useActiveNetworkId()
  const price = useActiveTokenPrice()

  useEffect(() => {
    async function getData() {
      const topPairs = await getPairList(price)
      topPairs && dispatch(setTopPairs({ topPairs, networkId: activeNetwork }))
    }
    price && getData()
  }, [price, activeNetwork])
}

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
      const data = await getHourlyRateData(pairAddress, startTime, latestBlock)
      dispatch(setHourlyData({ address: pairAddress, hourlyData: data, timeWindow, networkId: activeNetwork }))
    }
    if (!chartData) {
      fetch()
    }
  }, [chartData, timeWindow, pairAddress, latestBlock, activeNetwork])

  return chartData
}

/**
 * @todo
 * store these updates to reduce future redundant calls
 */
export function useDataForList(pairList: Pair[]) {
  const price = useActiveTokenPrice()
  const activeNetwork = useActiveNetworkId()
  const pairs = useAppSelector(state => state.pairs[activeNetwork])
  const [pairsData, setPairsData] = useState<Record<string, Pair[]>>({})

  useEffect(() => {
    async function fetchNewPairData() {
      const newFetched: Pair[] = []
      const unfetched: string[] = []

      pairList.map(async pair => {
        const currentData = pairs?.[pair.id]
        if (!currentData) {
          unfetched.push(pair.id)
        } else {
          newFetched.push(currentData)
        }
      })

      const newPairData: Pair[] | undefined = await getBulkPairData(
        unfetched.map(pair => pair),
        price
      )
      if (newPairData) {
        const response = newFetched.concat(newPairData)
        const newFetchedPairs = response?.reduce((obj, cur) => ({ ...obj, [cur?.id]: cur }), {})
        setPairsData(newFetchedPairs)
      }
    }
    if (price && pairList && pairList.length > 0) {
      fetchNewPairData()
    }
  }, [price, pairs, pairList, activeNetwork])

  return pairsData
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
      const data = await getBulkPairData([pairAddress], price)
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
        const transactions = await getPairTransactions(pairAddress)
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
        const data = await getPairChartData(pairAddress)
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
      const topPairs = await getPairList(price)
      topPairs && dispatch(setTopPairs({ topPairs, networkId: activeNetwork }))
    }
    price && getData()
  }, [price, activeNetwork])
}
