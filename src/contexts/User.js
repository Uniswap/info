import React, { createContext, useContext, useReducer, useMemo, useCallback, useEffect, useState } from 'react'
import { client } from '../apollo/client'
import {
  USER_TRANSACTIONS,
  USER_POSITIONS,
  USER_HISTORY,
  USER_HISTORY__PER_PAIR,
  PAIR_DAY_DATA_BULK
} from '../apollo/queries'
import { useTimeframe } from './Application'
import { timeframeOptions } from '../constants'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { useEthPrice } from './GlobalData'

dayjs.extend(utc)

const UPDATE_TRANSACTIONS = 'UPDATE_TRANSACTIONS'
const UPDATE_POSITIONS = 'UPDATE_POSITIONS '
const UPDATE_USER_POSITION_HISTORY = 'UPDATE_USER_POSITION_HISTORY'
const UPDATE_USER_PAIR_HODLS_RETURNS = 'UPDATE_USER_PAIR_HODLS_RETURNS'

const TRANSACTIONS_KEY = 'TRANSACTIONS_KEY'
const POSITIONS_KEY = 'POSITIONS_KEY'
const USER_POSITION_HISTORY_KEY = 'USER_POSITION_HISTORY_KEY'
const USER_PAIR_HODLS_RETURNS_KEY = 'USER_PAIR_HODLS_RETURNS_KEY'

const UserContext = createContext()

function useUserContext() {
  return useContext(UserContext)
}

function reducer(state, { type, payload }) {
  switch (type) {
    case UPDATE_TRANSACTIONS: {
      const { account, transactions } = payload
      return {
        ...state,
        [account]: {
          ...state?.[account],
          [TRANSACTIONS_KEY]: transactions
        }
      }
    }
    case UPDATE_POSITIONS: {
      const { account, positions } = payload
      return {
        ...state,
        [account]: { ...state?.[account], [POSITIONS_KEY]: positions }
      }
    }

    case UPDATE_USER_POSITION_HISTORY: {
      const { account, historyData } = payload
      return {
        ...state,
        [account]: { ...state?.[account], [USER_POSITION_HISTORY_KEY]: historyData }
      }
    }

    case UPDATE_USER_PAIR_HODLS_RETURNS: {
      const { account, hodlData } = payload
      let added = {}
      hodlData &&
        hodlData.map(pairData => {
          return (added[pairData.pairAddress] = pairData)
        })
      return {
        ...state,
        [account]: {
          ...state?.[account],
          [USER_PAIR_HODLS_RETURNS_KEY]: { ...state?.[account]?.USER_PAIR_HODLS_RETURNS_KEY, ...added }
        }
      }
    }

    default: {
      throw Error(`Unexpected action type in DataContext reducer: '${type}'.`)
    }
  }
}

const INITIAL_STATE = {}

export default function Provider({ children }) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE)

  const updateTransactions = useCallback((account, transactions) => {
    dispatch({
      type: UPDATE_TRANSACTIONS,
      payload: {
        account,
        transactions
      }
    })
  }, [])

  const updatePositions = useCallback((account, positions) => {
    dispatch({
      type: UPDATE_POSITIONS,
      payload: {
        account,
        positions
      }
    })
  }, [])

  const updateUserPositionHistory = useCallback((account, historyData) => {
    dispatch({
      type: UPDATE_USER_POSITION_HISTORY,
      payload: {
        account,
        historyData
      }
    })
  }, [])

  const updateUserHodlReturns = useCallback((account, hodlData) => {
    dispatch({
      type: UPDATE_USER_PAIR_HODLS_RETURNS,
      payload: {
        account,
        hodlData
      }
    })
  }, [])

  return (
    <UserContext.Provider
      value={useMemo(
        () => [state, { updateTransactions, updatePositions, updateUserPositionHistory, updateUserHodlReturns }],
        [state, updateTransactions, updatePositions, updateUserPositionHistory, updateUserHodlReturns]
      )}
    >
      {children}
    </UserContext.Provider>
  )
}

