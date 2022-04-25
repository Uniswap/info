import React, { createContext, useContext, useReducer, useMemo, useCallback, useState, useEffect } from 'react'
import { timeframeOptions, getSUPPORTED_LIST_URLS__NO_ENS } from '../constants'
import dayjs from 'dayjs'
import merge from 'deepmerge'
import utc from 'dayjs/plugin/utc'
import getTokenList from '../utils/tokenLists'
import { healthClient, useClient } from '../apollo/client'
import { SUBGRAPH_HEALTH, SUBGRAPH_BLOCK_NUMBER } from '../apollo/queries'
import { useNetworksInfo, useTokensList } from './NetworkInfo'
import { ApolloClient } from 'apollo-client'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { HttpLink } from 'apollo-link-http'
import { memoRequest } from '../utils'
dayjs.extend(utc)

const UPDATE = 'UPDATE'
const UPDATE_TIMEFRAME = 'UPDATE_TIMEFRAME'
const UPDATE_SESSION_START = 'UPDATE_SESSION_START'
const UPDATED_SUPPORTED_TOKENS = 'UPDATED_SUPPORTED_TOKENS'
const UPDATE_LATEST_BLOCK = 'UPDATE_LATEST_BLOCK'
const UPDATE_HEAD_BLOCK = 'UPDATE_HEAD_BLOCK'
const UPDATE_OPEN_MODAL = 'UPDATE_OPEN_MODAL'
const UPDATE_EXCHANGE_SUBGRAPH_CLIENT = 'UPDATE_EXCHANGE_SUBGRAPH_CLIENT'

const SUPPORTED_TOKENS = 'SUPPORTED_TOKENS'
const TIME_KEY = 'TIME_KEY'
const CURRENCY = 'CURRENCY'
const SESSION_START = 'SESSION_START'
const LATEST_BLOCK = 'LATEST_BLOCK'
const HEAD_BLOCK = 'HEAD_BLOCK'
const OPEN_MODAL = 'OPEN_MODAL'
const EXCHANGE_SUBGRAPH_CLIENT = 'EXCHANGE_SUBGRAPH_CLIENT'

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
        [CURRENCY]: currency,
      }
    }
    case UPDATE_TIMEFRAME: {
      const { newTimeFrame } = payload
      return {
        ...state,
        [TIME_KEY]: newTimeFrame,
      }
    }
    case UPDATE_SESSION_START: {
      const { timestamp } = payload
      return {
        ...state,
        [SESSION_START]: timestamp,
      }
    }

    case UPDATE_LATEST_BLOCK: {
      const { block, chainId } = payload
      return {
        ...state,
        [LATEST_BLOCK]: {
          ...state[LATEST_BLOCK],
          [chainId]: block,
        },
      }
    }

    case UPDATE_HEAD_BLOCK: {
      const { block, chainId } = payload
      return {
        ...state,
        [HEAD_BLOCK]: {
          ...state[HEAD_BLOCK],
          [chainId]: block,
        },
      }
    }

    case UPDATED_SUPPORTED_TOKENS: {
      const { supportedTokens, chainId } = payload
      return {
        ...state,
        [SUPPORTED_TOKENS]: {
          ...state[SUPPORTED_TOKENS],
          [chainId]: supportedTokens,
        },
      }
    }

    case UPDATE_OPEN_MODAL: {
      const { openModal } = payload
      return {
        ...state,
        [OPEN_MODAL]: openModal,
      }
    }

    case UPDATE_EXCHANGE_SUBGRAPH_CLIENT: {
      const { exchangeSubgraphClient, chainId } = payload
      return {
        ...state,
        [EXCHANGE_SUBGRAPH_CLIENT]: {
          [chainId]: exchangeSubgraphClient,
        },
      }
    }

    default: {
      throw Error(`Unexpected action type in DataContext reducer: '${type}'.`)
    }
  }
}

const INITIAL_STATE = {
  CURRENCY: 'USD',
  TIME_KEY: timeframeOptions.ALL_TIME,
  OPEN_MODAL: null,
  EXCHANGE_SUBGRAPH_CLIENT: {},
}

