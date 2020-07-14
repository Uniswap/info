import React, { createContext, useContext, useReducer, useMemo, useCallback, useEffect, useState } from 'react'
import { client } from '../apollo/client'
import {
  USER_TRANSACTIONS,
  USER_POSITIONS,
  USER_HISTORY,
  PAIR_DAY_DATA,
  USER_HISTORY__PER_PAIR
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

  const getTopPairDayDatas = useCallback(async (timestampCeiling, history) => {
    let filtered = await history.map(async position => {
      if (parseInt(position.timestamp) < timestampCeiling) {
        let result = await client.query({
          query: PAIR_DAY_DATA,
          variables: {
            pairAddress: position.pair.id,
            date: parseInt(position.timestamp)
          },
          fetchPolicy: 'cache-first'
        })
        let reserveUSD = parseFloat(result?.data?.pairDayDatas?.[0]?.reserveUSD)
        let totalSupply = parseFloat(result?.data?.pairDayDatas?.[0]?.totalSupply)
        const value = (reserveUSD * parseFloat(position.liquidityTokenBalance)) / parseFloat(totalSupply)
        return { pairAddress: position.pair.id, timestamp: position.timestamp, value }
      } else return false
    })
    return Promise.all(filtered)
  }, [])

  useEffect(() => {
    async function fetchData() {
      /**
       * 1. get all snapshots
       * 2. starting with t0, increment days until now
       * 3. for each day, grab latest LP snapshots for each pair
       * 4. for each of those, grab day data for that pair on that date
       * 5. calculate USD val for each one, then aggregate
       */
      let dayIndex = parseInt(startDateTimestamp / 86400) // get unique day bucket unix
      const currentDayIndex = parseInt(dayjs.utc().unix() / 86400)
      // sort snapshots in order
      let sortedPositions = history.sort((a, b) => {
        if (parseInt(a.timestamp) > parseInt(b.timestamp)) {
          return 1
        }
        return -1
      })
      // if UI start time is > first position time - bump start index to this time
      if (parseInt(sortedPositions[0].timestamp) > dayIndex) {
        dayIndex = parseInt(parseInt(sortedPositions[0].timestamp) / 86400)
      }

      let formattedHistory = []
      while (dayIndex < currentDayIndex) {
        let dayData = {}
        let timestampCeiling = dayIndex * 86400 + 86400
        let liquiditySumUSD = 0
        let pairTopValues = await getTopPairDayDatas(timestampCeiling, history)
        /**
         * for the current day, make sure only 1 unique pairdaydata per pair in list
         */
        let removeDuplicates = {}
        pairTopValues.map(pairData => {
          if (
            pairData &&
            ((removeDuplicates[pairData.pairAddress] &&
              removeDuplicates[pairData.pairAddress].timestamp < pairData.timestamp) ||
              !removeDuplicates[pairData.pairAddress])
          ) {
            removeDuplicates[pairData.pairAddress] = pairData
          }
          return true
        })
        Object.keys(removeDuplicates).map(pairAddress => {
          return (liquiditySumUSD = liquiditySumUSD + removeDuplicates[pairAddress].value)
        })
        dayData.date = parseInt(dayIndex) * 86400
        dayData.valueUSD = liquiditySumUSD
        formattedHistory.push(dayData)
        dayIndex = dayIndex + 1
      }

      setFormattedHistory(formattedHistory)
    }
    if (history) {
      fetchData()
    }
  }, [getTopPairDayDatas, history, startDateTimestamp])
  return formattedHistory
}

export async function getPairAssetReturnForUser(user, pair, ethPrice) {
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

  for (const index in history) {
    // compare to current values
    let positionT0 = history[index]
    let positionT1 = history[index + 1] || {}
    if (parseInt(index) === history.length - 1) {
      positionT1 = currentPosition
    }

    // get starting amounts of token0 and token1 deposited by LP
    const token0_amount =
      (parseFloat(positionT0.liquidityTokenBalance) / parseFloat(positionT0.liquidityTokenTotalSupply)) *
      parseFloat(positionT0.reserve0)
    const token1_amount =
      (parseFloat(positionT0.liquidityTokenBalance) / parseFloat(positionT0.liquidityTokenTotalSupply)) *
      parseFloat(positionT0.reserve1)

    // calculate USD value at t0 and t1 using initial token deposit amounts for asset return
    const assetValueT0 = token0_amount * positionT0.token0PriceUSD + token1_amount * positionT0.token1PriceUSD
    const assetValueT1 = token0_amount * positionT1.token0PriceUSD + token1_amount * positionT1.token1PriceUSD

    // calculate value delta based on  prices_t1 - prices_t0 * token_amounts
    const assetValueChange = assetValueT1 - assetValueT0
    assetReturn = assetReturn ? assetReturn + assetValueChange : assetValueChange

    // get net value change for combined data
    const netValueT0 =
      (parseFloat(positionT0.liquidityTokenBalance) / parseFloat(positionT0.liquidityTokenTotalSupply)) *
      parseFloat(positionT0.reserveUSD)
    const netValueT1 =
      (parseFloat(positionT1.liquidityTokenBalance) / parseFloat(positionT1.liquidityTokenTotalSupply)) *
      parseFloat(positionT1.reserveUSD)
    netReturn = netReturn ? netReturn + netValueT1 - netValueT0 : netValueT1 - netValueT0

    // calculate the weight of this interval based on position ratio to total supplied
    const weight =
      ((parseFloat(positionT0.liquidityTokenBalance) / parseFloat(positionT0.liquidityTokenTotalSupply)) *
        parseFloat(positionT0.reserveUSD)) /
      totalAmountProvidedUSD

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
              const returnData = await getPairAssetReturnForUser(account, positionData.pair, ethPrice)
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
