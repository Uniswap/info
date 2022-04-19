import { createContext, useContext, useReducer, useMemo, useCallback, useEffect, useState } from 'react'
import { usePairData } from 'state/features/pairs/hooks'
import { EthereumNetworkInfo, TronNetworkInfo } from '../constants/networks'
import { useTimeframe, useStartTimestamp, useActiveNetworkId } from 'state/features/application/hooks'
import dayjs from 'dayjs'
import { useEthPrice } from 'state/features/global/hooks'
import { getLPReturnsOnPair, getHistoricalPairReturns } from '../utils/returns'
import { timeframeOptions } from '../constants'
import { accountApi, pairApi } from 'api'

const UPDATE_TRANSACTIONS = 'UPDATE_TRANSACTIONS'
const UPDATE_POSITIONS = 'UPDATE_POSITIONS '
const UPDATE_MINING_POSITIONS = 'UPDATE_MINING_POSITIONS'
const UPDATE_USER_POSITION_HISTORY = 'UPDATE_USER_POSITION_HISTORY'
const UPDATE_USER_PAIR_RETURNS = 'UPDATE_USER_PAIR_RETURNS'

const TRANSACTIONS_KEY = 'TRANSACTIONS_KEY'
const POSITIONS_KEY = 'POSITIONS_KEY'
const MINING_POSITIONS_KEY = 'MINING_POSITIONS_KEY'
const USER_SNAPSHOTS = 'USER_SNAPSHOTS'
const USER_PAIR_RETURNS_KEY = 'USER_PAIR_RETURNS_KEY'

const UserContext = createContext()

function useUserContext() {
  return useContext(UserContext)
}

function reducer(state, { type, payload }) {
  switch (type) {
    case UPDATE_TRANSACTIONS: {
      const { account, transactions, networkId } = payload
      return {
        ...state,
        [networkId]: {
          [account]: {
            ...state[networkId]?.[account],
            [TRANSACTIONS_KEY]: transactions
          }
        }
      }
    }
    case UPDATE_POSITIONS: {
      const { account, positions, networkId } = payload
      return {
        ...state,
        [networkId]: {
          [account]: {
            ...state[networkId]?.[account],
            [POSITIONS_KEY]: positions
          }
        }
      }
    }
    case UPDATE_MINING_POSITIONS: {
      const { account, miningPositions, networkId } = payload
      return {
        ...state,
        [networkId]: {
          [account]: {
            ...state[networkId]?.[account],
            [MINING_POSITIONS_KEY]: miningPositions
          }
        }
      }
    }
    case UPDATE_USER_POSITION_HISTORY: {
      const { account, historyData, networkId } = payload
      return {
        ...state,
        [networkId]: {
          [account]: {
            ...state[networkId]?.[account],
            [USER_SNAPSHOTS]: historyData
          }
        }
      }
    }

    case UPDATE_USER_PAIR_RETURNS: {
      const { account, pairAddress, data, networkId } = payload
      return {
        ...state,
        [networkId]: {
          [account]: {
            ...state[networkId]?.[account],
            [USER_PAIR_RETURNS_KEY]: {
              ...state[networkId]?.[account]?.[USER_PAIR_RETURNS_KEY],
              [pairAddress]: data
            }
          }
        }
      }
    }

    default: {
      throw Error(`Unexpected action type in DataContext reducer: '${type}'.`)
    }
  }
}

const INITIAL_STATE = {
  [EthereumNetworkInfo.id]: {},
  [TronNetworkInfo.id]: {}
}

export default function Provider({ children }) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE)

  const updateTransactions = useCallback((account, transactions, networkId) => {
    dispatch({
      type: UPDATE_TRANSACTIONS,
      payload: {
        account,
        transactions,
        networkId
      }
    })
  }, [])

  const updatePositions = useCallback((account, positions, networkId) => {
    dispatch({
      type: UPDATE_POSITIONS,
      payload: {
        account,
        positions,
        networkId
      }
    })
  }, [])

  const updateMiningPositions = useCallback((account, miningPositions, networkId) => {
    dispatch({
      type: UPDATE_MINING_POSITIONS,
      payload: {
        account,
        miningPositions,
        networkId
      }
    })
  }, [])

  const updateUserSnapshots = useCallback((account, historyData, networkId) => {
    dispatch({
      type: UPDATE_USER_POSITION_HISTORY,
      payload: {
        account,
        historyData,
        networkId
      }
    })
  }, [])

  const updateUserPairReturns = useCallback((account, pairAddress, data, networkId) => {
    dispatch({
      type: UPDATE_USER_PAIR_RETURNS,
      payload: {
        account,
        pairAddress,
        data,
        networkId
      }
    })
  }, [])

  return (
    <UserContext.Provider
      value={useMemo(
        () => [
          state,
          { updateTransactions, updatePositions, updateMiningPositions, updateUserSnapshots, updateUserPairReturns }
        ],
        [state, updateTransactions, updatePositions, updateMiningPositions, updateUserSnapshots, updateUserPairReturns]
      )}
    >
      {children}
    </UserContext.Provider>
  )
}

