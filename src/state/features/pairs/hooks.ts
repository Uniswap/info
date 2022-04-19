import { pairApi } from 'api'
import { timeframeOptions } from '../../../constants'
import { getBulkPairData, getHourlyRateData, getPairTransactions, getPairChartData } from 'data/ethereum/pairs'
import dayjs from 'dayjs'
import { isAddress } from 'ethers/lib/utils'
import { useEffect, useState } from 'react'
import { useActiveNetworkId, useLatestBlocks } from '../application/hooks'
import { useEthPrice } from '../global/hooks'
import { useAppDispatch, useAppSelector } from 'state/hooks'
import { updateChartData, updateHourlyData, updatePair, updatePairTransactions, updateTopPairs } from './slice'
import { Pair } from './types'

export function usePairUpdater() {
  const dispatch = useAppDispatch()
  const activeNetwork = useActiveNetworkId()
  const [price] = useEthPrice()

  useEffect(() => {
    async function getData() {
      // get top pairs by reserves
      const {
        data: { pairs }
      } = await pairApi.getCurrentPairs()

      // format as array of addresses
      const formattedPairs = pairs.map((pair: Pair) => {
        return pair.id
      })

      // get data for every pair in list
      const topPairs = await getBulkPairData(formattedPairs, price)
      topPairs && dispatch(updateTopPairs({ topPairs, networkId: activeNetwork }))
    }
    price && getData()
  }, [price, activeNetwork])
}

export function useHourlyRateData(pairAddress: string, timeWindow: string) {
  const dispatch = useAppDispatch()
  const activeNetwork = useActiveNetworkId()
  const [latestBlock] = useLatestBlocks()
  const chartData = useAppSelector(state => state.pairs[activeNetwork]?.[pairAddress]?.hourlyData?.[timeWindow])

  useEffect(() => {
    const currentTime = dayjs.utc()
    const windowSize = timeWindow === timeframeOptions.MONTH ? 'month' : 'week'
    const startTime =
      timeWindow === timeframeOptions.ALL_TIME ? 1589760000 : currentTime.subtract(1, windowSize).startOf('hour').unix()

    async function fetch() {
      const data = await getHourlyRateData(pairAddress, startTime, latestBlock)
      dispatch(updateHourlyData({ address: pairAddress, hourlyData: data, timeWindow, networkId: activeNetwork }))
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
  const [price] = useEthPrice()
  const activeNetwork = useActiveNetworkId()
  const pairs = useAppSelector(state => state.pairs[activeNetwork])
  const [stale, setStale] = useState(false)
  const [fetched, setFetched] = useState<Pair[]>([])

  // reset
  useEffect(() => {
    if (pairList) {
      setStale(false)
      setFetched([])
    }
  }, [pairList])

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
        unfetched.map(pair => {
          return pair
        }),
        price
      )
      if (newPairData) {
        setFetched(newFetched.concat(newPairData))
      }
    }
    if (price && pairList && pairList.length > 0 && !fetched && !stale) {
      setStale(true)
      fetchNewPairData()
    }
  }, [price, pairs, pairList, stale, fetched, activeNetwork])

  const formattedFetch =
    fetched &&
    fetched.reduce((obj, cur) => {
      return { ...obj, [cur?.id]: cur }
    }, {})

  return formattedFetch
}

/**
 * Get all the current and 24hr changes for a pair
 */
export function usePairData(pairAddress: string) {
  const dispatch = useAppDispatch()
  const activeNetwork = useActiveNetworkId()
  const [price] = useEthPrice()
  const pairData = useAppSelector(state => state.pairs[activeNetwork]?.[pairAddress])

  useEffect(() => {
    async function fetchData() {
      const data = await getBulkPairData([pairAddress], price)
      data && dispatch(updatePair({ networkId: activeNetwork, pairAddress, data: data[0] }))
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
        dispatch(updatePairTransactions({ networkId: activeNetwork, transactions, address: pairAddress }))
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
        dispatch(updateChartData({ networkId: activeNetwork, chartData: data, address: pairAddress }))
      }
    }
    checkForChartData()
  }, [chartData, pairAddress, activeNetwork])
  return chartData
}

/**
 * Get list of all pairs in Uniswap
 */
export function useAllPairData() {
  const activeNetwork = useActiveNetworkId()
  return useAppSelector(state => state.pairs[activeNetwork])
}
