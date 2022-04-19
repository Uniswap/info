import { useAllPairData } from 'contexts/PairData'
import { getGlobalData, getChartData, getGlobalTransactions, getPrice, getTopLps } from 'data/ethereum/global'
import { useState, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from 'state/hooks'
import { getTimeframe } from 'utils'
import { useActiveNetworkId, useTimeframe } from '../application/hooks'
import { updateChart, updateGlobalData, updatePrice, updateTopLps, updateTransactions } from './slice'

/**
 * Hook that fetches overview data, plus all tokens and pairs for search
 */
export function useGlobalData() {
  const dispatch = useAppDispatch()
  const activeNetwork = useActiveNetworkId()
  const data = useAppSelector(state => state.global[activeNetwork].globalData)
  const [price, oldPrice] = useEthPrice()

  useEffect(() => {
    async function fetchData() {
      const globalData = await getGlobalData(price, oldPrice)
      globalData && dispatch(updateGlobalData({ data: globalData, networkId: activeNetwork }))
    }
    if (!data && price && oldPrice) {
      fetchData()
    }
  }, [price, oldPrice, data, activeNetwork])

  return data || {}
}

export function useGlobalChartData() {
  const dispatch = useAppDispatch()
  const activeNetwork = useActiveNetworkId()
  const [oldestDateFetch, setOldestDateFetched] = useState<number | undefined>()
  const [activeWindow] = useTimeframe()
  const chartData = useAppSelector(state => state.global[activeNetwork].chartData)
  const daily = chartData?.daily
  const weekly = chartData?.weekly

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
      const [newChartData, newWeeklyData] = await getChartData(oldestDateFetch!)
      dispatch(updateChart({ daily: newChartData, weekly: newWeeklyData, networkId: activeNetwork }))
    }
    if (oldestDateFetch && !(daily && weekly)) {
      fetchData()
    }
  }, [daily, weekly, oldestDateFetch, activeNetwork])

  return [daily, weekly]
}

export function useGlobalTransactions() {
  const dispatch = useAppDispatch()
  const activeNetwork = useActiveNetworkId()
  const transactions = useAppSelector(state => state.global[activeNetwork].transactions)

  useEffect(() => {
    async function fetchData() {
      if (!transactions) {
        const txns = await getGlobalTransactions()
        dispatch(updateTransactions({ transactions: txns, networkId: activeNetwork }))
      }
    }
    fetchData()
  }, [transactions, activeNetwork])
  return transactions
}

export function useEthPrice() {
  const dispatch = useAppDispatch()
  const activeNetwork = useActiveNetworkId()
  const price = useAppSelector(state => state.global[activeNetwork].price)
  const oneDayPrice = useAppSelector(state => state.global[activeNetwork].oneDayPrice)

  useEffect(() => {
    async function checkForPrice() {
      if (!price) {
        const [newPrice, newOneDayPrice, priceChange] = await getPrice()
        dispatch(updatePrice({ price: newPrice, oneDayPrice: newOneDayPrice, priceChange, networkId: activeNetwork }))
      }
    }
    checkForPrice()
  }, [price, activeNetwork])

  return [price, oneDayPrice]
}

export function useTopLps() {
  const dispatch = useAppDispatch()
  const activeNetwork = useActiveNetworkId()
  const topLps = useAppSelector(state => state.global[activeNetwork].topLps)

  const allPairs = useAllPairData()

  useEffect(() => {
    async function fetchData() {
      const response = await getTopLps(allPairs)
      dispatch(updateTopLps({ topLps: response, networkId: activeNetwork }))
    }

    if (!topLps && allPairs && Object.keys(allPairs).length > 0) {
      fetchData()
    }
  })

  return topLps
}
