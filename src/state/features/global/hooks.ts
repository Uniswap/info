import DataService from 'data/DataService'
import { useState, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from 'state/hooks'
import { getTimeframe } from 'utils'
import { useActiveNetworkId } from '../application/selectors'
import { useTimeFrame } from '../application/selectors'
import {
  useActiveTokenOneDayPrice,
  useActiveTokenPrice,
  useGlobalChartDataSelector,
  useGlobalTransactionsSelector
} from './selectors'
import { setChart, setGlobalData, setPrice, setTransactions } from './slice'

/**
 * Hook that fetches overview data, plus all tokens and pairs for search
 */
export function useGlobalData() {
  const dispatch = useAppDispatch()
  const activeNetwork = useActiveNetworkId()
  const data = useAppSelector(state => state.global[activeNetwork]?.globalData)
  const price = useActiveTokenPrice()
  const oneDayPrice = useActiveTokenOneDayPrice()

  useEffect(() => {
    async function fetchData() {
      const globalData = await DataService.global.getGlobalData(price, oneDayPrice)
      dispatch(setGlobalData({ data: globalData, networkId: activeNetwork }))
    }
    if (price && oneDayPrice) {
      fetchData()
    }
  }, [price, oneDayPrice, activeNetwork])

  return data
}

export function useGlobalChartData() {
  const dispatch = useAppDispatch()
  const activeNetwork = useActiveNetworkId()
  const [oldestDateFetch, setOldestDateFetched] = useState<number | undefined>()
  const activeWindow = useTimeFrame()
  const chartData = useGlobalChartDataSelector()

  /**
   * Keep track of oldest date fetched. Used to
   * limit data fetched until its actually needed.
   * (dont fetch year long stuff unless year option selected)
   */
  useEffect(() => {
    // based on window, get starttime
    const startTime = getTimeframe(activeWindow)

    if ((oldestDateFetch && activeWindow && startTime < oldestDateFetch) || !oldestDateFetch) {
      setOldestDateFetched(startTime)
    }
  }, [activeWindow, oldestDateFetch])

  /**
   * Fetch data if none fetched or older data is needed
   */
  useEffect(() => {
    async function fetchData() {
      // historical stuff for chart
      const result = await DataService.global.getChartData(oldestDateFetch!)
      dispatch(setChart({ data: result, networkId: activeNetwork }))
    }
    if (oldestDateFetch) {
      fetchData()
    }
  }, [oldestDateFetch, activeNetwork])

  return chartData
}

export function useGlobalTransactions() {
  const dispatch = useAppDispatch()
  const activeNetwork = useActiveNetworkId()
  const transactions = useGlobalTransactionsSelector()

  useEffect(() => {
    async function fetchData() {
      const txns = await DataService.transactions.getAllTransactions()
      dispatch(setTransactions({ transactions: txns, networkId: activeNetwork }))
    }
    fetchData()
  }, [activeNetwork])

  return transactions
}

export function useFetchActiveTokenPrice() {
  const dispatch = useAppDispatch()
  const activeNetwork = useActiveNetworkId()

  useEffect(() => {
    async function checkForPrice() {
      const [newPrice, newOneDayPrice, priceChange] = await DataService.global.getPrice()
      dispatch(setPrice({ price: newPrice, oneDayPrice: newOneDayPrice, priceChange, networkId: activeNetwork }))
    }
    checkForPrice()
  }, [activeNetwork])
}
