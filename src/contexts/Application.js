import React, { createContext, useContext, useReducer, useMemo, useCallback, useState, useEffect } from 'react'
import { timeframeOptions, SUPPORTED_LIST_URLS__NO_ENS, KNC_ADDRESS, ChainId } from '../constants'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import getTokenList from '../utils/tokenLists'
import { client, healthClient } from '../apollo/client'
import { SUBGRAPH_HEALTH, SUBGRAPH_BLOCK_NUMBER } from '../apollo/queries'
import { getExchangeSubgraphClient } from '../apollo/manager'
import AVALANCHE_TOKEN_LIST from '../constants/tokenLists/avalanche.tokenlist'
import ETHEREUM_TOKEN_LIST from '../constants/tokenLists/ethereum.tokenlist'
import BSC_TOKEN_LIST from '../constants/tokenLists/bsc.tokenlist'
import POLYGON_TOKEN_LIST from '../constants/tokenLists/polygon.tokenlist'
import FANTOM_TOKEN_LIST from '../constants/tokenLists/fantom.tokenlist'
import CRONOS_TOKEN_LIST from '../constants/tokenLists/cronos.tokenlist'
import ARBITRUM_TOKEN_LIST from '../constants/tokenLists/arbitrum.tokenlist'
import BTTC_TOKEN_LIST from '../constants/tokenLists/bttc.tokenlist'
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
      const { block } = payload
      return {
        ...state,
        [LATEST_BLOCK]: block,
      }
    }

    case UPDATE_HEAD_BLOCK: {
      const { block } = payload
      return {
        ...state,
        [HEAD_BLOCK]: block,
      }
    }

    case UPDATED_SUPPORTED_TOKENS: {
      const { supportedTokens } = payload
      return {
        ...state,
        [SUPPORTED_TOKENS]: supportedTokens,
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
      const { exchangeSubgraphClient } = payload
      return {
        ...state,
        [EXCHANGE_SUBGRAPH_CLIENT]: exchangeSubgraphClient,
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
  EXCHANGE_SUBGRAPH_CLIENT: null,
}

export default function Provider({ children }) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE)
  const update = useCallback((currency) => {
    dispatch({
      type: UPDATE,
      payload: {
        currency,
      },
    })
  }, [])

  // global time window for charts - see timeframe options in constants
  const updateTimeframe = useCallback((newTimeFrame) => {
    dispatch({
      type: UPDATE_TIMEFRAME,
      payload: {
        newTimeFrame,
      },
    })
  }, [])

  // used for refresh button
  const updateSessionStart = useCallback((timestamp) => {
    dispatch({
      type: UPDATE_SESSION_START,
      payload: {
        timestamp,
      },
    })
  }, [])

  const updateSupportedTokens = useCallback((supportedTokens) => {
    dispatch({
      type: UPDATED_SUPPORTED_TOKENS,
      payload: {
        supportedTokens,
      },
    })
  }, [])

  const updateLatestBlock = useCallback((block) => {
    dispatch({
      type: UPDATE_LATEST_BLOCK,
      payload: {
        block,
      },
    })
  }, [])

  const updateHeadBlock = useCallback((block) => {
    dispatch({
      type: UPDATE_HEAD_BLOCK,
      payload: {
        block,
      },
    })
  }, [])

  const updateOpenModal = useCallback((openModal) => {
    dispatch({
      type: UPDATE_OPEN_MODAL,
      payload: {
        openModal,
      },
    })
  }, [])

  const updateExchangeSubgraphClient = useCallback((exchangeSubgraphClient) => {
    dispatch({
      type: UPDATE_EXCHANGE_SUBGRAPH_CLIENT,
      payload: {
        exchangeSubgraphClient,
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

  const latestBlock = state?.[LATEST_BLOCK]
  const headBlock = state?.[HEAD_BLOCK]

  useEffect(() => {
    async function fetch() {
      try {
        const res = await healthClient.query({
          query: SUBGRAPH_HEALTH(process.env.REACT_APP_SUBGRAPH_NAME),
        })
        const syncedBlock = res.data.indexingStatusForCurrentVersion.chains[0].latestBlock.number
        const headBlock = res.data.indexingStatusForCurrentVersion.chains[0].chainHeadBlock.number
        if (syncedBlock && headBlock) {
          updateLatestBlock(syncedBlock)
          updateHeadBlock(headBlock)
        }
      } catch (e) {
        console.log('Can not fetch from health client, fetch from exchange client instead ...')

        const res = await client.query({
          query: SUBGRAPH_BLOCK_NUMBER(),
        })
        const latestBlock = res.data._meta.block.number

        if (latestBlock) {
          updateLatestBlock(latestBlock)
          updateHeadBlock(latestBlock)
        } else {
          console.error(e)
        }
      }
    }
    if (!latestBlock) {
      fetch()
    }
  }, [latestBlock, updateHeadBlock, updateLatestBlock])

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

export function useListedTokens() {
  const [state, { updateSupportedTokens }] = useApplicationContext()
  const supportedTokens = state?.[SUPPORTED_TOKENS]
  useEffect(() => {
    async function fetchList() {
      const allFetched = await SUPPORTED_LIST_URLS__NO_ENS.reduce(async (fetchedTokens, url) => {
        const tokensSoFar = await fetchedTokens
        const newTokens = await getTokenList(url)
        return Promise.resolve([...tokensSoFar, ...newTokens.tokens])
      }, Promise.resolve([]))
      let formatted = allFetched?.map((t) => t.address.toLowerCase())
      formatted.push(KNC_ADDRESS.toLowerCase())

      let tokenslist = {}

      const chainId = Number(process.env.REACT_APP_CHAIN_ID)
      switch (chainId) {
        case ChainId.AVAXMAINNET:
          tokenslist = AVALANCHE_TOKEN_LIST
          break
        case ChainId.MAINNET:
          tokenslist = ETHEREUM_TOKEN_LIST
          break
        case ChainId.BSCMAINNET:
          tokenslist = BSC_TOKEN_LIST
          break

        case ChainId.MATIC:
          tokenslist = POLYGON_TOKEN_LIST
          break
        case ChainId.FANTOM:
          tokenslist = FANTOM_TOKEN_LIST
          break
        case ChainId.CRONOS:
          tokenslist = CRONOS_TOKEN_LIST
          break
        case ChainId.ARBITRUM:
          tokenslist = ARBITRUM_TOKEN_LIST
          break
        case ChainId.BTTC:
          tokenslist = BTTC_TOKEN_LIST
          break
        default:
          break
      }

      formatted = formatted.concat(Object.keys(tokenslist).map((item) => item.toLowerCase()))
      updateSupportedTokens(formatted)
    }
    if (!supportedTokens) {
      fetchList()
    }
  }, [updateSupportedTokens, supportedTokens])

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

  return useCallback(() => updateOpenModal(open ? null : modal), [modal, open, updateOpenModal])
}

export function useToggleMenuModal() {
  return useToggleModal(ApplicationModal.MENU)
}

export function useToggleNetworkModal() {
  return useToggleModal(ApplicationModal.NETWORK)
}

export function useExchangeClient() {
  const [state, { updateExchangeSubgraphClient }] = useApplicationContext()
  const exchangeSubgraphClient = state?.[EXCHANGE_SUBGRAPH_CLIENT]
  const chainId = parseInt(process.env.REACT_APP_CHAIN_ID)

  useEffect(() => {
    async function fetchExchangeClient() {
      try {
        const client = await getExchangeSubgraphClient(chainId)

        if (client) {
          updateExchangeSubgraphClient(client)
        }
      } catch (err) {
        console.error(err)
      }
    }

    if (!exchangeSubgraphClient) {
      fetchExchangeClient()
    }
  }, [chainId, exchangeSubgraphClient, updateExchangeSubgraphClient])

  return exchangeSubgraphClient || client
}
