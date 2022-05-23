import React, { createContext, useContext, useReducer, useMemo, useCallback, useEffect, useState } from 'react'
import merge from 'deepmerge'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { usePairData } from './PairData'
import { USER_TRANSACTIONS, USER_POSITIONS, USER_HISTORY, PAIR_DAY_DATA_BULK } from '../apollo/queries'
import { useTimeframe, useStartTimestamp, useExchangeClients } from './Application'
import { useEthPrice } from './GlobalData'
import { getLPReturnsOnPair, getHistoricalPairReturns } from '../utils/returns'
import { timeframeOptions } from '../constants'
import { useNetworksInfo } from './NetworkInfo'
import { overwriteArrayMerge } from '../utils'

dayjs.extend(utc)

const UPDATE_TRANSACTIONS = 'UPDATE_TRANSACTIONS'
const UPDATE_POSITIONS = 'UPDATE_POSITIONS '
const UPDATE_USER_POSITION_HISTORY = 'UPDATE_USER_POSITION_HISTORY'
const UPDATE_USER_PAIR_RETURNS = 'UPDATE_USER_PAIR_RETURNS'

const TRANSACTIONS_KEY = 'TRANSACTIONS_KEY'
const POSITIONS_KEY = 'POSITIONS_KEY'
const USER_SNAPSHOTS = 'USER_SNAPSHOTS'
const USER_PAIR_RETURNS_KEY = 'USER_PAIR_RETURNS_KEY'

const UserContext = createContext()

function useUserContext() {
  return useContext(UserContext)
}

function reducer(state, { type, payload }) {
  switch (type) {
    case UPDATE_TRANSACTIONS: {
      const { account, transactions, chainId } = payload
      return merge(state, { [chainId]: { [account]: { [TRANSACTIONS_KEY]: transactions } } }, { arrayMerge: overwriteArrayMerge })
    }
    case UPDATE_POSITIONS: {
      const { account, positions, chainId } = payload
      return merge(state, { [chainId]: { [account]: { [POSITIONS_KEY]: positions } } }, { arrayMerge: overwriteArrayMerge })
    }

    case UPDATE_USER_POSITION_HISTORY: {
      const { account, historyData, chainId } = payload
      return merge(state, { [chainId]: { [account]: { [USER_SNAPSHOTS]: historyData } } }, { arrayMerge: overwriteArrayMerge })
    }

    case UPDATE_USER_PAIR_RETURNS: {
      const { account, pairAddress, data, chainId } = payload
      return merge(
        state,
        { [chainId]: { [account]: { [USER_PAIR_RETURNS_KEY]: { [pairAddress]: data } } } },
        { arrayMerge: overwriteArrayMerge }
      )
    }

    default: {
      throw Error(`Unexpected action type in DataContext reducer: '${type}'.`)
    }
  }
}

const INITIAL_STATE = {}

export default function Provider({ children }) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE)

  const updateTransactions = useCallback((account, transactions, chainId) => {
    dispatch({
      type: UPDATE_TRANSACTIONS,
      payload: {
        account,
        transactions,
        chainId,
      },
    })
  }, [])

  const updatePositions = useCallback((account, positions, chainId) => {
    dispatch({
      type: UPDATE_POSITIONS,
      payload: {
        account,
        positions,
        chainId,
      },
    })
  }, [])

  const updateUserSnapshots = useCallback((account, historyData, chainId) => {
    dispatch({
      type: UPDATE_USER_POSITION_HISTORY,
      payload: {
        account,
        historyData,
        chainId,
      },
    })
  }, [])

  const updateUserPairReturns = useCallback((account, pairAddress, data, chainId) => {
    dispatch({
      type: UPDATE_USER_PAIR_RETURNS,
      payload: {
        account,
        pairAddress,
        data,
        chainId,
      },
    })
  }, [])

  return (
    <UserContext.Provider
      value={useMemo(
        () => [
          state,
          {
            updateTransactions,
            updatePositions,
            updateUserSnapshots,
            updateUserPairReturns,
          },
        ],
        [state, updateTransactions, updatePositions, updateUserSnapshots, updateUserPairReturns]
      )}
    >
      {children}
    </UserContext.Provider>
  )
}