export default function Provider({ children }) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE)
  const update = useCallback(currency => {
    dispatch({
      type: UPDATE,
      payload: {
        currency,
      },
    })
  }, [])

  // global time window for charts - see timeframe options in constants
  const updateTimeframe = useCallback(newTimeFrame => {
    dispatch({
      type: UPDATE_TIMEFRAME,
      payload: {
        newTimeFrame,
      },
    })
  }, [])

  // used for refresh button
  const updateSessionStart = useCallback(timestamp => {
    dispatch({
      type: UPDATE_SESSION_START,
      payload: {
        timestamp,
      },
    })
  }, [])

  const updateSupportedTokens = useCallback((supportedTokens, chainId) => {
    dispatch({
      type: UPDATED_SUPPORTED_TOKENS,
      payload: {
        supportedTokens,
        chainId,
      },
    })
  }, [])

  const updateLatestBlock = useCallback((block, chainId) => {
    dispatch({
      type: UPDATE_LATEST_BLOCK,
      payload: {
        block,
        chainId,
      },
    })
  }, [])

  const updateHeadBlock = useCallback((block, chainId) => {
    dispatch({
      type: UPDATE_HEAD_BLOCK,
      payload: {
        block,
        chainId,
      },
    })
  }, [])

  const updateOpenModal = useCallback(openModal => {
    dispatch({
      type: UPDATE_OPEN_MODAL,
      payload: {
        openModal,
      },
    })
  }, [])

  const updateExchangeSubgraphClient = useCallback((exchangeSubgraphClient, chainId) => {
    dispatch({
      type: UPDATE_EXCHANGE_SUBGRAPH_CLIENT,
      payload: {
        exchangeSubgraphClient,
        chainId,
      },
    })
  }, [])

  return (
    <ApplicationContext.Provider
      value={useMemo(
        () => [
          state,
          {
            update,
            updateSessionStart,
            updateTimeframe,
            updateSupportedTokens,
            updateLatestBlock,
            updateHeadBlock,
            updateOpenModal,
            updateExchangeSubgraphClient,
          },
        ],
        [
          state,
          update,
          updateTimeframe,
          updateSessionStart,
          updateSupportedTokens,
          updateLatestBlock,
          updateHeadBlock,
          updateOpenModal,
          updateExchangeSubgraphClient,
        ]
      )}
    >
      {children}
    </ApplicationContext.Provider>
  )
}

