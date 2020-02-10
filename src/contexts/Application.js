import React, {
  createContext,
  useContext,
  useReducer,
  useMemo,
  useCallback
} from "react"

const UPDATE = "UPDATE"

export function safeAccess(object, path) {
  return object
    ? path.reduce(
        (accumulator, currentValue) =>
          accumulator && accumulator[currentValue]
            ? accumulator[currentValue]
            : null,
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
    default: {
      throw Error(`Unexpected action type in DataContext reducer: '${type}'.`)
    }
  }
}

export default function Provider({ children }) {
  const [state, dispatch] = useReducer(reducer, { currency: "USD" })
  const update = useCallback(currency => {
    dispatch({
      type: UPDATE,
      payload: {
        currency
      }
    })
  }, [])

  return (
    <ApplicationContext.Provider
      value={useMemo(() => [state, { update }], [state, update])}
    >
      {children}
    </ApplicationContext.Provider>
  )
}

export function useCurrentCurrency() {
  const [state, { update }] = useApplicationContext()
  const toggleCurrency = useCallback(() => {
    if (state.currency === "ETH") {
      update("USD")
    } else {
      update("ETH")
    }
  }, [state, update])
  return [state.currency, toggleCurrency]
}
