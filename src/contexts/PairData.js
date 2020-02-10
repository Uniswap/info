import React, {
  createContext,
  useContext,
  useReducer,
  useMemo,
  useCallback,
  useEffect
} from "react"

import { client } from "../apollo/client"
import {
  PAIR_DATA,
  PAIR_HISTORICAL_DATA,
  PAIR_CHART,
  PAIR_TXNS,
  All_PAIRS
} from "../apollo/queries"

import { useEthPrice } from "./GlobalData"

import dayjs from "dayjs"
import utc from "dayjs/plugin/utc"

import { get2DayPercentFormatted, getPercentFormatted } from "../helpers"

const UPDATE = "UPDATE"
const UPDATE_PAIR_TXNS = "UPDATE_PAIR_TXNS"
const UPDATE_CHART_DATA = "UPDATE_CHART_DATA"

dayjs.extend(utc)

export function safeAccess(object, path) {
  return object
    ? path.reduce(
        (accumulator, currentValue) =>
          accumulator && accumulator[currentValue]
            ? accumulator[currentValue]
            : null,
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
      const { address, mints, burns, swaps } = payload
      return {
        ...state,
        [address]: {
          ...(safeAccess(state, [address]) || {}),
          txns: {
            mints,
            burns,
            swaps
          }
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

  const updatePairTxns = useCallback((address, mints, burns, swaps) => {
    dispatch({
      type: UPDATE_PAIR_TXNS,
      payload: { address, mints, burns, swaps }
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
      value={useMemo(
        () => [state, { update, updatePairTxns, updateChartData }],
        [state, update, updatePairTxns, updateChartData]
      )}
    >
      {children}
    </PairDataContext.Provider>
  )
}

const getAllPairs = async () => {
  let data = []
  let result = await client.query({
    query: All_PAIRS,
    fetchPolicy: "cache-first"
  })
  data = data.concat(result.data.exchanges)
  return data
}

const getPairData = async (address, ethPrice) => {
  let data = []
  let result = await client.query({
    query: PAIR_DATA,
    variables: {
      exchangeAddress: address
    },
    fetchPolicy: "no-cache"
  })
  data = result.data && result.data.exchanges && result.data.exchanges[0]
  let oneDayData = []
  let twoDayData = []
  const utcCurrentTime = dayjs()
  const utcOneDayBack = utcCurrentTime.subtract(1, "day")
  const utcTwoDaysBack = utcCurrentTime.subtract(2, "day")
  let oneDayResult = await client.query({
    query: PAIR_HISTORICAL_DATA,
    variables: {
      pairAddress: address,
      timestamp: utcOneDayBack.unix()
    },
    fetchPolicy: "no-cache"
  })
  oneDayData = oneDayResult.data.exchangeHistoricalDatas[0]
  let twoDayResult = await client.query({
    query: PAIR_HISTORICAL_DATA,
    variables: {
      pairAddress: address,
      timestamp: utcTwoDaysBack.unix()
    },
    fetchPolicy: "no-cache"
  })
  twoDayData = twoDayResult.data.exchangeHistoricalDatas[0]
  if (data && oneDayData && twoDayData) {
    const [oneDayVolumeUSD, volumeChangeUSD] = get2DayPercentFormatted(
      data.tradeVolumeUSD,
      oneDayData.tradeVolumeUSD ? oneDayData.tradeVolumeUSD : 0,
      twoDayData.tradeVolumeUSD ? twoDayData.tradeVolumeUSD : 0
    )
    const [oneDayVolumeETH, volumeChangeETH] = get2DayPercentFormatted(
      data.tradeVolumeETH,
      oneDayData.tradeVolumeETH ? oneDayData.tradeVolumeETH : 0,
      twoDayData.tradeVolumeETH ? twoDayData.tradeVolumeETH : 0
    )

    const liquidityChangeUSD = getPercentFormatted(
      data.combinedBalanceETH * ethPrice,
      oneDayData.combinedBalanceUSD
    )
    const liquidityChangeETH = getPercentFormatted(
      data.combinedBalanceETH,
      oneDayData.combinedBalanceETH
    )
    data.combinedBalanceUSD = data.combinedBalanceETH * ethPrice
    data.oneDayVolumeUSD = oneDayVolumeUSD
    data.oneDayVolumeETH = oneDayVolumeETH
    data.volumeChangeUSD = volumeChangeUSD
    data.volumeChangeETH = volumeChangeETH
    data.liquidityChangeUSD = liquidityChangeUSD
    data.liquidityChangeETH = liquidityChangeETH
  } else {
    // no historical values yet
    data.combinedBalanceUSD = data.combinedBalanceETH * ethPrice
    data.oneDayVolumeUSD = 0
    data.oneDayVolumeETH = 0
    data.volumeChangeUSD = 0
    data.volumeChangeETH = 0
    data.liquidityChangeUSD = 0
    data.liquidityChangeETH = 0
  }
  return data
}

const getPairTransactions = async pairAddress => {
  let result = await client.query({
    query: PAIR_TXNS,
    variables: {
      pairAddress: pairAddress
    },
    fetchPolicy: "no-cache"
  })
  let mints = result.data.mints
  let burns = result.data.burns
  let swaps = result.data.swaps
  return [mints, burns, swaps]
}

const getPairChartData = async pairAddress => {
  let data = []
  const utcEndTime = dayjs.utc()
  let utcStartTime = utcEndTime.subtract(1, "month")
  let startTime = utcStartTime.unix() - 1
  let result = await client.query({
    query: PAIR_CHART,
    variables: {
      exchangeAddress: pairAddress
    },
    fetchPolicy: "cache-first"
  })
  data = data.concat(
    result.data.exchangeDayDatas && result.data.exchangeDayDatas[0]
  )
  let dayIndexSet = new Set()
  let dayIndexArray = []
  const oneDay = 24 * 60 * 60
  data.forEach((dayData, i) => {
    // add the day index to the set of days
    dayIndexSet.add((data[i].date / oneDay).toFixed(0))
    dayIndexArray.push(data[i])
  })
  // fill in empty days
  let timestamp = data[0].date ? data[0].date : startTime
  let latestLiquidityUSD = data[0].combinedBalanceUSD
  let index = 1
  while (timestamp < utcEndTime.unix() - oneDay) {
    const nextDay = timestamp + oneDay
    let currentDayIndex = (nextDay / oneDay).toFixed(0)
    if (!dayIndexSet.has(currentDayIndex)) {
      data.push({
        date: nextDay,
        dayString: nextDay,
        combinedBalanceUSD: latestLiquidityUSD
      })
    } else {
      latestLiquidityUSD = dayIndexArray[index].combinedBalanceUSD
      index = index + 1
    }
    timestamp = nextDay
  }
  data = data.sort((a, b) => (parseInt(a.date) > parseInt(b.date) ? 1 : -1))
  return data
}

export function Updater() {
  const [, { update }] = usePairDataContext()
  const ethPrice = useEthPrice()
  useEffect(() => {
    async function getData() {
      ethPrice &&
        getAllPairs().then(allPairs => {
          allPairs.map(async pair => {
            return getPairData(pair.id, ethPrice).then(data => {
              update(data)
            })
          })
        })
    }
    getData()
  }, [update, ethPrice])
  return null
}

export function usePairData(pairAddress) {
  const [state, { update }] = usePairDataContext()
  const ethPrice = useEthPrice()
  const pairData = safeAccess(state, [pairAddress])
  useEffect(() => {
    async function checkForPairData() {
      if (!pairData && pairAddress) {
        getPairData(pairAddress, ethPrice).then(data => {
          update(data)
        })
      }
    }
    checkForPairData()
  }, [pairData, pairAddress, ethPrice, update])
  return pairData || {}
}

export function usePairTransactions(pairAddress) {
  const [state, { updatePairTxns }] = usePairDataContext()
  const pairTxns = safeAccess(state, [pairAddress, "txns"])
  useEffect(() => {
    async function checkForTxns() {
      if (!pairTxns) {
        let [mints, burns, swaps] = await getPairTransactions(pairAddress)
        updatePairTxns(pairAddress, mints, burns, swaps)
      }
    }
    checkForTxns()
  }, [pairTxns, pairAddress, updatePairTxns])
  return pairTxns
}

export function usePairChartData(pairAddress) {
  const [state, { updateChartData }] = usePairDataContext()
  const chartData = safeAccess(state, [pairAddress, "chartData"])
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
