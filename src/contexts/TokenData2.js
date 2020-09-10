import React, { createContext, useContext, useReducer, useMemo, useCallback, useEffect } from 'react'

import { ASSETS } from '../constants/assets'

import { useLiquidity } from './Liquidity'
import { useAllPrices } from './Price'
import { safeAccess } from '../utils'

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

  const update = useCallback(payload => {
    dispatch({ type: UPDATE, payload })
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
    const tokenData = ASSETS.reduce((a, b) => {
      a.push({ ...b, priceUSD: prices[b.symbol] || 0, totalLiquidityUSD: liquidity[b.symbol] * prices[b.symbol] || 0 })
      return a
    }, [])

    const totalLiquidity = tokenData.reduce((r, l) => {
      r += l.totalLiquidityUSD
      return r
    }, 0)

    update({ tokenData, totalLiquidity })
  }, [update, prices, liquidity])

  return null
}

export function useAllTokens() {
  const { state } = useTokenContext()
  return safeAccess(state, ['tokenData'])
}

export function useTotalLiquidity() {
  const { state } = useTokenContext()
  return safeAccess(state, ['totalLiquidity'])
}

export function useToken(token) {
  const { state } = useTokenContext()

  const data = safeAccess(state, ['tokenData']) || []

  const searchedToken = Object.keys(data).find(tokenData => data[tokenData].symbol === token)

  return data[searchedToken]
}
