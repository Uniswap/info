import React, { createContext, useContext, useReducer, useMemo, useCallback, useEffect } from 'react'
import { client } from '../apollo/client'
import { USER_TRANSACTIONS, USER_POSITIONS } from '../apollo/queries'

const UPDATE_TRANSACTIONS = 'UPDATE_TRANSACTIONS'
const UPDATE_POSITIONS = 'UPDATE_POSITIONS '

const TRANSACTIONS_KEY = 'TRANSACTIONS_KEY'
const POSITIONS_KEY = 'POSITIONS_KEY'

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

  return (
    <UserContext.Provider
      value={useMemo(() => [state, { updateTransactions, updatePositions }], [
        state,
        updateTransactions,
        updatePositions
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
