import React, { createContext, useContext, useReducer, useMemo, useCallback, useEffect, useState } from 'react'
import { client } from '../apollo/client'
import { USER_TRANSACTIONS, USER_POSITIONS } from '../apollo/queries'
import { useTimeframe } from './Application'
import { timeframeOptions } from '../constants'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { getBlockFromTimestamp } from '../helpers'

dayjs.extend(utc)

const UPDATE_TRANSACTIONS = 'UPDATE_TRANSACTIONS'
const UPDATE_POSITIONS = 'UPDATE_POSITIONS '
const UPDATE_USER_POSITION_HISTORY = 'UPDATE_USER_POSITION_HISTORY'

const TRANSACTIONS_KEY = 'TRANSACTIONS_KEY'
const POSITIONS_KEY = 'POSITIONS_KEY'
const USER_POSITION_HISTORY_KEY = 'POSITIONS_KEY'

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
      const { account, chartData } = payload
      return {
        ...state,
        [account]: { ...state?.[account], [USER_POSITION_HISTORY_KEY]: chartData }
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

  const updateUserPositionHistory = useCallback((account, chartData) => {
    dispatch({
      type: UPDATE_USER_POSITION_HISTORY,
      payload: {
        account,
        chartData
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
  const transactions = state?.[account]?.[TRANSACTIONS_KEY]

  const [oldestDateFetch, setOldestDateFetched] = useState()
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
    if ((activeWindow && startTime < oldestDateFetch) || !oldestDateFetch) {
      setOldestDateFetched(startTime)
    }
  }, [activeWindow, oldestDateFetch])

  /**
   * 1. consume timestamp rang for chart
   * 2. for each day within range, get block for end of day into array
   * 3. for each block, get snapshot of user
   * 4. for each snapshot, sum up over LP positions to get totals
   * 5. return formatted array of objects
   */

  useEffect(() => {
    async function fetchData() {
      try {
        let currentTime = oldestDateFetch
        while (currentTime < dayjs.utc()) {
          let blockFromTime = await getBlockFromTimestamp(currentTime.endOf('day'))
          let result = await client.query({
            query: USER_TRANSACTIONS,
            variables: {
              user: account
            },
            fetchPolicy: 'no-cache'
          })
          if (result?.data) {
            updateUserPositionHistory(account, result?.data)
          }
          currentTime = currentTime + 86400
        }
      } catch (e) {
        console.log(e)
      }
    }
    if (!transactions && account) {
      fetchData()
    }
  }, [account, transactions, updateUserPositionHistory])

  return transactions || {}
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

  return positions || {}
}
