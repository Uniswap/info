import React, { createContext, useContext, useReducer, useMemo, useCallback, useEffect } from 'react'
import { client } from '../apollo/client'
import { TICKER_QUERY } from '../apollo/queries'

const UPDATE_ETH_PRICE_USD = 'UPDATE_ETH_PRICE_USD'

const ETH_PRICE_KEY = 'ETH_PRICE_KEY'

const ApplicationContext = createContext()

function useApplicationContext() {
  return useContext(ApplicationContext)
}

function reducer(state, { type, payload }) {
  switch (type) {
    case UPDATE_ETH_PRICE_USD: {
      const { ethPrice } = payload
      return {
        ...state,
        [ETH_PRICE_KEY]: ethPrice
      }
    }
    default: {
      throw Error(`Unexpected action type in DataContext reducer: '${type}'.`)
    }
  }
}

const INITIAL_STATE = {
  ethPrice: 0
}

export default function Provider({ children }) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE)

  const updateEthPrice = useCallback(ethPrice => {
    dispatch({
      type: UPDATE_ETH_PRICE_USD,
      payload: {
        ethPrice
      }
    })
  }, [])

  return (
    <ApplicationContext.Provider value={useMemo(() => [state, { updateEthPrice }], [state, updateEthPrice])}>
      {children}
    </ApplicationContext.Provider>
  )
}
async function getEthPriceUSD() {
  let daiResult = await client.query({
    query: TICKER_QUERY,
    variables: {
      id: '0x2a1530c4c41db0b0b2bb646cb5eb1a67b7158667'
    },
    fetchPolicy: 'cache-first'
  })
  return daiResult ? parseFloat(daiResult.data.exchange.price) : 0
}
export function useEthPriceUSD() {
  const [state, { updateEthPrice }] = useApplicationContext()
  const ethPrice = state[ETH_PRICE_KEY]

  useEffect(() => {
    async function fetch() {
      let ethPrice = await getEthPriceUSD()
      updateEthPrice(ethPrice)
    }
    if (!ethPrice) {
      fetch()
    }
  }, [ethPrice, updateEthPrice])

  return ethPrice
}