export function useUserTransactions(account) {
  const [exchangeSubgraphClient] = useExchangeClients()
  const [state, { updateTransactions }] = useUserContext()
  const [[networkInfo]] = useNetworksInfo()
  const transactions = state?.[networkInfo.chainId]?.[account]?.[TRANSACTIONS_KEY]
  useEffect(() => {
    async function fetchData(account) {
      try {
        let result = await exchangeSubgraphClient.query({
          query: USER_TRANSACTIONS,
          variables: {
            user: account,
          },
          fetchPolicy: 'no-cache',
        })
        if (result?.data) {
          result.data.burns?.forEach?.(transaction => (transaction.chainId = networkInfo.chainId))
          result.data.mints?.forEach?.(transaction => (transaction.chainId = networkInfo.chainId))
          result.data.swaps?.forEach?.(transaction => (transaction.chainId = networkInfo.chainId))
          updateTransactions(account, result?.data, networkInfo.chainId)
        }
      } catch (e) {
        console.log(e)
      }
    }
    if (!transactions && account) {
      fetchData(account)
    }
  }, [account, transactions, updateTransactions, exchangeSubgraphClient, networkInfo.chainId])

  return transactions || {}
}

/**
 * Store all the snapshots of liquidity activity for this account.
 * Each snapshot is a moment when an LP position was created or updated.
 * @param {*} account
 */
export function useUserSnapshots(account) {
  const [exchangeSubgraphClient] = useExchangeClients()
  const [state, { updateUserSnapshots }] = useUserContext()
  const [[networkInfo]] = useNetworksInfo()
  const snapshots = state?.[networkInfo.chainId]?.[account]?.[USER_SNAPSHOTS]

  useEffect(() => {
    async function fetchData() {
      try {
        let skip = 0
        let allResults = []
        let found = false
        while (!found) {
          let result = await exchangeSubgraphClient.query({
            query: USER_HISTORY,
            variables: {
              skip: skip,
              user: account,
            },
            fetchPolicy: 'cache-first',
          })
          allResults = allResults.concat(result.data.liquidityPositionSnapshots)
          // Thegraph does not allow to set $skip larger than 5000
          // https://thegraph.com/docs/developer/graphql-api#pagination
          if (result.data.liquidityPositionSnapshots.length < 1000 || skip >= 5000) {
            found = true
          } else {
            skip += 1000
          }
        }
        if (allResults) {
          updateUserSnapshots(account, allResults, networkInfo.chainId)
        }
      } catch (e) {
        console.log(e)
      }
    }
    if (!snapshots && account) {
      fetchData()
    }
  }, [account, snapshots, updateUserSnapshots, exchangeSubgraphClient, networkInfo.chainId])

  return snapshots
}

/**
 * For a given position (data about holding) and user, get the chart
 * data for the fees and liquidity over time
 * @param {*} position
 * @param {*} account
 */
