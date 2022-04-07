import { createContext, useContext, useReducer, useMemo, useCallback, useState, useEffect } from 'react'
import { EthereumNetworkInfo, TronNetworkInfo } from '../constants/networks'
import { timeframeOptions } from '../constants'
import { DEFAULT_LIST_OF_LISTS } from '../constants/lists'
import dayjs from 'dayjs'
import getTokenList from '../utils/tokenLists'
import { healthClient } from '../apollo/client'
import { SUBGRAPH_HEALTH } from '../apollo/queries'

const UPDATE = 'UPDATE'
const UPDATE_TIMEFRAME = 'UPDATE_TIMEFRAME'
const UPDATE_SESSION_START = 'UPDATE_SESSION_START'
const UPDATED_SUPPORTED_TOKENS = 'UPDATED_SUPPORTED_TOKENS'
const UPDATE_LATEST_BLOCK = 'UPDATE_LATEST_BLOCK'
const UPDATE_HEAD_BLOCK = 'UPDATE_HEAD_BLOCK'
const UPDATE_ACTIVE_NETWORK = 'UPDATE_ACTIVE_NETWORK'

const SUPPORTED_TOKENS = 'SUPPORTED_TOKENS'
const TIME_KEY = 'TIME_KEY'
const CURRENCY = 'CURRENCY'
const SESSION_START = 'SESSION_START'
const LATEST_BLOCK = 'LATEST_BLOCK'
const HEAD_BLOCK = 'HEAD_BLOCK'
const ACTIVE_NETWORK = 'ACTIVE_NETWORK'

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
        [CURRENCY]: currency
      }
    }
    case UPDATE_TIMEFRAME: {
      const { newTimeFrame } = payload
      return {
        ...state,
        [TIME_KEY]: newTimeFrame
      }
    }
    case UPDATE_SESSION_START: {
      const { timestamp } = payload
      return {
        ...state,
        [SESSION_START]: timestamp
      }
    }

    case UPDATE_LATEST_BLOCK: {
      const { block } = payload
      return {
        ...state,
        [LATEST_BLOCK]: block
      }
    }

    case UPDATE_HEAD_BLOCK: {
      const { block } = payload
      return {
        ...state,
        [HEAD_BLOCK]: block
      }
    }

    case UPDATED_SUPPORTED_TOKENS: {
      const { supportedTokens } = payload
      return {
        ...state,
        [SUPPORTED_TOKENS]: {
          ...state.SUPPORTED_TOKENS,
          [state.ACTIVE_NETWORK.id]: supportedTokens
        }
      }
    }

    case UPDATE_ACTIVE_NETWORK: {
      const { network } = payload
      return {
        ...state,
        [ACTIVE_NETWORK]: network
      }
    }

    default: {
      throw Error(`Unexpected action type in DataContext reducer: '${type}'.`)
    }
  }
}

const INITIAL_STATE = {
  [CURRENCY]: 'USD',
  [TIME_KEY]: timeframeOptions.ALL_TIME,
  [SESSION_START]: 0,
  [LATEST_BLOCK]: '',
  [HEAD_BLOCK]: '',
  [SUPPORTED_TOKENS]: {
    [EthereumNetworkInfo.id]: [],
    [TronNetworkInfo.id]: []
  },
  [ACTIVE_NETWORK]: EthereumNetworkInfo
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

  const updateSupportedTokens = useCallback(supportedTokens => {
    dispatch({
      type: UPDATED_SUPPORTED_TOKENS,
      payload: {
        supportedTokens
      }
    })
  }, [])

  const updateLatestBlock = useCallback(block => {
    dispatch({
      type: UPDATE_LATEST_BLOCK,
      payload: {
        block
      }
    })
  }, [])

  const updateHeadBlock = useCallback(block => {
    dispatch({
      type: UPDATE_HEAD_BLOCK,
      payload: {
        block
      }
    })
  }, [])

  const updateActiveNetwork = useCallback(network => {
    dispatch({
      type: UPDATE_ACTIVE_NETWORK,
      payload: {
        network
      }
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
            updateActiveNetwork
          }
        ],
        [
          state,
          update,
          updateTimeframe,
          updateSessionStart,
          updateSupportedTokens,
          updateLatestBlock,
          updateHeadBlock,
          updateActiveNetwork
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
          query: SUBGRAPH_HEALTH
        })
        const syncedBlock = res.data.indexingStatusForCurrentVersion.chains[0].latestBlock.number
        const headBlock = res.data.indexingStatusForCurrentVersion.chains[0].chainHeadBlock.number
        if (syncedBlock && headBlock) {
          updateLatestBlock(syncedBlock)
          updateHeadBlock(headBlock)
        }
      } catch (e) {
        console.log(e)
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
  const activeNetwork = state.ACTIVE_NETWORK
  const supportedTokens = state?.[SUPPORTED_TOKENS]?.[activeNetwork.id]

  useEffect(() => {
    async function fetchList() {
      const allFetched = await Promise.all(
        DEFAULT_LIST_OF_LISTS[activeNetwork.id].map(async url => {
          const tokenList = await getTokenList(url)
          return tokenList.tokens
        })
      )
      let formatted = allFetched.flat()?.map(t => t.address.toLowerCase())
      updateSupportedTokens(formatted)
    }
    if (supportedTokens.length === 0) {
      fetchList()
    }
  }, [updateSupportedTokens, supportedTokens, activeNetwork])

  return supportedTokens
}
