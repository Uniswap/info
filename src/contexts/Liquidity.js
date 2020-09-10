import React, { createContext, useContext, useReducer, useMemo, useCallback, useEffect } from 'react'
import axios from 'axios'

const MINUTES_1 = 1 * 60 * 1000
const UPDATE = 'UPDATE'

const LiquidityContext = createContext()

function useLiquidityContext() {
  return useContext(LiquidityContext)
}

function reducer(state, { type, payload }) {
  switch (type) {
    case UPDATE: {
      const liquidity = payload

      return {
        ...state,
        ...liquidity
      }
    }
    default: {
      throw Error(`Unexpected action type in LiquidityContext reducer: '${type}'.`)
    }
  }
}

export default function Provider({ children }) {
  const [state, dispatch] = useReducer(reducer, {})

  const update = useCallback(liquidity => {
    dispatch({ type: UPDATE, payload: liquidity })
  }, [])

  return (
    <LiquidityContext.Provider
      value={useMemo(() => {
        return {
          state,
          update
        }
      }, [state, update])}
    >
      {children}
    </LiquidityContext.Provider>
  )
}

export function Updater() {
  const { update } = useLiquidityContext()

  useEffect(() => {
    let stale = false

    function get() {
      if (!stale) {
        getLiquidity().then(liquidity => {
          update(liquidity)
        })
      }
    }

    get()

    const poll = setInterval(() => {
      get()
    }, MINUTES_1)

    return () => {
      stale = true
      clearInterval(poll)
    }
  }, [update])

  return null
}

export function useLiquidity() {
  const { state } = useLiquidityContext()

  return state
}

export function useLiquidityForAsset(asset) {
  const { state } = useLiquidityContext()

  return state[asset]
}

export const getLiquidity = async () => {
  try {
    const res = await axios.get(`https://network.jelly.market/api/v1/liquidity/get`)
    return res.data
  } catch (error) {
    console.log('LIQUIDITY_ERR: ', error)
    return {}
  }
}