export function useUserPositionChart(position, account) {
  const [exchangeSubgraphClient] = useExchangeClients()
  const pairAddress = position?.pair?.id
  const [state, { updateUserPairReturns }] = useUserContext()
  const [[networkInfo]] = useNetworksInfo()

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
  const [currentETHPrice] = useEthPrice()

  // formatetd array to return for chart data
  const formattedHistory = state?.[networkInfo.chainId]?.[account]?.[USER_PAIR_RETURNS_KEY]?.[pairAddress]

  useEffect(() => {
    async function fetchData() {
      let fetchedData = await getHistoricalPairReturns(
        exchangeSubgraphClient,
        startDateTimestamp,
        currentPairData,
        pairSnapshots,
        currentETHPrice,
        networkInfo
      )
      updateUserPairReturns(account, pairAddress, fetchedData, networkInfo.chainId)
    }
    if (
      account &&
      startDateTimestamp &&
      pairSnapshots &&
      !formattedHistory &&
      currentPairData &&
      Object.keys(currentPairData).length > 0 &&
      pairAddress &&
      currentETHPrice
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
    currentETHPrice,
    updateUserPairReturns,
    position.pair.id,
    exchangeSubgraphClient,
    networkInfo,
    networkInfo.chainId,
  ])

  return formattedHistory
}

/**
 * For each day starting with min(first position timestamp, beginning of time window),
 * get total liquidity supplied by user in USD. Format in array with date timestamps
 * and usd liquidity value.
 */
export function useUserLiquidityChart(account) {
  const [exchangeSubgraphClient] = useExchangeClients()
  const snapshots = useUserSnapshots(account)
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
      let dayIndex = parseInt(startDateTimestamp / 86400) // get unique day bucket unix
      const currentDayIndex = parseInt(dayjs.utc().unix() / 86400)

      // sort snapshots in order
      let sortedPositions = snapshots.sort((a, b) => (parseInt(a.timestamp) > parseInt(b.timestamp) ? 1 : -1))
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
      const snapshotMappedByTimestamp = {}
      dayTimestamps.forEach(dayTimestamp => (snapshotMappedByTimestamp[dayTimestamp] = []))
      snapshots.forEach(snapshot => {
        const index = parseInt(parseInt(snapshot.timestamp) / 86400) * 86400
        if (snapshotMappedByTimestamp[index]) snapshotMappedByTimestamp[index].push(snapshot)
        else {
          snapshotMappedByTimestamp[index] = [snapshot]
          console.warn('namgold: something wrong here. This if branch should not be execute.')
        }
      })

      // const pairs = snapshots.reduce((pairList, position) => [...pairList, position.pair.id], [])
      const pairs = snapshots.map(position => position.pair.id)
      // get all day datas where date is in this list, and pair is in pair list
      let {
        data: { pairDayDatas },
      } = await exchangeSubgraphClient.query({
        query: PAIR_DAY_DATA_BULK(pairs, startDateTimestamp),
      })

      const pairDayDatasMapped = {}
      pairDayDatas.forEach(pairDayData => {
        const index = pairDayData.pairAddress
        if (pairDayDatasMapped[index]) pairDayDatasMapped[index].push(pairDayData)
        else pairDayDatasMapped[index] = [pairDayData]
      })
      Object.keys(pairDayDatasMapped).forEach(address => pairDayDatasMapped[address].sort((a, b) => a.date - b.date))

      // map of current pair => ownership %
      const latestDataForPairs = {}
      const formattedHistory = dayTimestamps.map(dayTimestamp => {
        // cycle through relevant positions and update ownership for any that we need to
        const relevantPositions = snapshotMappedByTimestamp[dayTimestamp]
        relevantPositions.forEach(position => {
          // case where pair not added yet
          if (!latestDataForPairs[position.pair.id] || latestDataForPairs[position.pair.id].timestamp < position.timestamp) {
            latestDataForPairs[position.pair.id] = {
              lpTokenBalance: position.liquidityTokenBalance,
              timestamp: position.timestamp,
            }
          }
        })

        // find last day data after timestamp update
        // find the most recent reference to pair liquidity data
        const relevantDayDatas = Object.keys(latestDataForPairs).map(pairAddress =>
          pairDayDatasMapped[pairAddress].findLast(dayData => dayData.date < dayTimestamp)
        )

        // now cycle through pair day datas, for each one find usd value = ownership[address] * reserveUSD
        let totalUSD = 0
        relevantDayDatas.forEach(dayData => {
          if (dayData && latestDataForPairs[dayData.pairAddress]) {
            const currentSumData =
              (parseFloat(latestDataForPairs[dayData.pairAddress].lpTokenBalance) / parseFloat(dayData.totalSupply)) *
              parseFloat(dayData.reserveUSD)
            if (currentSumData) {
              totalUSD += currentSumData
            }
          }
        })

        return {
          date: dayTimestamp,
          valueUSD: totalUSD,
        }
      })

      setFormattedHistory(formattedHistory)
    }
    if (snapshots && startDateTimestamp && snapshots.length > 0) {
      fetchData()
    }
  }, [snapshots, startDateTimestamp, exchangeSubgraphClient])

  return formattedHistory
}

export function useUserPositions(account) {
  const [exchangeSubgraphClient] = useExchangeClients()
  const [state, { updatePositions }] = useUserContext()
  const [[networkInfo]] = useNetworksInfo()
  const positions = state?.[networkInfo.chainId]?.[account]?.[POSITIONS_KEY]

  const snapshots = useUserSnapshots(account)
  const [[ethPrice]] = useEthPrice()

  useEffect(() => {
    async function fetchData(account) {
      try {
        let result = await exchangeSubgraphClient.query({
          query: USER_POSITIONS,
          variables: {
            user: account,
          },
          fetchPolicy: 'no-cache',
        })
        if (result?.data?.liquidityPositions) {
          let formattedPositions = await Promise.all(
            result?.data?.liquidityPositions.map(async positionData => {
              const returnData = await getLPReturnsOnPair(
                exchangeSubgraphClient,
                account,
                positionData.pair,
                ethPrice,
                snapshots,
                networkInfo
              )
              return {
                ...positionData,
                ...returnData,
              }
            })
          )
          updatePositions(account, formattedPositions, networkInfo.chainId)
        }
      } catch (e) {
        console.log(e)
      }
    }
    if (!positions && account && ethPrice && snapshots) {
      fetchData(account)
    }
  }, [account, positions, updatePositions, ethPrice, snapshots, exchangeSubgraphClient, networkInfo])

  return positions
}
