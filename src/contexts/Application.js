import React, { createContext, useContext, useReducer, useMemo, useCallback, useState, useEffect } from 'react'
import { timeframeOptions } from '../constants'
import Web3 from 'web3'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
dayjs.extend(utc)

const UPDATE = 'UPDATE'
const UPDATE_TIMEFRAME = 'UPDATE_TIMEFRAME'
const UPDATE_SESSION_START = 'UPDATE_SESSION_START'
const UPDATE_WEB3 = 'UPDATE_WEB3'

const TIME_KEY = 'TIME_KEY'
const CURRENCY = 'CURRENCY'
const SESSION_START = 'SESSION_START'
const WEB3 = 'WEB3'

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
    case UPDATE_SESSION_START: {
      const { timestamp } = payload
      return {
        ...state,
        SESSION_START: timestamp
      }
    }
    case UPDATE_WEB3: {
      const { web3 } = payload
      return {
        ...state,
        WEB3: web3
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

  // global time window for charts - see timeframe options in constants
  const updateTimeframe = useCallback(newTimeFrame => {
    dispatch({
      type: UPDATE_TIMEFRAME,
      payload: {
        newTimeFrame
      }
    })
  }, [])

  // used for refresh button
  const updateSessionStart = useCallback(timestamp => {
    dispatch({
      type: UPDATE_SESSION_START,
      payload: {
        timestamp
      }
    })
  }, [])

  const updateWeb3 = useCallback(web3 => {
    dispatch({
      type: UPDATE_WEB3,
      payload: {
        web3
      }
    })
  }, [])

  return (
    <ApplicationContext.Provider
      value={useMemo(() => [state, { update, updateSessionStart, updateTimeframe, updateWeb3 }], [
        state,
        update,
        updateTimeframe,
        updateWeb3,
        updateSessionStart
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

export function useStartTimestamp() {
  const [activeWindow] = useTimeframe()
  const [startDateTimestamp, setStartDateTimestamp] = useState()

  // monitor the old date fetched
  useEffect(() => {
    let startTime =
      dayjs
        .utc()
        .subtract(
          1,
          activeWindow === timeframeOptions.week ? 'week' : activeWindow === timeframeOptions.ALL_TIME ? 'year' : 'year'
        )
        .startOf('day')
        .unix() - 1
    // if we find a new start time less than the current startrtime - update oldest pooint to fetch
    setStartDateTimestamp(startTime)
  }, [activeWindow, startDateTimestamp])

  return startDateTimestamp
}

// keep track of session length for refresh ticker
export function useSessionStart() {
  const [state, { updateSessionStart }] = useApplicationContext()
  const sessionStart = state?.[SESSION_START]

  useEffect(() => {
    if (!sessionStart) {
      updateSessionStart(Date.now())
    }
  })

  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    let interval = null
    interval = setInterval(() => {
      setSeconds(Date.now() - sessionStart ?? Date.now())
    }, 1000)

    return () => clearInterval(interval)
  }, [seconds, sessionStart])

  return parseInt(seconds / 1000)
}

/**
 * @todo this isnt used now - if ever needed probably better to use
 * web3-react instead of this custom hook
 */
export function useWeb3() {
  const [state, { updateWeb3 }] = useApplicationContext()
  const web3 = state?.[WEB3]

  useEffect(() => {
    if (!web3) {
      const web3 = new Web3(new Web3.providers.HttpProvider(process.env.REACT_APP_NETWORK_URL))
      updateWeb3(web3)
    }
  })

  return web3
}
