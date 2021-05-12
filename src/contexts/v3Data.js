import { getPercentChange } from '../helpers'
import gql from 'graphql-tag'
import { useQuery } from '@apollo/client'
import { useMemo, useState, useEffect } from 'react'
import dayjs from 'dayjs'
import { splitQuery } from '../helpers'
import { blockClient } from '../apollo/client'
import { v3Client } from '../apollo/client'

export const GLOBAL_DATA = (block) => {
  const queryString = ` query uniswapFactories {
      factories(
       ${block ? `block: { number: ${block}}` : ``} 
       first: 1) {
        txCount
        totalVolumeUSD
        totalValueLockedUSD
      }
    }`
  return gql(queryString)
}

export const GET_BLOCKS = (timestamps) => {
  let queryString = 'query blocks {'
  queryString += timestamps.map((timestamp) => {
    return `t${timestamp}:blocks(first: 1, orderBy: timestamp, orderDirection: desc, where: { timestamp_gt: ${timestamp}, timestamp_lt: ${
      timestamp + 600
    } }) {
          number
        }`
  })
  queryString += '}'
  return gql(queryString)
}

export function useDeltaTimestamps() {
  const utcCurrentTime = dayjs()
  const t1 = utcCurrentTime.subtract(1, 'day').startOf('minute').unix()
  const t2 = utcCurrentTime.subtract(2, 'day').startOf('minute').unix()
  const tWeek = utcCurrentTime.subtract(1, 'week').startOf('minute').unix()
  return [t1, t2, tWeek]
}

/**
 * for a given array of timestamps, returns block entities
 * @param timestamps
 */
export function useBlocksFromTimestamps(timestamps) {
  const [blocks, setBlocks] = useState()
  const [error, setError] = useState(false)

  useEffect(() => {
    async function fetchData() {
      const results = await splitQuery(GET_BLOCKS, blockClient, [], timestamps)
      if (results) {
        setBlocks(results)
      } else {
        setError(true)
      }
    }
    if (!blocks && !error) {
      fetchData()
    }
  })

  const blocksFormatted = useMemo(() => {
    if (blocks) {
      const formatted = []
      for (const t in blocks) {
        if (blocks[t].length > 0) {
          formatted.push({
            timestamp: t.split('t')[1],
            number: blocks[t][0]['number'],
          })
        }
      }
      return formatted
    }
    return undefined
  }, [blocks])

  return {
    blocks: blocksFormatted,
    error,
  }
}

// mocked
export function useFetchProtocolData() {
  // get blocks from historic timestamps
  const [t24, t48] = useDeltaTimestamps()
  const { blocks, error: blockError } = useBlocksFromTimestamps([t24, t48])
  const [block24, block48] = blocks ?? []

  // fetch all data
  const { loading, error, data } = useQuery(GLOBAL_DATA(), {
    client: v3Client,
  })
  const { loading: loading24, error: error24, data: data24 } = useQuery(GLOBAL_DATA(block24?.number ?? undefined), {
    client: v3Client,
  })
  const { loading: loading48, error: error48, data: data48 } = useQuery(GLOBAL_DATA(block48?.number ?? undefined), {
    client: v3Client,
  })

  const anyError = Boolean(error || error24 || error48 || blockError)
  const anyLoading = Boolean(loading || loading24 || loading48)

  const parsed = data?.factories?.[0]
  const parsed24 = data24?.factories?.[0]
  const parsed48 = data48?.factories?.[0]

  const formattedData = useMemo(() => {
    if (anyError || anyLoading || !parsed || !blocks) {
      return undefined
    }

    // volume data
    const volumeUSD =
      parsed && parsed24
        ? parseFloat(parsed.totalVolumeUSD) - parseFloat(parsed24.totalVolumeUSD)
        : parseFloat(parsed.totalVolumeUSD)

    const volumeUSDChange =
      parsed && parsed24 && parsed48 && volumeUSD
        ? (volumeUSD / (parseFloat(parsed24.totalVolumeUSD) - parseFloat(parsed48.totalVolumeUSD))) * 100
        : 0

    // total value locked
    const tvlUSDChange = getPercentChange(parsed?.totalValueLockedUSD, parsed24?.totalValueLockedUSD)

    // 24H transactions
    const txCount =
      parsed && parsed24 ? parseFloat(parsed.txCount) - parseFloat(parsed24.txCount) : parseFloat(parsed.txCount)

    const txCountChange = getPercentChange(parsed.txCount, parsed24?.txCount)

    return {
      volumeUSD,
      volumeUSDChange,
      tvlUSD: parseFloat(parsed.totalValueLockedUSD),
      tvlUSDChange,
      txCount,
      txCountChange,
    }
  }, [anyError, anyLoading, blocks, parsed, parsed24, parsed48])

  return {
    loading: anyLoading,
    error: anyError,
    data: formattedData,
  }
}
