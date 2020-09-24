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
      let response = null
      try {
        response = await augurV2Client(config.augurClient).query({ query: GET_MARKETS })
      } catch (e) {
        console.error(e)
      }

      if (response) {
        updateMarkets(response.data)
        const ammExchangePairs = await getAMMExchangePairs(response.data)
        updateMarketPairs(ammExchangePairs)
      } else {
        // TODO test data when theGraph barfs
        const data = {
          markets: [
            {
              __typename: 'Market',
              description:
                'Will the price of BTC/EUR open at or above 120 on September 30, 2020, according to TradingView.com "BTCEUR (crypto - Bitfinex)"?',
              endTimestamp: '1601510400',
              id: '0x02593d76bdc8a0f5629e47c52f6296e36f4d10d2',
              status: 'TRADING'
            },
            {
              __typename: 'Market',
              description:
                'Will the price of BTC/EUR open at or above 120 on September 30, 2020, according to TradingView.com "BTCEUR (crypto - Bitfinex)"?',
              endTimestamp: '1601510400',
              id: '0x029fa34c6b6a5bbcb1a06d8269b9eabb6acc5e42',
              status: 'TRADING'
            },
            {
              __typename: 'Market',
              description: 'will it rain today?',
              endTimestamp: '1587281040',
              id: '0x02c2daa78c6d27ba90b475811bbc1a32e23eeef7',
              status: 'REPORTING'
            },
            {
              __typename: 'Market',
              description:
                'Will the price of BTC/EUR open at or above 120 on September 30, 2020, according to TradingView.com "BTCEUR (crypto - Bitfinex)"?',
              endTimestamp: '1601510400',
              id: '0x0330eb8c966b51a0fd87f1f31c5539bb5fccb846',
              status: 'TRADING'
            },
            {
              __typename: 'Market',
              description: 'is the sky blue',
              endTimestamp: '1588291200',
              id: '0x03c7bea8926225d48c2a7280b61f28f7861a2bbc',
              status: 'TRADING'
            },
            {
              __typename: 'Market',
              description:
                'Will the price of BTC/EUR open at or above 120 on September 30, 2020, according to TradingView.com "BTCEUR (crypto - Bitfinex)"?',
              endTimestamp: '1601510400',
              id: '0x045fb8330dfb9213dce7da72f39987f9c29f2da1',
              status: 'TRADING'
            },
            {
              __typename: 'Market',
              description: "Women's Singles Tennis: Will Serena Williams win the 2020 Roland Garros?",
              endTimestamp: '1589724000',
              id: '0x056950a05dc4d0fb0c8a4900b04e37c02e3260ac',
              status: 'REPORTING'
            },
            {
              __typename: 'Market',
              description:
                'Will the price of BTC/EUR open at or above 120 on September 30, 2020, according to TradingView.com "BTCEUR (crypto - Bitfinex)"?',
              endTimestamp: '1601510400',
              id: '0x057bdc6949450a897769f8c1597c84cf28ff6cd1',
              status: 'TRADING'
            },
            {
              __typename: 'Market',
              description: 'Will the All Ordinaries close on or above 5500 on April 30, 2020?',
              endTimestamp: '1588227120',
              id: '0x077e31d3fb93f04bd14f1137f1490a99cf335e21',
              status: 'FINALIZED'
            },
            {
              __typename: 'Market',
              description:
                'Will the price of BTC/EUR open at or above 120 on October 28, 2020, according to TradingView.com "BTCEUR (crypto - Bitfinex)"?',
              endTimestamp: '1604534400',
              id: '0x09b4851d137d76ad8406be8642c2dd7fbb758119',
              status: 'TRADING'
            },
            {
              __typename: 'Market',
              description:
                'Will the price of BTC/EUR open at or above 120 on September 30, 2020, according to TradingView.com "BTCEUR (crypto - Bitfinex)"?',
              endTimestamp: '1601510400',
              id: '0x0b01f1076cb78f276ffb5a59f374bb158d8be155',
              status: 'TRADING'
            },
            {
              __typename: 'Market',
              description:
                'Will the price of BTC/EUR open at or above 120 on September 30, 2020, according to TradingView.com "BTCEUR (crypto - Bitfinex)"?',
              endTimestamp: '1601510400',
              id: '0x0bc907fb265fd4c21e4f167a333e3b12e08a1260',
              status: 'TRADING'
            },
            {
              __typename: 'Market',
              description:
                'Will the price of BTC/EUR open at or above 120 on September 30, 2020, according to TradingView.com "BTCEUR (crypto - Bitfinex)"?',
              endTimestamp: '1601510400',
              id: '0x0ccd706beb59eb93578d33781112ddb8bb24b311',
              status: 'TRADING'
            }
          ]
        }
        updateMarkets(data)
        const ammExchangePairs = await getAMMExchangePairs(data)
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