async function getUserTransactions(account) {
  try {
    let result = await accountApi.getUserTransactions(account)
    return result
  } catch (e) {
    console.log(e)
  }
}

async function getUserHistory(account) {
  try {
    let skip = 0
    let allResults = []
    let found = false
    while (!found) {
      let result = await accountApi.getUserLiquidityPositionSnapshots(account, skip)
      allResults = allResults.concat(result.data.liquidityPositionSnapshots)
      if (result.data.liquidityPositionSnapshots.length < 1000) {
        found = true
      } else {
        skip += 1000
      }
    }
    return allResults
  } catch (e) {
    console.log(e)
  }
}

async function getUserLiquidityChart(account, startDateTimestamp, history) {
  let dayIndex = parseInt(startDateTimestamp / 86400) // get unique day bucket unix
  const currentDayIndex = parseInt(dayjs.utc().unix() / 86400)

  // sort snapshots in order
  let sortedPositions = history.sort((a, b) => {
    return parseInt(a.timestamp) > parseInt(b.timestamp) ? 1 : -1
  })
  // if UI start time is > first position time - bump start index to this time
  if (parseInt(sortedPositions[0].timestamp) > dayIndex) {
    dayIndex = parseInt(parseInt(sortedPositions[0].timestamp) / 86400)
  }

  const dayTimestamps = []
  // get date timestamps for all days in view
  while (dayIndex < currentDayIndex) {
    dayTimestamps.push(parseInt(dayIndex) * 86400)
    dayIndex = dayIndex + 1
  }

  const pairs = history.reduce((pairList, position) => {
    return [...pairList, position.pair.id]
  }, [])

  // get all day datas where date is in this list, and pair is in pair list
  let {
    data: { pairDayDatas }
  } = await pairApi.getPairDayDataBulk(pairs, startDateTimestamp)

  const formattedHistory = []

  // map of current pair => ownership %
  const ownershipPerPair = {}
  for (const index in dayTimestamps) {
    const dayTimestamp = dayTimestamps[index]
    const timestampCeiling = dayTimestamp + 86400

    // cycle through relevant positions and update ownership for any that we need to
    const relevantPositions = history.filter(snapshot => {
      return snapshot.timestamp < timestampCeiling && snapshot.timestamp > dayTimestamp
    })
    for (const index in relevantPositions) {
      const position = relevantPositions[index]
      // case where pair not added yet
      if (!ownershipPerPair[position.pair.id]) {
        ownershipPerPair[position.pair.id] = {
          lpTokenBalance: position.liquidityTokenBalance,
          timestamp: position.timestamp
        }
      }
      // case where more recent timestamp is found for pair
      if (ownershipPerPair[position.pair.id] && ownershipPerPair[position.pair.id].timestamp < position.timestamp) {
        ownershipPerPair[position.pair.id] = {
          lpTokenBalance: position.liquidityTokenBalance,
          timestamp: position.timestamp
        }
      }
    }

    const relavantDayDatas = Object.keys(ownershipPerPair).map(pairAddress => {
      // find last day data after timestamp update
      const dayDatasForThisPair = pairDayDatas.filter(dayData => {
        return dayData.pairAddress === pairAddress
      })
      // find the most recent reference to pair liquidity data
      let mostRecent = dayDatasForThisPair[0]
      for (const index in dayDatasForThisPair) {
        const dayData = dayDatasForThisPair[index]
        if (dayData.date < dayTimestamp && dayData.date > mostRecent.date) {
          mostRecent = dayData
        }
      }
      return mostRecent
    })

    // now cycle through pair day datas, for each one find usd value = ownership[address] * reserveUSD
    const dailyUSD = relavantDayDatas.reduce((totalUSD, dayData) => {
      return (totalUSD =
        totalUSD +
        (ownershipPerPair[dayData.pairAddress]
          ? (parseFloat(ownershipPerPair[dayData.pairAddress].lpTokenBalance) / parseFloat(dayData.totalSupply)) *
            parseFloat(dayData.reserveUSD)
          : 0))
    }, 0)

    formattedHistory.push({
      date: dayTimestamp,
      valueUSD: dailyUSD
    })
  }

  return formattedHistory
}