export function useUserTransactions(account) {
  const [state, { updateTransactions }] = useUserContext()
  const transactions = state?.[account]?.[TRANSACTIONS_KEY]
  useEffect(() => {
    async function fetchData(account) {
      try {
        let result = await client.query({
          query: USER_TRANSACTIONS,
          variables: {
            user: account
          },
          fetchPolicy: 'no-cache'
        })
        if (result?.data) {
          updateTransactions(account, result?.data)
        }
      } catch (e) {
        console.log(e)
      }
    }
    if (!transactions && account) {
      fetchData(account)
    }
  }, [account, transactions, updateTransactions])

  return transactions || {}
}

export function useUserLiquidityHistory(account) {
  const [state, { updateUserPositionHistory }] = useUserContext()
  const history = state?.[account]?.[USER_POSITION_HISTORY_KEY]
  // formatetd array to return for chart data
  const [formattedHistory, setFormattedHistory] = useState()

  const [startDateTimestamp, setStartDateTimestamp] = useState()
  const [activeWindow] = useTimeframe()

  // monitor the old date fetched
  useEffect(() => {
    const utcEndTime = dayjs.utc()
    // based on window, get starttime
    let utcStartTime
    switch (activeWindow) {
      case timeframeOptions.WEEK:
        utcStartTime = utcEndTime.subtract(1, 'week').startOf('day')
        break
      case timeframeOptions.ALL_TIME:
        utcStartTime = utcEndTime.subtract(1, 'year')
        break
      default:
        utcStartTime = utcEndTime.subtract(1, 'year').startOf('year')
        break
    }
    let startTime = utcStartTime.unix() - 1
    if ((activeWindow && startTime < startDateTimestamp) || !startDateTimestamp) {
      setStartDateTimestamp(startTime)
    }
  }, [activeWindow, startDateTimestamp])

  useEffect(() => {
    async function fetchData() {
      try {
        let result = await client.query({
          query: USER_HISTORY,
          variables: {
            user: account
          },
          fetchPolicy: 'cache-first'
        })
        if (result) {
          updateUserPositionHistory(account, result.data.liquidityPositionSnapshots)
        }
      } catch (e) {
        console.log(e)
      }
    }
    if (!history && account && startDateTimestamp) {
      fetchData()
    }
  }, [account, startDateTimestamp, history, updateUserPositionHistory])

  useEffect(() => {
    async function fetchData() {
      let dayIndex = parseInt(startDateTimestamp / 86400) // get unique day bucket unix
      const currentDayIndex = parseInt(dayjs.utc().unix() / 86400)
      // sort snapshots in order
      let sortedPositions = history.sort((a, b) => {
        return parseInt(a.timestamp) > parseInt(b.timestamp) ? 1 : -1
      })
      // if UI start time is > first position time - bump start index to this time
      if (parseInt(sortedPositions[0].timestamp) > dayIndex) {
        dayIndex = parseInt(parseInt(sortedPositions[0].timestamp) / 86400)
      }

      const dayTimestamps = []
      // get date timestamps for all days in view
      while (dayIndex < currentDayIndex) {
        dayTimestamps.push(parseInt(dayIndex) * 86400)
        dayIndex = dayIndex + 1
      }

      const pairs = history.reduce((pairList, position) => {
        return [...pairList, position.pair.id]
      }, [])

      // get all day datas where date is in this list, and pair is in pair list
      let {
        data: { pairDayDatas }
      } = await client.query({
        query: PAIR_DAY_DATA_BULK(pairs, startDateTimestamp)
      })

      const formattedHistory = []

      // map of current pair => ownership %
      const ownershipPerPair = {}
      for (const index in dayTimestamps) {
        const dayTimestamp = dayTimestamps[index]
        const timestampCeiling = dayTimestamp + 86400

        // cycle through relevant positions and update ownership for any that we need to
        const relevantPositions = history.filter(snapshot => {
          return snapshot.timestamp < timestampCeiling && snapshot.timestamp > dayTimestamp
        })
        for (const index in relevantPositions) {
          const position = relevantPositions[index]
          // case where pair not added yet
          if (!ownershipPerPair[position.pair.id]) {
            ownershipPerPair[position.pair.id] = {
              lpTokenBalance: position.liquidityTokenBalance,
              timestamp: position.timestamp
            }
          }
          // case where more recent timestamp is found for pair
          if (ownershipPerPair[position.pair.id] && ownershipPerPair[position.pair.id].timestamp < position.timestamp) {
            ownershipPerPair[position.pair.id] = {
              lpTokenBalance: position.liquidityTokenBalance,
              timestamp: position.timestamp
            }
          }
        }

        const relavantDayDatas = Object.keys(ownershipPerPair).map(pairAddress => {
          // find last day data after timestamp update
          const dayDatasForThisPair = pairDayDatas.filter(dayData => {
            return dayData.pairAddress === pairAddress
          })
          // find the most recent reference to pair liquidity data
          let mostRecent = dayDatasForThisPair[0]
          for (const index in dayDatasForThisPair) {
            const dayData = dayDatasForThisPair[index]
            if (dayData.date < dayTimestamp && dayData.date > mostRecent.date) {
              mostRecent = dayData
            }
          }
          return mostRecent
        })

        // now cycle through pair day datas, for each one find usd value = ownership[address] * reserveUSD
        const dailyUSD = relavantDayDatas.reduce((totalUSD, dayData) => {
          return (totalUSD =
            totalUSD +
            (ownershipPerPair[dayData.pairAddress]
              ? (parseFloat(ownershipPerPair[dayData.pairAddress].lpTokenBalance) / parseFloat(dayData.totalSupply)) *
                parseFloat(dayData.reserveUSD)
              : 0))
        }, 0)

        formattedHistory.push({
          date: dayTimestamp,
          valueUSD: dailyUSD
        })
      }

      setFormattedHistory(formattedHistory)
    }
    if (history) {
      fetchData()
    }
  }, [history, startDateTimestamp])

  return formattedHistory
}

