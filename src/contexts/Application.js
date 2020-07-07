import React, { createContext, useContext, useReducer, useMemo, useCallback } from 'react'
import { timeframeOptions } from '../constants'

const UPDATE = 'UPDATE'
const UPDATE_TIMEFRAME = 'UPDATE_TIMEFRAME'
const UPDATE_WARNING_KEY = 'UPDATE_WARNING_KEY'

const TIME_KEY = 'TIME_KEY'
const CURRENCY = 'CURRENCY'
const SAVED_PATHS = 'SAVED_PATHS'

const ApplicationContext = createContext()

function useApplicationContext() {
  return useContext(ApplicationContext)
}

function reducer(state, { type, payload }) {
  switch (type) {
    case UPDATE: {
      const { currency } = payload
      return {
        ...state,
        CURRENCY: currency
      }
    }
    case UPDATE_TIMEFRAME: {
      const { newTimeFrame } = payload
      return {
        ...state,
        TIME_KEY: newTimeFrame
      }
    }
    case UPDATE_WARNING_KEY: {
      const { path } = payload
      return {
        ...state,
        [SAVED_PATHS]: {
          ...state?.[SAVED_PATHS],
          [path]: true
        }
      }
    }
    default: {
      throw Error(`Unexpected action type in DataContext reducer: '${type}'.`)
    }
  }
}

const INITIAL_STATE = {
  CURRENCY: 'USD',
  TIME_KEY: timeframeOptions.ALL_TIME
}

export default function Provider({ children }) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE)
  const update = useCallback(currency => {
    dispatch({
      type: UPDATE,
      payload: {
        currency
      }
    })
  }, [])

  const updateTimeframe = useCallback(newTimeFrame => {
    dispatch({
      type: UPDATE_TIMEFRAME,
      payload: {
        newTimeFrame
      }
    })
  }, [])

  const markPathAsClicked = useCallback(path => {
    dispatch({
      type: UPDATE_WARNING_KEY,
      payload: {
        path
      }
    })
  }, [])

  return (
    <ApplicationContext.Provider
      value={useMemo(() => [state, { update, updateTimeframe, markPathAsClicked }], [
        state,
        update,
        updateTimeframe,
        markPathAsClicked
      ])}
    >
      {children}
    </ApplicationContext.Provider>
  )
}

export function useCurrentCurrency() {
  const [state, { update }] = useApplicationContext()
  const toggleCurrency = useCallback(() => {
    if (state.currency === 'ETH') {
      update('USD')
    } else {
      update('ETH')
    }
  }, [state, update])
  return [state[CURRENCY], toggleCurrency]
}

export function useTimeframe() {
  const [state, { updateTimeframe }] = useApplicationContext()
  const activeTimeframe = state?.[TIME_KEY]
  return [activeTimeframe, updateTimeframe]
}

export function useShowWarningOnPath(path) {
  const [state, { markPathAsClicked }] = useApplicationContext()
  const pathClicked = state?.[SAVED_PATHS]?.[path]
  return [!pathClicked, () => markPathAsClicked(path)]
}
