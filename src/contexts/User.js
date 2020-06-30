import React, { createContext, useContext, useReducer, useMemo, useCallback, useEffect, useState } from 'react'
import { client } from '../apollo/client'
import { USER_TRANSACTIONS, USER_POSITIONS, USER_HISTORY, PAIR_DAY_DATA } from '../apollo/queries'
import { useTimeframe } from './Application'
import { timeframeOptions } from '../constants'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'

dayjs.extend(utc)

const UPDATE_TRANSACTIONS = 'UPDATE_TRANSACTIONS'
const UPDATE_POSITIONS = 'UPDATE_POSITIONS '
const UPDATE_USER_POSITION_HISTORY = 'UPDATE_USER_POSITION_HISTORY'

const TRANSACTIONS_KEY = 'TRANSACTIONS_KEY'
const POSITIONS_KEY = 'POSITIONS_KEY'
const USER_POSITION_HISTORY_KEY = 'USER_POSITION_HISTORY_KEY'

const UserContext = createContext()

function useUserContext() {
  return useContext(UserContext)
}

function reducer(state, { type, payload }) {
  switch (type) {
    case UPDATE_TRANSACTIONS: {
      const { account, transactions } = payload
      return {
        ...state,
        [account]: {
          ...state?.[account],
          [TRANSACTIONS_KEY]: transactions
        }
      }
    }
    case UPDATE_POSITIONS: {
      const { account, positions } = payload
      return {
        ...state,
        [account]: { ...state?.[account], [POSITIONS_KEY]: positions }
      }
    }

    case UPDATE_USER_POSITION_HISTORY: {
      const { account, historyData } = payload
      return {
        ...state,
        [account]: { ...state?.[account], [USER_POSITION_HISTORY_KEY]: historyData }
      }
    }

    default: {
      throw Error(`Unexpected action type in DataContext reducer: '${type}'.`)
    }
  }
}

const INITIAL_STATE = {}

export default function Provider({ children }) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE)

  const updateTransactions = useCallback((account, transactions) => {
    dispatch({
      type: UPDATE_TRANSACTIONS,
      payload: {
        account,
        transactions
      }
    })
  }, [])

  const updatePositions = useCallback((account, positions) => {
    dispatch({
      type: UPDATE_POSITIONS,
      payload: {
        account,
        positions
      }
    })
  }, [])

  const updateUserPositionHistory = useCallback((account, historyData) => {
    dispatch({
      type: UPDATE_USER_POSITION_HISTORY,
      payload: {
        account,
        historyData
      }
    })
  }, [])

  return (
    <UserContext.Provider
      value={useMemo(() => [state, { updateTransactions, updatePositions, updateUserPositionHistory }], [
        state,
        updateTransactions,
        updatePositions,
        updateUserPositionHistory
      ])}
    >
      {children}
    </UserContext.Provider>
  )
}

export function useUserTransactions(account) {
  const [state, { updateTransactions }] = useUserContext()
  const transactions = state?.[account]?.[TRANSACTIONS_KEY]
  useEffect(() => {
    async function fetchData(account) {
      try {
        let result = await client.query({
          query: USER_TRANSACTIONS,
          variables: {
            user: account
          },
          fetchPolicy: 'no-cache'
        })
        if (result?.data) {
          updateTransactions(account, result?.data)
        }
      } catch (e) {
        console.log(e)
      }
    }
    if (!transactions && account) {
      fetchData(account)
    }
  }, [account, transactions, updateTransactions])

  return transactions || {}
}

