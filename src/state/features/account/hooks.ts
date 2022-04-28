import { timeframeOptions } from '../../../constants'
import { getUserHistory, getUserLiquidityChart, getUserPositions, getTopLps } from 'data/ethereum/accounts'
import { getUserTransactions } from 'data/ethereum/transactions'
import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from 'state/hooks'
import { getHistoricalPairReturns } from 'utils/returns'
import { useStartTimestamp } from '../application/hooks'
import { useActiveNetworkId } from '../application/selectors'
import { usePairData } from '../pairs/hooks'
import { setPairReturns, setPositionHistory, setPositions, setTopLiquidityPositions, setTransactions } from './slice'
import { LiquidityChart, Position } from './types'
import { usePairs } from '../pairs/selectors'
import { useActiveTokenPrice } from '../global/selectors'
import { useTimeFrame } from '../application/selectors'

export function useUserTransactions(account: string) {
  const dispatch = useAppDispatch()
  const activeNetwork = useActiveNetworkId()
  const transactions = useAppSelector(state => state.account[activeNetwork].byAddress?.[account]?.transactions)

  useEffect(() => {
    async function fetchData(account: string) {
      const result = await getUserTransactions(account)
      dispatch(setTransactions({ account, transactions: result, networkId: activeNetwork }))
    }
    if (!transactions && account) {
      fetchData(account)
    }
  }, [account, transactions, activeNetwork])

  return transactions || {}
}

/**
 * Store all the snapshots of liquidity activity for this account.
 * Each snapshot is a moment when an LP position was created or updated.
 * @param {*} account
 */
export function useUserSnapshots(account: string) {
  const dispatch = useAppDispatch()
  const activeNetwork = useActiveNetworkId()
  const snapshots = useAppSelector(state => state.account[activeNetwork].byAddress?.[account]?.liquiditySnapshots)

  useEffect(() => {
    async function fetchData() {
      const result = await getUserHistory(account)
      if (result) {
        dispatch(setPositionHistory({ account, historyData: result, networkId: activeNetwork }))
      }
    }
    if (!snapshots && account) {
      fetchData()
    }
  }, [account, snapshots, activeNetwork])

  return snapshots
}

/**
 * For a given position (data about holding) and user, get the chart
 * data for the fees and liquidity over time
 * @param {*} position
 * @param {*} account
 */
export function useUserPositionChart(position: Position, account: string) {
  const dispatch = useAppDispatch()
  const pairAddress = position?.pair?.id
  const activeNetwork = useActiveNetworkId()

  // get oldest date of data to fetch
  const startDateTimestamp = useStartTimestamp()

  // get users adds and removes on this pair
  const snapshots = useUserSnapshots(account)
  const pairSnapshots =
    snapshots &&
    position &&
    snapshots.filter(currentSnapshot => {
      return currentSnapshot.pair.id === position.pair.id
    })

  // get data needed for calculations
  const currentPairData = usePairData(pairAddress)
  const price = useActiveTokenPrice()

  // formatetd array to return for chart data
  const formattedHistory = useAppSelector(
    state => state.account[activeNetwork].byAddress?.[account]?.pairReturns?.[pairAddress]
  )

  useEffect(() => {
    async function fetchData() {
      const fetchedData = await getHistoricalPairReturns(startDateTimestamp!, currentPairData, pairSnapshots, price)
      dispatch(setPairReturns({ networkId: activeNetwork, account, pairAddress, data: fetchedData }))
    }
    if (
      account &&
      startDateTimestamp &&
      pairSnapshots &&
      !formattedHistory &&
      currentPairData &&
      Object.keys(currentPairData).length > 0 &&
      pairAddress &&
      price
    ) {
      fetchData()
    }
  }, [
    account,
    startDateTimestamp,
    pairSnapshots,
    formattedHistory,
    pairAddress,
    currentPairData,
    price,
    position.pair.id,
    activeNetwork
  ])

  return formattedHistory
}

/**
 * For each day starting with min(first position timestamp, beginning of time window),
 * get total liquidity supplied by user in USD. Format in array with date timestamps
 * and usd liquidity value.
 */
export function useUserLiquidityChart(account: string) {
  const history = useUserSnapshots(account)
  // formatetd array to return for chart data
  const [formattedHistory, setFormattedHistory] = useState<LiquidityChart[]>([])

  const [startDateTimestamp, setStartDateTimestamp] = useState<number | undefined>()
  const activeWindow = useTimeFrame()

  // monitor the old date fetched
  useEffect(() => {
    const utcEndTime = dayjs.utc()
    // based on window, get starttime
    let utcStartTime
    switch (activeWindow) {
      case timeframeOptions.WEEK:
        utcStartTime = utcEndTime.subtract(1, 'week').startOf('day')
        break
      case timeframeOptions.ALL_TIME:
        utcStartTime = utcEndTime.subtract(1, 'year')
        break
      default:
        utcStartTime = utcEndTime.subtract(1, 'year').startOf('year')
        break
    }
    const startTime = utcStartTime.unix() - 1
    if ((startDateTimestamp && activeWindow && startTime < startDateTimestamp) || !startDateTimestamp) {
      setStartDateTimestamp(startTime)
    }
  }, [activeWindow, startDateTimestamp])

  useEffect(() => {
    async function fetchData() {
      const formattedHistory = await getUserLiquidityChart(startDateTimestamp!, [...history])
      setFormattedHistory(formattedHistory)
    }
    if (history && startDateTimestamp && history.length > 0) {
      fetchData()
    }
  }, [history, startDateTimestamp])

  return formattedHistory
}

export function useUserPositions(account: string) {
  const dispatch = useAppDispatch()
  const activeNetwork = useActiveNetworkId()
  const positions = useAppSelector(state => state.account[activeNetwork].byAddress?.[account]?.positions)

  const snapshots = useUserSnapshots(account)
  const price = useActiveTokenPrice()

  useEffect(() => {
    async function fetchData(account: string) {
      const positions = await getUserPositions(account, price, snapshots)
      if (positions) {
        dispatch(setPositions({ networkId: activeNetwork, account, positions }))
      }
    }
    if (!positions && account && price && snapshots) {
      fetchData(account)
    }
  }, [account, positions, price, snapshots, activeNetwork])

  return positions
}

export function useTopLiquidityPositions() {
  const dispatch = useAppDispatch()
  const activeNetwork = useActiveNetworkId()
  const topLps = useAppSelector(state => state.account[activeNetwork].topLiquidityPositions)
  const allPairs = usePairs()

  useEffect(() => {
    async function fetchData() {
      const response = await getTopLps(allPairs)
      dispatch(setTopLiquidityPositions({ liquidityPositions: response, networkId: activeNetwork }))
    }

    if (!topLps && allPairs && Object.keys(allPairs).length > 0) {
      fetchData()
    }
  })

  return topLps
}
