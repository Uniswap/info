import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { SupportedNetwork } from 'constants/networks'
import {
  PairsState,
  UpdateChartDataPayload,
  UpdateHourlyDataPayload,
  UpdatePairPayload,
  UpdatePairTransactionsPayload,
  UpdateTopPairsPayload
} from './types'

function safeAccess(object: any, path: any) {
  return object
    ? path.reduce(
        (accumulator: any, currentValue: any) =>
          accumulator && accumulator[currentValue] ? accumulator[currentValue] : null,
        object
      )
    : null
}

const initialState: PairsState = {
  [SupportedNetwork.ETHEREUM]: {},
  [SupportedNetwork.TRON]: {}
}

export const pairsSlice = createSlice({
  name: 'pairs',
  initialState,
  reducers: {
    setPair: (state, { payload: { networkId, data, pairAddress } }: PayloadAction<UpdatePairPayload>) => {
      state[networkId][pairAddress] = data
    },
    setTopPairs: (state, { payload: { networkId, topPairs } }: PayloadAction<UpdateTopPairsPayload>) => {
      const added: Record<string, Pair> = {}
      topPairs.map(pair => {
        return (added[pair.id] = pair)
      })
      state[networkId] = added
    },
    setPairTransactions: (
      state,
      { payload: { networkId, transactions, address } }: PayloadAction<UpdatePairTransactionsPayload>
    ) => {
      state[networkId][address] = { ...(safeAccess(state[networkId], [address]) || {}), txns: transactions }
    },
    setChartData: (state, { payload: { networkId, chartData, address } }: PayloadAction<UpdateChartDataPayload>) => {
      state[networkId][address] = {
        ...(safeAccess(state[networkId], [address]) || {}),
        chartData
      }
    },
    setHourlyData: (
      state,
      { payload: { networkId, address, timeWindow, hourlyData } }: PayloadAction<UpdateHourlyDataPayload>
    ) => {
      const data = state[networkId][address]?.timeWindowData
      state[networkId][address].timeWindowData = { ...data, [timeWindow]: hourlyData }
    }
  }
})

export const { setPair, setTopPairs, setPairTransactions, setChartData, setHourlyData } = pairsSlice.actions

export default pairsSlice.reducer