async function getUserPositions(account, price, snapshots) {
  try {
    let result = await accountApi.getUserLiquidityPositions(account)
    if (result?.data?.liquidityPositions) {
      let formattedPositions = await Promise.all(
        result?.data?.liquidityPositions.map(async positionData => {
          const returnData = await getLPReturnsOnPair(account, positionData.pair, price, snapshots)
          return {
            ...positionData,
            ...returnData
          }
        })
      )
      return formattedPositions
    }
  } catch (e) {
    console.log(e)
  }
}

export function useUserTransactions(account) {
  const [state, { updateTransactions }] = useUserContext()
  const activeNetwork = useActiveNetworkId()
  const transactions = state[activeNetwork]?.[account]?.[TRANSACTIONS_KEY]

  useEffect(() => {
    async function fetchData(account) {
      const result = await getUserTransactions(account)

      if (result?.data) {
        updateTransactions(account, result?.data, activeNetwork)
      }
    }
    if (!transactions && account) {
      fetchData(account)
    }
  }, [account, transactions, updateTransactions, activeNetwork])

  return transactions || {}
}

/**
 * Store all the snapshots of liquidity activity for this account.
 * Each snapshot is a moment when an LP position was created or updated.
 * @param {*} account
 */
export function useUserSnapshots(account) {
  const [state, { updateUserSnapshots }] = useUserContext()
  const activeNetwork = useActiveNetworkId()
  const snapshots = state[activeNetwork]?.[account]?.[USER_SNAPSHOTS]

  useEffect(() => {
    async function fetchData() {
      const result = await getUserHistory(account)
      if (result) {
        updateUserSnapshots(account, result, activeNetwork)
      }
    }
    if (!snapshots && account) {
      fetchData()
    }
  }, [account, snapshots, updateUserSnapshots, activeNetwork])

  return snapshots
}

/**
 * For a given position (data about holding) and user, get the chart
 * data for the fees and liquidity over time
 * @param {*} position
 * @param {*} account
 */
export function useUserPositionChart(position, account) {
  const pairAddress = position?.pair?.id
  const [state, { updateUserPairReturns }] = useUserContext()
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
  const [price] = useEthPrice()

  // formatetd array to return for chart data
  const formattedHistory = state[activeNetwork]?.[account]?.[USER_PAIR_RETURNS_KEY]?.[pairAddress]

  useEffect(() => {
    async function fetchData() {
      let fetchedData = await getHistoricalPairReturns(startDateTimestamp, currentPairData, pairSnapshots, price)
      updateUserPairReturns(account, pairAddress, fetchedData, activeNetwork)
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
    updateUserPairReturns,
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
export function useUserLiquidityChart(account) {
  const history = useUserSnapshots(account)
  // formatetd array to return for chart data
  const [formattedHistory, setFormattedHistory] = useState()

  const [startDateTimestamp, setStartDateTimestamp] = useState()
  const [activeWindow] = useTimeframe()

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
    let startTime = utcStartTime.unix() - 1
    if ((activeWindow && startTime < startDateTimestamp) || !startDateTimestamp) {
      setStartDateTimestamp(startTime)
    }
  }, [activeWindow, startDateTimestamp])

  useEffect(() => {
    async function fetchData() {
      const formattedHistory = await getUserLiquidityChart(account, startDateTimestamp, history)
      setFormattedHistory(formattedHistory)
    }
    if (history && startDateTimestamp && history.length > 0) {
      fetchData()
    }
  }, [history, startDateTimestamp])

  return formattedHistory
}

export function useUserPositions(account) {
  const [state, { updatePositions }] = useUserContext()
  const activeNetwork = useActiveNetworkId()
  const positions = state[activeNetwork]?.[account]?.[POSITIONS_KEY]

  const snapshots = useUserSnapshots(account)
  const [price] = useEthPrice()

  useEffect(() => {
    async function fetchData(account) {
      try {
        const positions = await getUserPositions(account, price, snapshots)
        if (positions) {
          updatePositions(account, positions, activeNetwork)
        }
      } catch (e) {
        console.log(e)
      }
    }
    if (!positions && account && price && snapshots) {
      fetchData(account)
    }
  }, [account, positions, updatePositions, price, snapshots, activeNetwork])

  return positions
}
