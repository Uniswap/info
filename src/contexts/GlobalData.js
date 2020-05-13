import React, { createContext, useContext, useReducer, useMemo, useCallback, useEffect } from 'react'
import { GLOBAL_DATA, GLOBAL_TXNS, GLOBAL_CHART, ETH_PRICE } from '../apollo/queries'
import { client } from '../apollo/client'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { get2DayPercentFormatted, getPercentFormatted, getBlockFromTimestamp } from '../helpers'

const UPDATE = 'UPDATE'
const UPDATE_TXNS = 'UPDATE_TXNS'
const UPDATE_CHART = 'UPDATE_CHART'
const UPDATE_ETH_PRICE = 'UPDATE_ETH_PRICE'
const ETH_PRICE_KEY = 'ETH_PRICE_KEY'

dayjs.extend(utc)

const GlobalDataContext = createContext()

function useGlobalDataContext() {
  return useContext(GlobalDataContext)
}

function reducer(state, { type, payload }) {
  switch (type) {
    case UPDATE: {
      const { data } = payload
      return {
        ...state,
        totalVolumeUSD: data.totalVolumeUSD,
        totalVolumeETH: data.totalVolumeETH,
        totalLiquidityUSD: data.totalLiquidityUSD,
        totalLiquidityETH: data.totalLiquidityETH,
        oneDayVolumeUSD: data.oneDayVolumeUSD,
        oneDayVolumeETH: data.oneDayVolumeETH,
        volumeChangeUSD: data.volumeChangeUSD,
        volumeChangeETH: data.volumeChangeETH,
        liquidityChangeUSD: data.liquidityChangeUSD,
        liquidityChangeETH: data.liquidityChangeETH,
        oneDayTxns: data.oneDayTxns,
        txnChange: data.txnChange
      }
    }
    case UPDATE_TXNS: {
      const { transactions } = payload
      return {
        ...state,
        transactions
      }
    }
    case UPDATE_CHART: {
      const { chartData } = payload
      return {
        ...state,
        chartData
      }
    }
    case UPDATE_ETH_PRICE: {
      const { ethPrice, ethPriceChange } = payload
      return {
        ETH_PRICE_KEY: ethPrice,
        ethPriceChange
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

  const updateTransactions = useCallback(transactions => {
    dispatch({
      type: UPDATE_TXNS,
      payload: {
        transactions
      }
    })
  }, [])

  const updateChart = useCallback(chartData => {
    dispatch({
      type: UPDATE_CHART,
      payload: {
        chartData
      }
    })
  }, [])

  const updateEthPrice = useCallback((ethPrice, ethPriceChange) => {
    dispatch({
      type: UPDATE_ETH_PRICE,
      payload: {
        ethPrice,
        ethPriceChange
      }
    })
  }, [])

  return (
    <GlobalDataContext.Provider
      value={useMemo(() => [state, { update, updateTransactions, updateChart, updateEthPrice }], [
        state,
        update,
        updateTransactions,
        updateChart,
        updateEthPrice
      ])}
    >
      {children}
    </GlobalDataContext.Provider>
  )
}

async function getGlobalData() {
  const utcCurrentTime = dayjs()
  const utcOneDayBack = utcCurrentTime.subtract(1, 'day').unix()
  const utcTwoDaysBack = utcCurrentTime.subtract(2, 'day').unix()
  let oneDayBlock = await getBlockFromTimestamp(utcOneDayBack)
  let twoDayBlock = await getBlockFromTimestamp(utcTwoDaysBack)

  let result = await client.query({
    query: GLOBAL_DATA(),
    fetchPolicy: 'cache-first'
  })
  let data = result.data.uniswapFactories[0]
  let oneDayResult = await client.query({
    query: GLOBAL_DATA(oneDayBlock),
    fetchPolicy: 'cache-first'
  })
  let oneDayData = oneDayResult.data.uniswapFactories[0]

  let twoDayResult = await client.query({
    query: GLOBAL_DATA(twoDayBlock),
    fetchPolicy: 'cache-first'
  })
  let twoDayData = twoDayResult.data.uniswapFactories[0]
  if (data && oneDayData && twoDayData) {
    const [oneDayVolumeUSD, volumeChangeUSD] = get2DayPercentFormatted(
      data.totalVolumeUSD,
      oneDayData.totalVolumeUSD ? oneDayData.totalVolumeUSD : 0,
      twoDayData.totalVolumeUSD ? twoDayData.totalVolumeUSD : 0
    )

    const [oneDayVolumeETH, volumeChangeETH] = get2DayPercentFormatted(
      data.totalVolumeETH,
      oneDayData.totalVolumeETH ? oneDayData.totalVolumeETH : 0,
      twoDayData.totalVolumeETH ? twoDayData.totalVolumeETH : 0
    )

    const [oneDayTxns, txnChange] = get2DayPercentFormatted(
      data.txCount,
      oneDayData.txCount ? oneDayData.txCount : 0,
      twoDayData.txCount ? twoDayData.txCount : 0
    )

    const liquidityChangeUSD = getPercentFormatted(data.totalLiquidityUSD, oneDayData.totalLiquidityUSD)
    const liquidityChangeETH = getPercentFormatted(data.totalLiquidityETH, oneDayData.totalLiquidityETH)
    data.oneDayVolumeUSD = oneDayVolumeUSD
    data.volumeChangeUSD = volumeChangeUSD
    data.oneDayVolumeETH = oneDayVolumeETH
    data.volumeChangeETH = volumeChangeETH
    data.liquidityChangeUSD = liquidityChangeUSD
    data.liquidityChangeETH = liquidityChangeETH
    data.oneDayTxns = oneDayTxns
    data.txnChange = txnChange
  }

  return data
}

const getChartData = async () => {
  const utcEndTime = dayjs.utc()
  let utcStartTime = utcEndTime.subtract(1, 'year')
  let startTime = utcStartTime.unix() - 1
  let result = await client.query({
    query: GLOBAL_CHART,
    fetchPolicy: 'network-only'
  })
  let data = result.data.uniswapDayDatas
  let dayIndexSet = new Set()
  let dayIndexArray = []
  const oneDay = 24 * 60 * 60
  data.forEach((dayData, i) => {
    // add the day index to the set of days
    dayIndexSet.add((data[i].date / oneDay).toFixed(0))
    dayIndexArray.push(data[i])
    dayData.dailyVolumeUSD = parseFloat(dayData.dailyVolumeUSD)
  })

  // fill in empty days
  let timestamp = data[0].date ? data[0].date : startTime
  let latestLiquidityUSD = data[0].totalLiquidityUSD
  let latestDayDats = data[0].mostLiquidTokens
  let index = 1
  while (timestamp < utcEndTime.unix() - oneDay) {
    const nextDay = timestamp + oneDay
    let currentDayIndex = (nextDay / oneDay).toFixed(0)
    if (!dayIndexSet.has(currentDayIndex)) {
      data.push({
        date: nextDay,
        dailyVolumeUSD: 0,
        totalLiquidityUSD: latestLiquidityUSD,
        mostLiquidTokens: latestDayDats
      })
    } else {
      latestLiquidityUSD = dayIndexArray[index].totalLiquidityUSD
      latestDayDats = dayIndexArray[index].mostLiquidTokens
      index = index + 1
    }
    timestamp = nextDay
  }

  data = data.sort((a, b) => (parseInt(a.date) > parseInt(b.date) ? 1 : -1))
  return data
}

const getGlobalTransactions = async () => {
  let result = await client.query({
    query: GLOBAL_TXNS,
    fetchPolicy: 'cache-first'
  })
  const transactions = {}
  transactions.mints = []
  transactions.burns = []
  transactions.swaps = []
  result.data.transactions.map(transaction => {
    if (transaction.mints.length > 0) {
      transaction.mints.map(mint => {
        return transactions.mints.push(mint)
      })
    }
    if (transaction.burns.length > 0) {
      transaction.burns.map(burn => {
        return transactions.burns.push(burn)
      })
    }
    if (transaction.swaps.length > 0) {
      transaction.swaps.map(swap => {
        return transactions.swaps.push(swap)
      })
    }
    return true
  })
  return transactions
}

const getEthPrice = async () => {
  const utcCurrentTime = dayjs()
  const utcOneDayBack = utcCurrentTime.subtract(1, 'day').unix()
  let oneDayBlock = await getBlockFromTimestamp(utcOneDayBack)

  let result = await client.query({
    query: ETH_PRICE(),
    fetchPolicy: 'cache-first'
  })

  let resultOneDay = await client.query({
    query: ETH_PRICE(oneDayBlock),
    fetchPolicy: 'cache-first'
  })

  const priceChangeETH = getPercentFormatted(
    result?.data?.bundles[0]?.ethPrice,
    resultOneDay?.data?.bundles[0]?.ethPrice
  )

  return [result?.data?.bundles[0]?.ethPrice, priceChangeETH]
}

export function Updater() {
  const [, { update, updateTransactions, updateChart }] = useGlobalDataContext()
  useEffect(() => {
    async function fetchData() {
      let globalData = await getGlobalData()
      globalData && update(globalData)
      let txns = await getGlobalTransactions()
      updateTransactions(txns)
      let chartData = await getChartData()
      chartData && updateChart(chartData)
    }
    fetchData()
  }, [update, updateTransactions, updateChart])
  return null
}

export function useGlobalData() {
  const [state, { updateChart }] = useGlobalDataContext()
  useEffect(() => {
    async function checkChartData() {
      if (!state.chartData) {
        getChartData().then(chartData => {
          updateChart(chartData)
        })
      }
    }
    checkChartData()
  }, [state, updateChart])
  return state
}

export function useEthPrice() {
  const [state, { updateEthPrice }] = useGlobalDataContext()
  const ethPrice = state?.[ETH_PRICE_KEY]
  useEffect(() => {
    async function checkForEthPrice() {
      if (!ethPrice) {
        let [newPrice, priceChange] = await getEthPrice()
        updateEthPrice(newPrice, priceChange)
      }
    }
    checkForEthPrice()
  }, [ethPrice, updateEthPrice])

  return ethPrice
}
