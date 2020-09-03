import React, { createContext, useContext, useReducer, useMemo, useCallback, useEffect } from 'react'

import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'

import { augurV2Client } from '../apollo/client'
import { GET_MARKETS } from '../apollo/queries'

const UPDATE = 'UPDATE'
const UPDATE_MARKETS = ' UPDATE_MARKETS'

dayjs.extend(utc)

const MarketDataaContext = createContext()

function useMarketDataContext() {
  return useContext(MarketDataaContext)
}

function reducer(state, { type, payload }) {
  switch (type) {
    case UPDATE: {
      const { tokenAddress, data } = payload
      return {
        ...state,
        [tokenAddress]: {
          ...state?.[tokenAddress],
          ...data
        }
      }
    }
    case UPDATE_MARKETS: {
      const { markets } = payload

      return {
        ...state,
        ...markets
      }
    }

    default: {
      throw Error(`Unexpected action type in DataContext reducer: '${type}'.`)
    }
  }
}

export default function Provider({ children }) {
  const [state, dispatch] = useReducer(reducer, {})
  const update = useCallback((tokenAddress, data) => {
    dispatch({
      type: UPDATE,
      payload: {
        tokenAddress,
        data
      }
    })
  }, [])

  const updateMarkets = useCallback(markets => {
    dispatch({
      type: UPDATE_MARKETS,
      payload: {
        markets
      }
    })
  }, [])

  return (
    <MarketDataaContext.Provider
      value={useMemo(
        () => [
          state,
          {
            update,
            updateMarkets
          }
        ],
        [state, update, updateMarkets]
      )}
    >
      {children}
    </MarketDataaContext.Provider>
  )
}

export function Updater() {
  const [, { updateMarkets }] = useMarketDataContext()
  useEffect(() => {
    async function getData() {
      const response = await augurV2Client.query({ query: GET_MARKETS })
      response && updateMarkets(response.data)
    }
    getData()
  }, [updateMarkets])
  return null
}

export function useAllMarketData() {
  const [state] = useMarketDataContext()
  return state
}
