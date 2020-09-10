import React, { createContext, useContext, useReducer, useMemo, useCallback, useEffect } from 'react'
import axios from 'axios'

const MINUTES_5 = 5 * 60 * 1000
const UPDATE = 'UPDATE'

const LiquidityChartContext = createContext()

function useLiquidityChartContext() {
  return useContext(LiquidityChartContext)
}

function reducer(__state, { type, payload }) {
  switch (type) {
    case UPDATE: {
      const chartData = payload
      const result = chartData.sort((a, b) => a.date - b.date)
      return [...result]
    }
    default: {
      throw Error(`Unexpected action type in LiquidityChartContext reducer: '${type}'.`)
    }
  }
}

export default function Provider({ children }) {
  const [state, dispatch] = useReducer(reducer, [])

  const update = useCallback(providers => {
    dispatch({ type: UPDATE, payload: providers })
  }, [])

  return (
    <LiquidityChartContext.Provider
      value={useMemo(() => {
        return {
          state,
          update
        }
      }, [state, update])}
    >
      {children}
    </LiquidityChartContext.Provider>
  )
}

export function Updater() {
  const { update } = useLiquidityChartContext()

  useEffect(() => {
    let stale = false

    const get = async () => {
      if (!stale) {
        const result = await getLiquidityChartData()
        update(result)
      }
    }

    get()

    const pricePoll = setInterval(() => {
      get()
    }, MINUTES_5)

    return () => {
      stale = true
      clearInterval(pricePoll)
    }
  }, [update])

  return null
}

export function useLiquidityChart() {
  const { state } = useLiquidityChartContext()
  return state
}

const getLiquidityChartData = async () => {
  try {
    const res = await axios.get(`https://spacejelly.network/candy/api/v1/stats/get`)
    return res.data
  } catch (error) {
    console.log('LIQUIDITY_CHART_DATA_ERROR: ', error)
    return {}
  }
}
