import { useCallback, useState, useEffect } from 'react'
import { timeframeOptions } from '../../../constants'
import dayjs from 'dayjs'

import { useAppDispatch, useAppSelector } from 'state/hooks'
import {
  updateActiveNetwork,
  updateCurrency,
  updateHeadBlock,
  updateLatestBlock,
  updateSessionStart,
  updateSupportedTokens,
  updateTimeFrame
} from './slice'
import { DEFAULT_LIST_OF_LISTS } from 'constants/lists'
import getTokenList from 'utils/tokenLists'
import ApiService from 'api/ApiService'
import { getSubgraphStatus } from 'data/ethereum/application'

export function useLatestBlocks() {
  const dispatch = useAppDispatch()
  const latestBlock = useAppSelector(state => state.application.latestBlock)
  const headBlock = useAppSelector(state => state.application.headBlock)

  useEffect(() => {
    async function fetch() {
      const result = await getSubgraphStatus()
      if (result) {
        dispatch(updateLatestBlock(result.syncedBlock))
        dispatch(updateHeadBlock(result.headBlock))
      }
    }
    if (!latestBlock) {
      fetch()
    }
  }, [latestBlock, updateHeadBlock, updateLatestBlock])

  return [latestBlock, headBlock]
}

export function useCurrentCurrency() {
  const dispatch = useAppDispatch()
  const currency = useAppSelector(state => state.application.currency)

  const toggleCurrency = () => {
    if (currency === 'ETH') {
      dispatch(updateCurrency('USD'))
    } else {
      dispatch(updateCurrency('ETH'))
    }
  }
  return [currency, toggleCurrency]
}

export function useTimeframe() {
  const dispatch = useAppDispatch()
  const activeTimeFrame = useAppSelector(state => state.application.timeKey)
  const updateActiveFrame = (newFrame: string) => dispatch(updateTimeFrame(newFrame))

  return [activeTimeFrame, updateActiveFrame]
}

export function useActiveNetworkId() {
  return useAppSelector(state => state.application.activeNetwork.id)
}

export function useActiveNetwork() {
  return useAppSelector(state => state.application.activeNetwork)
}

export function useUpdateActiveNetwork() {
  const dispatch = useAppDispatch()
  const networkId = useActiveNetworkId()
  const update = useCallback(newActiveNetwork => {
    if (networkId !== newActiveNetwork.id) {
      dispatch(updateActiveNetwork(newActiveNetwork))
    }
    ApiService.setActiveNetwork(newActiveNetwork.id)
  }, [])

  return update
}

export function useStartTimestamp() {
  const [activeWindow] = useTimeframe()
  const [startDateTimestamp, setStartDateTimestamp] = useState<number | undefined>()

  // monitor the old date fetched
  useEffect(() => {
    const startTime =
      dayjs
        .utc()
        .subtract(
          1,
          activeWindow === timeframeOptions.WEEK ? 'week' : activeWindow === timeframeOptions.ALL_TIME ? 'year' : 'year'
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
  const dispatch = useAppDispatch()
  const sessionStart = useAppSelector(state => state.application.sessionStart)

  useEffect(() => {
    if (!sessionStart) {
      dispatch(updateSessionStart(Date.now()))
    }
  })

  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    let interval: any = null
    interval = setInterval(() => {
      setSeconds(Date.now() - sessionStart ?? Date.now())
    }, 1000)

    return () => clearInterval(interval)
  }, [seconds, sessionStart])

  return seconds / 1000
}

export function useListedTokens() {
  const dispatch = useAppDispatch()
  const networkId = useActiveNetworkId()
  const supportedTokens = useAppSelector(state => state.application.supportedTokens[state.application.activeNetwork.id])

  useEffect(() => {
    async function fetchList() {
      const allFetched = await Promise.all(
        DEFAULT_LIST_OF_LISTS[networkId].map(async url => {
          const tokenList = await getTokenList(url)
          return tokenList.tokens
        })
      )
      const formatted = allFetched.flat()?.map(t => t.address.toLowerCase())
      dispatch(updateSupportedTokens(formatted))
    }
    if (supportedTokens.length === 0) {
      fetchList()
    }
  }, [updateSupportedTokens, supportedTokens, networkId])

  return supportedTokens
}