export function useUserLiquidityHistory(account) {
  const [state, { updateUserPositionHistory }] = useUserContext()
  const history = state?.[account]?.[USER_POSITION_HISTORY_KEY]
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
      try {
        let result = await client.query({
          query: USER_HISTORY,
          variables: {
            user: account
          },
          fetchPolicy: 'cache-first'
        })
        if (result) {
          updateUserPositionHistory(account, result.data.liquidityPositionSnapshots)
        }
      } catch (e) {
        console.log(e)
      }
    }
    if (!history && account && startDateTimestamp) {
      fetchData()
    }
  }, [account, startDateTimestamp, history, updateUserPositionHistory])

  const getTopPairDayDatas = useCallback(async (timestampCeiling, history) => {
    let filtered = await history.map(async position => {
      if (parseInt(position.timestamp) < timestampCeiling) {
        let result = await client.query({
          query: PAIR_DAY_DATA,
          variables: {
            pairAddress: position.pair.id,
            date: parseInt(position.timestamp)
          },
          fetchPolicy: 'cache-first'
        })
        let reserveUSD = parseFloat(result?.data?.pairDayDatas?.[0]?.reserveUSD)
        let totalSupply = parseFloat(result?.data?.pairDayDatas?.[0]?.totalSupply)
        const value = (reserveUSD * parseFloat(position.liquidityTokenBalance)) / parseFloat(totalSupply)
        return { pairAddress: position.pair.id, timestamp: position.timestamp, value }
      } else return false
    })
    return Promise.all(filtered)
  }, [])

  useEffect(() => {
    async function fetchData() {
      /**
       * 1. get all snapshots
       * 2. starting with t0, increment days until now
       * 3. for each day, grab latest snapshots for each pair
       * 4. for each of those, grab day data for that pair on that date
       * 5. calculate USD val for each one, then aggregate
       */
      let dayIndex = parseInt(startDateTimestamp / 86400) // get unique day bucket unix
      const currentDayIndex = parseInt(dayjs.utc().unix() / 86400)
      let sortedPositions = history.sort((a, b) => {
        if (parseInt(a.timestamp) > parseInt(b.timestamp)) {
          return 1
        }
        return -1
      })
      if (parseInt(sortedPositions[0].timestamp) > dayIndex) {
        dayIndex = parseInt(parseInt(sortedPositions[0].timestamp) / 86400)
      }

      let formattedHistory = []
      while (dayIndex < currentDayIndex) {
        let dayData = {}
        let timestampCeiling = dayIndex * 86400 + 86400
        let liquiditySumUSD = 0
        let pairTopValues = await getTopPairDayDatas(timestampCeiling, history)
        let removeDuplicates = {}
        pairTopValues.map(pairData => {
          if (
            pairData &&
            ((removeDuplicates[pairData.pairAddress] &&
              removeDuplicates[pairData.pairAddress].timestamp < pairData.timestamp) ||
              !removeDuplicates[pairData.pairAddress])
          ) {
            removeDuplicates[pairData.pairAddress] = pairData
          }
          return true
        })
        Object.keys(removeDuplicates).map(pairAddress => {
          return (liquiditySumUSD = liquiditySumUSD + removeDuplicates[pairAddress].value)
        })

        dayData.date = parseInt(dayIndex) * 86400
        dayData.valueUSD = liquiditySumUSD
        formattedHistory.push(dayData)
        dayIndex = dayIndex + 1
      }
      setFormattedHistory(formattedHistory)
    }
    if (history) {
      fetchData()
    }
  }, [getTopPairDayDatas, history, startDateTimestamp])
  return formattedHistory
}

export function useUserPositions(account) {
  const [state, { updatePositions }] = useUserContext()
  const positions = state?.[account]?.[POSITIONS_KEY]
  useEffect(() => {
    async function fetchData(account) {
      try {
        let result = await client.query({
          query: USER_POSITIONS,
          variables: {
            user: account
          },
          fetchPolicy: 'no-cache'
        })
        if (result?.data?.liquidityPositions) {
          updatePositions(account, result?.data?.liquidityPositions)
        }
      } catch (e) {
        console.log(e)
      }
    }
    if (!positions && account) {
      fetchData(account)
    }
  }, [account, positions, updatePositions])

  return positions
}
