import React, { createContext, useContext, useReducer, useMemo, useCallback, useEffect } from 'react'

import { client } from '../apollo/client'
import { PAIR_DATA, PAIR_CHART, All_PAIRS, TOKEN_TXNS } from '../apollo/queries'

import { useEthPrice } from './GlobalData'

import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'

import { getPercentChange, get2DayPercentChange, getBlockFromTimestamp } from '../helpers'

const UPDATE = 'UPDATE'
const UPDATE_PAIR_TXNS = 'UPDATE_PAIR_TXNS'
const UPDATE_CHART_DATA = 'UPDATE_CHART_DATA'

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
      const { data } = payload
      const store = {}
      Object.keys(data).map(item => {
        return (store[item] = data[item])
      })
      return {
        ...state,
        [data.id]: {
          ...(safeAccess(state, [data.id]) || {}),
          ...store
        }
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
  const update = useCallback(data => {
    dispatch({
      type: UPDATE,
      payload: {
        data
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
      value={useMemo(() => [state, { update, updatePairTxns, updateChartData }], [
        state,
        update,
        updatePairTxns,
        updateChartData
      ])}
    >
      {children}
    </PairDataContext.Provider>
  )
}

const getAllPairs = async () => {
  let data = []
  try {
    let result = await client.query({
      query: All_PAIRS,
      fetchPolicy: 'cache-first'
    })
    data = data.concat(result.data.pairs)
  } catch (e) {
    console.log(e)
  }
  return data
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
      data.volumeUSD,
      oneDayData?.volumeUSD ? oneDayData?.volumeUSD : 0,
      twoDayData?.volumeUSD ? twoDayData?.volumeUSD : 0
    )

    const oneWeekVolumeUSD = parseFloat(oneWeekData ? data?.volumeUSD - oneWeekData?.volumeUSD : data.volumeUSD)

    const [oneDayVolumeETH, volumeChangeETH] = get2DayPercentChange(
      data.tradeVolumeETH,
      oneDayData?.tradeVolumeETH ? oneDayData?.tradeVolumeETH : 0,
      twoDayData?.tradeVolumeETH ? twoDayData?.tradeVolumeETH : 0
    )

    const [oneDayTxns] = get2DayPercentChange(
      data.txCount,
      oneDayData?.txCount ? oneDayData?.txCount : 0,
      twoDayData?.txCount ? twoDayData?.txCount : 0
    )

    const liquidityChangeUSD = getPercentChange(data.reserveUSD, oneDayData?.reserveUSD)
    const liquidityChangeETH = getPercentChange(data.reserveUSD, oneDayData?.reserveUSD)

    data.reserveUSD = data.reserveETH ? data.reserveETH * ethPrice : data.reserveUSD
    data.oneDayVolumeUSD = oneDayVolumeUSD
    data.oneDayVolumeETH = oneDayVolumeETH
    data.oneWeekVolumeUSD = oneWeekVolumeUSD
    data.volumeChangeUSD = volumeChangeUSD
    data.volumeChangeETH = volumeChangeETH
    data.liquidityChangeUSD = liquidityChangeUSD
    data.liquidityChangeETH = liquidityChangeETH
    data.oneDayTxns = oneDayTxns

    // new tokens
    if (!oneDayData && data) {
      data.oneDayVolumeUSD = data.tradeVolumeUSD
      data.oneDayVolumeETH = data.tradeVolume * data.derivedETH
    }
  } catch (e) {
    console.log(e)
  }

  return data
}

const getPairTransactions = async pairAddress => {
  const transactions = {}

  try {
    let result = await client.query({
      query: TOKEN_TXNS,
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
  const [, { update }] = usePairDataContext()
  const ethPrice = useEthPrice()
  useEffect(() => {
    async function getData() {
      const allPairs = await getAllPairs()
      if (allPairs) {
        allPairs.map(async pair => {
          const pairData = await getPairData(pair.id, ethPrice)
          pairData && update(pairData)
        })
      }
    }
    ethPrice && getData()
  }, [update, ethPrice])
  return null
}

export function usePairData(pairAddress) {
  const [state, { update }] = usePairDataContext()
  const ethPrice = useEthPrice()
  const pairData = safeAccess(state, [pairAddress])
  useEffect(() => {
    async function checkForPairData() {
      if (!pairData && pairAddress && ethPrice) {
        let data = await getPairData(pairAddress)
        update(data)
      }
    }
    checkForPairData()
  }, [pairData, pairAddress, ethPrice, update])
  return pairData || {}
}

export function usePairTransactions(pairAddress) {
  const [state, { updatePairTxns }] = usePairDataContext()
  const pairTxns = safeAccess(state, [pairAddress, 'txns'])
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
  const chartData = safeAccess(state, [pairAddress, 'chartData'])
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

export function useAllPairs() {
  const [state] = usePairDataContext()
  return state
}
