import React, { createContext, useContext, useReducer, useMemo, useCallback, useEffect } from 'react'

import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'

import { augurV2Client } from '../apollo/client'
import { GET_MARKETS } from '../apollo/queries'
import { getAMMAddressForMarketShareToken } from '../utils/contractCalls'
import { PARA_AUGUR_TOKENS } from '../contexts/TokenData'
import { useConfig } from '../contexts/Application'

const UPDATE = 'UPDATE'
const UPDATE_MARKETS = ' UPDATE_MARKETS'
const UPDATE_MARKET_PAIRS = ' UPDATE_MARKET_PAIRS'

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

    case UPDATE_MARKET_PAIRS: {
      const { marketPairs } = payload

      return {
        ...state,
        marketPairs: {
          ...marketPairs
        }
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

  const updateMarketPairs = useCallback(marketPairs => {
    dispatch({
      type: UPDATE_MARKET_PAIRS,
      payload: {
        marketPairs
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
            updateMarkets,
            updateMarketPairs
          }
        ],
        [state, update, updateMarkets, updateMarketPairs]
      )}
    >
      {children}
    </MarketDataaContext.Provider>
  )
}

async function getAMMExchangePairs({ markets }) {
  let marketPairs = {}

  if (markets) {
    // Currently slicing the markets due the the number of ETH calls required for the below
    // TODO wrap all these getAMMAddressForMarketShareToken calls in multiCall
    const slicedMarkets = markets.slice(0, 5)
    for (const market of slicedMarkets) {
      for (const token of PARA_AUGUR_TOKENS) {
        const ammExchange = await getAMMAddressForMarketShareToken(market.id, token)
        marketPairs[ammExchange] = {
          id: ammExchange,
          token0: {
            id: token,
            symbol: token === PARA_AUGUR_TOKENS[0] ? 'ETH' : 'DAI',
            name: token === PARA_AUGUR_TOKENS[0] ? 'Ether (Wrapped)' : 'Dai Stablecoin',
            totalLiquidity: '0',
            derivedETH: '0',
            __typename: 'Token'
          },
          token1: {
            id: market.id,
            symbol: market.description,
            name: 'ParaAugur',
            totalLiquidity: '0',
            derivedETH: '0',
            __typename: 'Token'
          }
        }
      }
    }
  }
  return marketPairs
}

export function Updater() {
  const config = useConfig()
  const [, { updateMarkets, updateMarketPairs }] = useMarketDataContext()
  useEffect(() => {
    async function getData() {
      const response = await augurV2Client(config.augurClient).query({ query: GET_MARKETS })

      if (response) {
        updateMarkets(response.data)
        const ammExchangePairs = await getAMMExchangePairs(response.data)
        updateMarketPairs(ammExchangePairs)
      }
    }
    getData()
  }, [updateMarkets, updateMarketPairs, config])
  return null
}

export function useAllMarketData() {
  const [state] = useMarketDataContext()
  return state
}
