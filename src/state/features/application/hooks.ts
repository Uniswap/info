import { useState, useEffect } from 'react'
import { timeframeOptions } from '../../../constants'
import dayjs from 'dayjs'
import { useAppDispatch, useAppSelector } from 'state/hooks'
import { setHeadBlock, setLatestBlock, setSupportedTokens } from './slice'
import { DEFAULT_LIST_OF_LISTS } from 'constants/lists'
import getTokenList from 'utils/tokenLists'
import { useActiveNetworkId, useTimeFrame } from './selectors'
import DataService from 'data/DataService'

export function useLatestBlocks() {
  const dispatch = useAppDispatch()
  const activeNetwork = useActiveNetworkId()
  const latestBlock = useAppSelector(state => state.application.latestBlock)
  const headBlock = useAppSelector(state => state.application.headBlock)

  useEffect(() => {
    async function fetch() {
      const result = await DataService.global.getHealthStatus()
      if (result) {
        dispatch(setLatestBlock(result.syncedBlock))
        dispatch(setHeadBlock(result.headBlock))
      }
    }
    fetch()
  }, [activeNetwork])

  return [latestBlock, headBlock]
}

export function useStartTimestamp() {
  const activeWindow = useTimeFrame()
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
      dispatch(setSupportedTokens(formatted))
    }
    if (supportedTokens.length === 0) {
      fetchList()
    }
  }, [supportedTokens, networkId])

  return supportedTokens
}
