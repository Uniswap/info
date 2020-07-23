import React, { createContext, useContext, useReducer, useMemo, useCallback, useEffect, useState } from 'react'

import { client } from '../apollo/client'
import {
  PAIR_DATA,
  PAIR_CHART,
  FILTERED_TRANSACTIONS,
  PAIRS_DYNAMIC,
  PAIRS_CURRENT,
  PAIRS_BULK,
  PAIRS_DYNAMIC_BULK
} from '../apollo/queries'

import { useEthPrice } from './GlobalData'

import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'

import { getPercentChange, get2DayPercentChange, getBlockFromTimestamp, isAddress } from '../utils'

const UPDATE = 'UPDATE'
const UPDATE_PAIR_TXNS = 'UPDATE_PAIR_TXNS'
const UPDATE_CHART_DATA = 'UPDATE_CHART_DATA'
const UPDATE_TOP_PAIRS = 'UPDATE_TOP_PAIRS'

dayjs.extend(utc)

export function safeAccess(object, path) {
  return object
    ? path.reduce(
        (accumulator, currentValue) => (accumulator && accumulator[currentValue] ? accumulator[currentValue] : null),
        object
      )
    : null
}

const PairDataContext = createContext()

function usePairDataContext() {
  return useContext(PairDataContext)
}

