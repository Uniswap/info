import React, { createContext, useContext, useReducer, useMemo, useCallback } from 'react'

const UPDATE = 'UPDATE'
const UPDATE_COLOR = 'UPDATE_COLOR'

export function safeAccess(object, path) {
  return object
    ? path.reduce(
        (accumulator, currentValue) => (accumulator && accumulator[currentValue] ? accumulator[currentValue] : null),
        object
      )
    : null
}

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
        currency
      }
    }
    case UPDATE_COLOR: {
      const { color } = payload
      return {
        ...state,
        color
      }
    }
    default: {
      throw Error(`Unexpected action type in DataContext reducer: '${type}'.`)
    }
  }
}

export default function Provider({ children }) {
  const [state, dispatch] = useReducer(reducer, { currency: 'USD' })
  const update = useCallback(currency => {
    dispatch({
      type: UPDATE,
      payload: {
        currency
      }
    })
  }, [])

  const updateColor = useCallback(color => {
    dispatch({
      type: UPDATE_COLOR,
      payload: {
        color
      }
    })
  }, [])

  return (
    <ApplicationContext.Provider value={useMemo(() => [state, { update, updateColor }], [state, update, updateColor])}>
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
  return [state.currency, toggleCurrency]
}

export function useColor() {
  const [state, { updateColor }] = useApplicationContext()
  return [state.color, updateColor]
}
