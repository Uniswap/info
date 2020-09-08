import React, { createContext, useContext, useReducer, useMemo, useCallback, useEffect } from 'react'

import { ASSETS } from '../constants/assets'

import { useLiquidity } from './Liquidity'
import { useAllPrices } from './Price'

const UPDATE = 'UPDATE'

const TokenContext = createContext()

function useTokenContext() {
  return useContext(TokenContext)
}

function reducer(state, { type, payload }) {
  switch (type) {
    case UPDATE: {
      return {
        ...state,
        ...payload
      }
    }
    default: {
      throw Error(`Unexpected action type in TokenContext reducer: '${type}'.`)
    }
  }
}

export default function Provider({ children }) {
  const [state, dispatch] = useReducer(reducer, {})

  const update = useCallback(tokenData => {
    dispatch({ type: UPDATE, payload: tokenData })
  }, [])

  return (
    <TokenContext.Provider
      value={useMemo(() => {
        return {
          state,
          update
        }
      }, [state, update])}
    >
      {children}
    </TokenContext.Provider>
  )
}

export function Updater() {
  const { update } = useTokenContext()
  const prices = useAllPrices()
  const liquidity = useLiquidity()

  useEffect(() => {
    const result = ASSETS.reduce((a, b) => {
      a.push({ ...b, priceUSD: prices[b.symbol], totalLiquidityUSD: liquidity[b.symbol] * prices[b.symbol] })
      return a
    }, [])

    update(result)
  }, [update, prices, liquidity])

  return null
}

export function useAllTokens() {
  const { state } = useTokenContext()
  return state
}

export function useToken(token) {
  const { state } = useTokenContext()

  const searchedToken = Object.keys(state).find(tokenData => state[tokenData].symbol === token)

  return state[searchedToken]
}