export function useLatestBlocks() {
  const [state, { updateLatestBlock, updateHeadBlock }] = useApplicationContext()
  const [networksInfo] = useNetworksInfo()
  const client = useClient()
  const latestBlock = networksInfo.map(networkInfo => state?.[LATEST_BLOCK]?.[networkInfo.chainId])
  const headBlock = networksInfo.map(networkInfo => state?.[HEAD_BLOCK]?.[networkInfo.chainId])

  useEffect(() => {
    async function fetch(index) {
      try {
        const res = await healthClient.query({
          query: SUBGRAPH_HEALTH(networksInfo[index].subgraphName),
        })
        const syncedBlock = res.data.indexingStatusForCurrentVersion.chains[0].latestBlock.number
        const headBlock = res.data.indexingStatusForCurrentVersion.chains[0].chainHeadBlock.number
        if (syncedBlock && headBlock) {
          updateLatestBlock(syncedBlock, networksInfo[index].chainId)
          updateHeadBlock(headBlock, networksInfo[index].chainId)
        }
      } catch (e) {
        console.log('Can not fetch from health client, fetch from exchange client instead ...')

        const res = await client[index].query({
          query: SUBGRAPH_BLOCK_NUMBER(),
        })
        const latestBlock = res.data._meta.block.number

        if (latestBlock) {
          updateLatestBlock(latestBlock, networksInfo[index].chainId)
          updateHeadBlock(latestBlock, networksInfo[index].chainId)
        } else {
          console.error(e)
        }
      }
    }
    networksInfo.forEach((networkInfo, index) => {
      if (!latestBlock[index]) {
        memoRequest(() => fetch(index), 'useLatestBlocks' + networkInfo.chainId, 10000)
      }
    })
  }, [latestBlock, updateHeadBlock, updateLatestBlock, client, networksInfo])

  return [latestBlock, headBlock]
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
  const [networksInfo] = useNetworksInfo()
  const activeTimeframe = networksInfo.map(networkInfo => state?.[networkInfo.chainId]?.[TIME_KEY])
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

export function useListedTokens() {
  const [state, { updateSupportedTokens }] = useApplicationContext()
  const [[networkInfo]] = useNetworksInfo()
  const tokensList = useTokensList()
  const supportedTokens = state?.[SUPPORTED_TOKENS]?.[networkInfo.chainId]

  useEffect(() => {
    async function fetchList() {
      const allFetched = await getSUPPORTED_LIST_URLS__NO_ENS(networkInfo).reduce(async (fetchedTokens, url) => {
        const tokensSoFar = await fetchedTokens
        const newTokens = await getTokenList(url, networkInfo)
        return Promise.resolve([...tokensSoFar, ...newTokens.tokens])
      }, Promise.resolve([]))
      let formatted = allFetched?.map(t => t.address.toLowerCase())
      formatted.push((networkInfo.kncAddress || '0xdeFA4e8a7bcBA345F687a2f1456F5Edd9CE97202').toLowerCase())
      formatted = formatted.concat(Object.keys(tokensList[networkInfo.chainId] ?? {}).map(item => item.toLowerCase()))
      updateSupportedTokens(formatted, networkInfo.chainId)
    }
    if (!supportedTokens) {
      fetchList()
    }
  }, [updateSupportedTokens, supportedTokens, networkInfo])

  return supportedTokens
}

export const ApplicationModal = {
  NETWORK: 'NETWORK',
  MENU: 'MENU',
}

export function useModalOpen(modal) {
  const [state] = useApplicationContext()
  const openModal = state?.[OPEN_MODAL]

  return openModal === modal
}

export function useToggleModal(modal) {
  const [, { updateOpenModal }] = useApplicationContext()

  const open = useModalOpen(modal)
  const toggle = () => {
    updateOpenModal(open ? null : modal)
  }
  return useCallback(toggle, [modal, open, updateOpenModal])
}

export function useToggleMenuModal() {
  return useToggleModal(ApplicationModal.MENU)
}

export function useToggleNetworkModal() {
  return useToggleModal(ApplicationModal.NETWORK)
}

export function useExchangeClients() {
  const [state, { updateExchangeSubgraphClient }] = useApplicationContext()
  const [networksInfo] = useNetworksInfo()
  const client = useClient()
  const exchangeSubgraphClients = networksInfo.map(networkInfo => state?.[EXCHANGE_SUBGRAPH_CLIENT][networkInfo.chainId])

  useEffect(() => {
    async function getExchangeSubgraphClient(index) {
      const subgraphUrls = networksInfo[index].subgraphUrls

      if (subgraphUrls.length === 1) {
        return new ApolloClient({
          link: new HttpLink({
            uri: subgraphUrls[0],
          }),
          cache: new InMemoryCache(),
          shouldBatch: true,
        })
      }

      const subgraphClients = subgraphUrls.map(
        uri =>
          new ApolloClient({
            link: new HttpLink({ uri }),
            cache: new InMemoryCache(),
            shouldBatch: true,
          })
      )

      const subgraphPromises = subgraphClients.map(client =>
        client
          .query({
            query: SUBGRAPH_BLOCK_NUMBER(),
            fetchPolicy: 'network-only',
          })
          .catch(e => {
            console.error(e)
            return e
          })
      )

      const subgraphQueryResults = await Promise.all(subgraphPromises)

      const subgraphBlockNumbers = subgraphQueryResults.map(res =>
        res instanceof Error ? 0 : res?.data?._meta?.block?.number || 0
      )

      let bestIndex = 0
      let maxBlockNumber = 0

      for (let i = 0; i < subgraphClients.length; i += 1) {
        if (subgraphBlockNumbers[i] > maxBlockNumber) {
          maxBlockNumber = subgraphBlockNumbers[i]
          bestIndex = i
        }
      }

      return subgraphClients[bestIndex]
    }

    async function fetchExchangeClient(index) {
      try {
        const client = await getExchangeSubgraphClient(index)

        if (client) {
          updateExchangeSubgraphClient(client, networksInfo[index].chainId)
        }
      } catch (err) {
        console.error(err)
      }
    }

    networksInfo.forEach((networkInfo, index) => {
      if (!exchangeSubgraphClients[index]) {
        memoRequest(() => fetchExchangeClient(index), 'useExchangeClients_' + networkInfo.chainId, 60000)
      }
    })
  }, [networksInfo, exchangeSubgraphClients, updateExchangeSubgraphClient])

  return exchangeSubgraphClients.map((exchangeSubgraphClient, index) => exchangeSubgraphClient || client[index])
}