export const priceOverrides = [
  '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', // USDC
  '0x6b175474e89094c44da98b954eedeac495271d0f' // DAI
]

export async function getReturns(user, pair, ethPrice) {
  const {
    data: { liquidityPositionSnapshots: history }
  } = await client.query({
    query: USER_HISTORY__PER_PAIR,
    variables: {
      user,
      pair: pair.id
    }
  })

  // asset return
  let assetReturn = 0
  let assetPercentChange = 0

  // net return
  let netReturn = 0
  let netPercentChange = 0

  // get data about the current position
  const currentPosition = {
    liquidityTokenBalance: history[history.length - 1].liquidityTokenBalance,
    liquidityTokenTotalSupply: pair.totalSupply,
    reserve0: pair.reserve0,
    reserve1: pair.reserve1,
    reserveUSD: pair.reserveUSD,
    token0PriceUSD: pair.token0.derivedETH * ethPrice,
    token1PriceUSD: pair.token1.derivedETH * ethPrice
  }

  // calculate the total USD amount provided to use for weighting
  let totalAmountProvidedUSD = 0
  for (const index in history) {
    let positionT0 = history[index]
    totalAmountProvidedUSD =
      totalAmountProvidedUSD +
      (parseFloat(positionT0.liquidityTokenBalance) / parseFloat(positionT0.liquidityTokenTotalSupply)) *
        parseFloat(positionT0.reserveUSD)
  }

  // if (pair.id === '0xa478c2975ab1ea89e8196811f51a7b7ade33eb11') {
  //   console.log(history)
  //   console.log('-------')
  // }

  for (const index in history) {
    // get positions at both bounds of the window
    let positionT0 = history[index]
    let positionT1 = history[parseInt(index) + 1] || {}

    // if at last index in history - use current data as end of window
    if (parseInt(index) === history.length - 1) {
      positionT1 = currentPosition
    }

    // hard code prices before launch to get better results for stablecoins and WETH
    if (positionT0.timestamp < 1589747086) {
      if (priceOverrides.includes(positionT0.pair.token0.id)) {
        positionT0.token0PriceUSD = 1
      }
      if (priceOverrides.includes(positionT0.pair.token1.id)) {
        positionT0.token1PriceUSD = 1
      }

      // WETH price
      if (positionT0.pair.token0.id === '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2') {
        positionT0.token0PriceUSD = 203
      }
      if (positionT0.pair.token1.id === '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2') {
        positionT0.token1PriceUSD = 203
      }
    }
    if (positionT1.timestamp < 1589747086) {
      if (priceOverrides.includes(positionT1.pair.token0.id)) {
        positionT1.token0PriceUSD = 1
      }
      if (priceOverrides.includes(positionT1.pair.token1.id)) {
        positionT1.token1PriceUSD = 1
      }
      // WETH price
      if (positionT1.pair.token0.id === '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2') {
        positionT1.token0PriceUSD = 203
      }
      if (positionT1.pair.token1.id === '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2') {
        positionT1.token1PriceUSD = 203
      }
    }

    // calculate ownership at ends of window, for end of window we need original LP token balance / new total supply
    const t0Ownership = parseFloat(positionT0.liquidityTokenBalance) / parseFloat(positionT0.liquidityTokenTotalSupply)
    const t1Ownership = parseFloat(positionT0.liquidityTokenBalance) / parseFloat(positionT1.liquidityTokenTotalSupply)

    // get starting amounts of token0 and token1 deposited by LP
    const token0_amount_t0 = t0Ownership * parseFloat(positionT0.reserve0)
    const token1_amount_t0 = t0Ownership * parseFloat(positionT0.reserve1)

    // calculate USD value at t0 and t1 using initial token deposit amounts for asset return
    const assetValueT0 =
      token0_amount_t0 * parseFloat(positionT0.token0PriceUSD) +
      token1_amount_t0 * parseFloat(positionT0.token1PriceUSD)
    const assetValueT1 =
      token0_amount_t0 * parseFloat(positionT1.token0PriceUSD) +
      token1_amount_t0 * parseFloat(positionT1.token1PriceUSD)

    // calculate value delta based on  prices_t1 - prices_t0 * token_amounts
    const assetValueChange = assetValueT1 - assetValueT0
    assetReturn = assetReturn ? assetReturn + assetValueChange : assetValueChange

    // get net value change for combined data
    const netValueT0 = t0Ownership * parseFloat(positionT0.reserveUSD)
    const netValueT1 = t1Ownership * parseFloat(positionT1.reserveUSD)
    netReturn = netReturn ? netReturn + netValueT1 - netValueT0 : netValueT1 - netValueT0

    // calculate the weight of this interval based on position ratio to total supplied
    const weight = (t0Ownership * parseFloat(positionT0.reserveUSD)) / totalAmountProvidedUSD

    // calculate the weighted percent changes for each metric
    const weightedAssetChange = ((weight * assetValueChange) / assetValueT0) * 100
    const wieghtedNetChange = ((weight * (netValueT1 - netValueT0)) / netValueT0) * 100

    // update the global percent changes
    assetPercentChange = assetPercentChange ? assetPercentChange + weightedAssetChange : weightedAssetChange
    netPercentChange = netPercentChange ? netPercentChange + wieghtedNetChange : wieghtedNetChange
  }

  // uniswap specific return
  let uniswapReturn = netReturn - assetReturn
  let uniswapPercentChange = netPercentChange - assetPercentChange

  return {
    asset: {
      return: assetReturn,
      percent: assetPercentChange
    },
    net: {
      return: netReturn,
      percent: netPercentChange
    },
    uniswap: {
      return: uniswapReturn,
      percent: uniswapPercentChange
    }
  }
}

export function useUserPositions(account) {
  const [state, { updatePositions, updateUserHodlReturns }] = useUserContext()
  const positions = state?.[account]?.[POSITIONS_KEY]
  const [ethPrice] = useEthPrice()

  useEffect(() => {
    async function fetchData(account) {
      try {
        let result = await client.query({
          query: USER_POSITIONS,
          variables: {
            user: account
          },
          fetchPolicy: 'no-cache'
        })
        if (result?.data?.liquidityPositions) {
          let formattedPositions = await Promise.all(
            result?.data?.liquidityPositions.map(async positionData => {
              const returnData = await getReturns(account, positionData.pair, ethPrice)
              return {
                ...positionData,
                assetReturn: returnData.asset.return,
                assetPercentChange: returnData.asset.percent,
                netReturn: returnData.net.return,
                netPercentChange: returnData.net.percent,
                uniswapReturn: returnData.uniswap.return,
                uniswapPercentChange: returnData.uniswap.percent
              }
            })
          )
          updatePositions(account, formattedPositions)
        }
      } catch (e) {
        console.log(e)
      }
    }
    if (!positions && account && ethPrice) {
      fetchData(account)
    }
  }, [account, positions, updatePositions, updateUserHodlReturns, ethPrice])

  return positions
}