function reducer(state, { type, payload }) {
  switch (type) {
    case UPDATE: {
      const { pairAddress, data } = payload
      return {
        ...state,
        [pairAddress]: {
          ...state?.[pairAddress],
          ...data
        }
      }
    }

    case UPDATE_TOP_PAIRS: {
      const { topPairs } = payload
      let added = {}
      topPairs.map(pair => {
        return (added[pair.id] = pair)
      })
      return {
        ...state,
        ...added
      }
    }

    case UPDATE_PAIR_TXNS: {
      const { address, transactions } = payload
      return {
        ...state,
        [address]: {
          ...(safeAccess(state, [address]) || {}),
          txns: transactions
        }
      }
    }
    case UPDATE_CHART_DATA: {
      const { address, chartData } = payload
      return {
        ...state,
        [address]: {
          ...(safeAccess(state, [address]) || {}),
          chartData
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

  // update pair specific data
  const update = useCallback((pairAddress, data) => {
    dispatch({
      type: UPDATE,
      payload: {
        pairAddress,
        data
      }
    })
  }, [])

  const updateTopPairs = useCallback(topPairs => {
    dispatch({
      type: UPDATE_TOP_PAIRS,
      payload: {
        topPairs
      }
    })
  }, [])

  const updatePairTxns = useCallback((address, transactions) => {
    dispatch({
      type: UPDATE_PAIR_TXNS,
      payload: { address, transactions }
    })
  }, [])

  const updateChartData = useCallback((address, chartData) => {
    dispatch({
      type: UPDATE_CHART_DATA,
      payload: { address, chartData }
    })
  }, [])

  return (
    <PairDataContext.Provider
      value={useMemo(() => [state, { update, updatePairTxns, updateChartData, updateTopPairs }], [
        state,
        update,
        updatePairTxns,
        updateChartData,
        updateTopPairs
      ])}
    >
      {children}
    </PairDataContext.Provider>
  )
}

async function getBulkPairData(pairList, ethPrice) {
  const utcCurrentTime = dayjs()
  const utcOneDayBack = utcCurrentTime.subtract(1, 'day').unix()
  const utcTwoDaysBack = utcCurrentTime.subtract(2, 'day').unix()
  const utcOneWeekBack = utcCurrentTime.subtract(1, 'week').unix()
  let oneDayBlock = await getBlockFromTimestamp(utcOneDayBack)
  let twoDayBlock = await getBlockFromTimestamp(utcTwoDaysBack)
  let oneWeekBlock = await getBlockFromTimestamp(utcOneWeekBack)

  try {
    let current = await client.query({
      query: PAIRS_BULK,
      variables: {
        allPairs: pairList
      },
      fetchPolicy: 'cache-first'
    })

    let [oneDayResult, twoDayResult, oneWeekResult] = await Promise.all(
      [oneDayBlock, twoDayBlock, oneWeekBlock].map(async block => {
        let result = client.query({
          query: PAIRS_DYNAMIC_BULK(block, pairList),
          fetchPolicy: 'cache-first'
        })
        return result
      })
    )

    let oneDayData = oneDayResult?.data?.pairs.reduce((obj, cur, i) => {
      return { ...obj, [cur.id]: cur }
    }, {})

    let twoDayData = twoDayResult?.data?.pairs.reduce((obj, cur, i) => {
      return { ...obj, [cur.id]: cur }
    }, {})

    let oneWeekData = oneWeekResult?.data?.pairs.reduce((obj, cur, i) => {
      return { ...obj, [cur.id]: cur }
    }, {})

    return (
      current &&
      current.data.pairs.map(pair => {
        let data = pair
        let oneDayHistory = oneDayData?.[pair.id]
        let twoDayHistory = twoDayData?.[pair.id]
        let oneWeekHistory = oneWeekData?.[pair.id]

        const [oneDayVolumeUSD, volumeChangeUSD] = get2DayPercentChange(
          data?.volumeUSD,
          oneDayHistory?.volumeUSD ?? 0,
          twoDayHistory?.volumeUSD ?? 0
        )

        const oneWeekVolumeUSD = parseFloat(oneWeekData ? data?.volumeUSD - oneWeekHistory?.volumeUSD : data.volumeUSD)
        const [oneDayVolumeETH, volumeChangeETH] = get2DayPercentChange(
          data.tradeVolumeETH,
          oneDayHistory?.tradeVolumeETH ?? 0,
          twoDayHistory?.tradeVolumeETH ?? 0
        )
        const [oneDayTxns, txnChange] = get2DayPercentChange(
          data.txCount,
          oneDayHistory?.txCount ?? 0,
          twoDayHistory?.txCount ?? 0
        )

        const liquidityChangeUSD = getPercentChange(data.reserveUSD, oneDayHistory?.reserveUSD)
        const liquidityChangeETH = getPercentChange(data.reserveUSD, oneDayHistory?.reserveUSD)
        data.reserveUSD = data.reserveETH ? data.reserveETH * ethPrice : data.reserveUSD
        data.trackedReserveUSD = parseFloat(pair.trackedReserveETH) * ethPrice
        data.oneDayVolumeUSD = oneDayVolumeUSD
        data.oneDayVolumeETH = oneDayVolumeETH
        data.oneWeekVolumeUSD = oneWeekVolumeUSD
        data.volumeChangeUSD = volumeChangeUSD
        data.volumeChangeETH = volumeChangeETH
        data.liquidityChangeUSD = liquidityChangeUSD
        data.liquidityChangeETH = liquidityChangeETH
        data.oneDayTxns = oneDayTxns
        data.txnChange = txnChange
        // new tokens
        if (!oneDayHistory && data) {
          data.oneDayVolumeUSD = data.volumeUSD
          data.oneDayVolumeETH = data.tradeVolume * data.derivedETH
        }
        if (!oneWeekHistory && data) {
          data.oneWeekVolumeUSD = data.volumeUSD
        }
        if (data?.token0?.id === '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2') {
          data.token0.name = 'ETH (Wrapped)'
          data.token0.symbol = 'ETH'
        }

        if (data?.token1?.id === '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2') {
          data.token1.name = 'ETH (Wrapped)'
          data.token1.symbol = 'ETH'
        }

        return data
      })
    )
  } catch (e) {
    console.log(e)
  }
}

const getTopPairData = async ethPrice => {
  const utcCurrentTime = dayjs()
  const utcOneDayBack = utcCurrentTime.subtract(1, 'day').unix()
  const utcTwoDaysBack = utcCurrentTime.subtract(2, 'day').unix()
  const utcOneWeekBack = utcCurrentTime.subtract(1, 'week').unix()
  let oneDayBlock = await getBlockFromTimestamp(utcOneDayBack)
  let twoDayBlock = await getBlockFromTimestamp(utcTwoDaysBack)
  let oneWeekBlock = await getBlockFromTimestamp(utcOneWeekBack)

  try {
    let current = await client.query({
      query: PAIRS_CURRENT,
      fetchPolicy: 'cache-first'
    })

    let [oneDayResult, twoDayResult, oneWeekResult] = await Promise.all(
      [oneDayBlock, twoDayBlock, oneWeekBlock].map(async block => {
        let result = client.query({
          query: PAIRS_DYNAMIC(block),
          fetchPolicy: 'cache-first'
        })
        return result
      })
    )

    let oneDayData = oneDayResult?.data?.pairs.reduce((obj, cur, i) => {
      return { ...obj, [cur.id]: cur }
    }, {})

    let twoDayData = twoDayResult?.data?.pairs.reduce((obj, cur, i) => {
      return { ...obj, [cur.id]: cur }
    }, {})

    let oneWeekData = oneWeekResult?.data?.pairs.reduce((obj, cur, i) => {
      return { ...obj, [cur.id]: cur }
    }, {})

    // now loop through current exchanges
    return (
      current &&
      current.data.pairs.map(pair => {
        let data = pair
        let oneDayHistory = oneDayData?.[pair.id]
        let twoDayHistory = twoDayData?.[pair.id]
        let oneWeekHistory = oneWeekData?.[pair.id]

        const [oneDayVolumeUSD, volumeChangeUSD] = get2DayPercentChange(
          data?.volumeUSD,
          oneDayHistory?.volumeUSD ?? 0,
          twoDayHistory?.volumeUSD ?? 0
        )

        const oneWeekVolumeUSD = parseFloat(oneWeekData ? data?.volumeUSD - oneWeekHistory?.volumeUSD : data.volumeUSD)
        const [oneDayVolumeETH, volumeChangeETH] = get2DayPercentChange(
          data.tradeVolumeETH,
          oneDayHistory?.tradeVolumeETH ?? 0,
          twoDayHistory?.tradeVolumeETH ?? 0
        )
        const [oneDayTxns, txnChange] = get2DayPercentChange(
          data.txCount,
          oneDayHistory?.txCount ?? 0,
          twoDayHistory?.txCount ?? 0
        )
        const liquidityChangeUSD = getPercentChange(data.reserveUSD, oneDayHistory?.reserveUSD)
        const liquidityChangeETH = getPercentChange(data.reserveUSD, oneDayHistory?.reserveUSD)
        data.reserveUSD = data.reserveETH ? data.reserveETH * ethPrice : data.reserveUSD
        data.trackedReserveUSD = data.trackedReserveETH * ethPrice
        data.oneDayVolumeUSD = oneDayVolumeUSD
        data.oneDayVolumeETH = oneDayVolumeETH
        data.oneWeekVolumeUSD = oneWeekVolumeUSD
        data.volumeChangeUSD = volumeChangeUSD
        data.volumeChangeETH = volumeChangeETH
        data.liquidityChangeUSD = liquidityChangeUSD
        data.liquidityChangeETH = liquidityChangeETH
        data.oneDayTxns = oneDayTxns
        data.txnChange = txnChange
        // new tokens
        if (!oneDayHistory && data) {
          data.oneDayVolumeUSD = data.volumeUSD
          data.oneDayVolumeETH = data.tradeVolume * data.derivedETH
        }
        if (!oneWeekHistory && data) {
          data.oneWeekVolumeUSD = data.volumeUSD
        }

        if (data?.token0?.id === '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2') {
          data.token0.name = 'ETH (Wrapped)'
          data.token0.symbol = 'ETH'
        }

        if (data?.token1?.id === '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2') {
          data.token1.name = 'ETH (Wrapped)'
          data.token1.symbol = 'ETH'
        }
        return data
      })
    )
  } catch (e) {
    console.log(e)
  }
}

const getPairData = async (address, ethPrice) => {
  let data = []
  let oneDayData = []
  let twoDayData = []

  const utcCurrentTime = dayjs()
  const utcOneDayBack = utcCurrentTime.subtract(1, 'day').unix()
  const utcTwoDaysBack = utcCurrentTime.subtract(2, 'day').unix()
  const utcOneWeekBack = utcCurrentTime.subtract(1, 'week').unix()
  let oneDayBlock = await getBlockFromTimestamp(utcOneDayBack)
  let twoDayBlock = await getBlockFromTimestamp(utcTwoDaysBack)
  let oneWeekBlock = await getBlockFromTimestamp(utcOneWeekBack)

  try {
    let result = await client.query({
      query: PAIR_DATA(address),
      fetchPolicy: 'cache-first'
    })
    data = result.data && result.data.pairs && result.data.pairs[0]

    let oneDayResult = await client.query({
      query: PAIR_DATA(address, oneDayBlock),
      fetchPolicy: 'cache-first'
    })
    oneDayData = oneDayResult.data.pairs[0]

    let twoDayResult = await client.query({
      query: PAIR_DATA(address, twoDayBlock),
      fetchPolicy: 'cache-first'
    })
    twoDayData = twoDayResult.data.pairs[0]

    let oneWeekResult = await client.query({
      query: PAIR_DATA(address, oneWeekBlock),
      fetchPolicy: 'cache-first'
    })
    let oneWeekData = oneWeekResult.data.pairs[0]

    const [oneDayVolumeUSD, volumeChangeUSD] = get2DayPercentChange(
      data?.volumeUSD,
      oneDayData?.volumeUSD ? oneDayData?.volumeUSD : 0,
      twoDayData?.volumeUSD ? twoDayData?.volumeUSD : 0
    )

    const oneWeekVolumeUSD = parseFloat(oneWeekData ? data?.volumeUSD - oneWeekData?.volumeUSD : data.volumeUSD)

    const [oneDayTxns, txnChange] = get2DayPercentChange(
      data.txCount,
      oneDayData?.txCount ? oneDayData?.txCount : 0,
      twoDayData?.txCount ? twoDayData?.txCount : 0
    )

    const liquidityChangeUSD = getPercentChange(data.reserveUSD, oneDayData?.reserveUSD)

    data.trackedReserveUSD = data.trackedReserveETH * ethPrice
    data.oneDayVolumeUSD = oneDayVolumeUSD
    data.oneWeekVolumeUSD = oneWeekVolumeUSD
    data.volumeChangeUSD = volumeChangeUSD
    data.liquidityChangeUSD = liquidityChangeUSD
    data.oneDayTxns = oneDayTxns
    data.txnChange = txnChange

    // new tokens
    if (!oneDayData && data && data.createdAtBlockNumber > oneDayBlock) {
      data.oneDayVolumeUSD = data.volumeUSD
      data.oneDayVolumeETH = data.tradeVolume * data.derivedETH
    }
  } catch (e) {
    console.log(e)
  }

  if (data?.token0?.id === '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2') {
    data.token0.name = 'ETH (Wrapped)'
    data.token0.symbol = 'ETH'
  }

  if (data?.token1?.id === '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2') {
    data.token1.name = 'ETH (Wrapped)'
    data.token1.symbol = 'ETH'
  }

  return data
}

const getPairTransactions = async pairAddress => {
  const transactions = {}

  try {
    let result = await client.query({
      query: FILTERED_TRANSACTIONS,
      variables: {
        allPairs: [pairAddress]
      },
      fetchPolicy: 'no-cache'
    })
    transactions.mints = result.data.mints
    transactions.burns = result.data.burns
    transactions.swaps = result.data.swaps
  } catch (e) {
    console.log(e)
  }

  return transactions
}

const getPairChartData = async pairAddress => {
  let data = []
  const utcEndTime = dayjs.utc()
  let utcStartTime = utcEndTime.subtract(1, 'year')
  let startTime = utcStartTime.unix() - 1

  try {
    let result = await client.query({
      query: PAIR_CHART,
      variables: {
        pairAddress: pairAddress
      },
      fetchPolicy: 'cache-first'
    })
    data = result.data.pairDayDatas

    let dayIndexSet = new Set()
    let dayIndexArray = []
    const oneDay = 24 * 60 * 60
    data.forEach((dayData, i) => {
      // add the day index to the set of days
      dayIndexSet.add((data[i].date / oneDay).toFixed(0))
      dayIndexArray.push(data[i])
      dayData.dailyVolumeUSD = parseFloat(dayData.dailyVolumeUSD)
      dayData.reserveUSD = parseFloat(dayData.reserveUSD)
    })

    if (data[0]) {
      // fill in empty days
      let timestamp = data[0].date ? data[0].date : startTime
      let latestLiquidityUSD = data[0].reserveUSD
      let index = 1
      while (timestamp < utcEndTime.unix() - oneDay) {
        const nextDay = timestamp + oneDay
        let currentDayIndex = (nextDay / oneDay).toFixed(0)
        if (!dayIndexSet.has(currentDayIndex)) {
          data.push({
            date: nextDay,
            dayString: nextDay,
            dailyVolumeUSD: 0,
            reserveUSD: latestLiquidityUSD
          })
        } else {
          latestLiquidityUSD = dayIndexArray[index].reserveUSD
          index = index + 1
        }
        timestamp = nextDay
      }
    }

    data = data.sort((a, b) => (parseInt(a.date) > parseInt(b.date) ? 1 : -1))
  } catch (e) {
    console.log(e)
  }

  return data
}

export function Updater() {
  const [, { updateTopPairs }] = usePairDataContext()
  const [ethPrice] = useEthPrice()

  useEffect(() => {
    async function getData() {
      // get top pairs for overview list
      let topPairs = await getTopPairData(ethPrice)
      topPairs && updateTopPairs(topPairs)
    }
    ethPrice && getData()
  }, [ethPrice, updateTopPairs])
  return null
}

/**
 * @todo
 * store these updates to reduce future redundant calls
 */
export function useDataForList(pairList) {
  const [state] = usePairDataContext()
  const [ethPrice] = useEthPrice()

  const [stale, setStale] = useState(false)
  const [fetched, setFetched] = useState()

  // reset
  useEffect(() => {
    if (pairList) {
      setStale(false)
      setFetched()
    }
  }, [pairList])

  useEffect(() => {
    async function fetchNewPairData() {
      let newFetched = []
      let unfetched = []

      pairList.map(async pair => {
        let currentData = state?.[pair.id]
        if (!currentData) {
          unfetched.push(pair.id)
        } else {
          newFetched.push(currentData)
        }
      })

      let newPairData = await getBulkPairData(
        unfetched.map(pair => {
          return pair
        }),
        ethPrice
      )
      setFetched(newFetched.concat(newPairData))
    }
    if (ethPrice && pairList && pairList.length > 0 && !fetched && !stale) {
      setStale(true)
      fetchNewPairData()
    }
  }, [ethPrice, state, pairList, stale, fetched])

  let formattedFetch =
    fetched &&
    fetched.reduce((obj, cur) => {
      return { ...obj, [cur.id]: cur }
    }, {})

  return formattedFetch
}

/**
 * Get all the current and 24hr changes for a pair
 */
export function usePairData(pairAddress) {
  const [state, { update }] = usePairDataContext()
  const [ethPrice] = useEthPrice()
  const pairData = state?.[pairAddress]

  useEffect(() => {
    async function fetchData() {
      if (!pairData && pairAddress) {
        let data = await getPairData(pairAddress, ethPrice)
        update(pairAddress, data)
      }
    }
    if (!pairData && pairAddress && ethPrice && isAddress(pairAddress)) {
      fetchData()
    }
  }, [pairAddress, pairData, update, ethPrice])

  return pairData || {}
}

/**
 * Get most recent txns for a pair
 */
export function usePairTransactions(pairAddress) {
  const [state, { updatePairTxns }] = usePairDataContext()
  const pairTxns = state?.[pairAddress]?.txns
  useEffect(() => {
    async function checkForTxns() {
      if (!pairTxns) {
        let transactions = await getPairTransactions(pairAddress)
        updatePairTxns(pairAddress, transactions)
      }
    }
    checkForTxns()
  }, [pairTxns, pairAddress, updatePairTxns])
  return pairTxns
}

export function usePairChartData(pairAddress) {
  const [state, { updateChartData }] = usePairDataContext()
  const chartData = state?.[pairAddress]?.chartData

  useEffect(() => {
    async function checkForChartData() {
      if (!chartData) {
        let data = await getPairChartData(pairAddress)
        updateChartData(pairAddress, data)
      }
    }
    checkForChartData()
  }, [chartData, pairAddress, updateChartData])
  return chartData
}

/**
 * Get list of all pairs in Uniswap
 */
export function useAllPairData() {
  const [state] = usePairDataContext()
  return state || {}
}
