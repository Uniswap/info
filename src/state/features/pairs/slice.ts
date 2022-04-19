import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { SupportedNetwork } from 'constants/networks'
import {
  Pair,
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
    updatePair: (state, { payload: { networkId, data, pairAddress } }: PayloadAction<UpdatePairPayload>) => {
      state[networkId][pairAddress] = data
    },
    updateTopPairs: (state, { payload: { networkId, topPairs } }: PayloadAction<UpdateTopPairsPayload>) => {
      const added: Record<string, Pair> = {}
      topPairs.map(pair => {
        return (added[pair.id] = pair)
      })
      state[networkId] = added
    },
    updatePairTransactions: (
      state,
      { payload: { networkId, transactions, address } }: PayloadAction<UpdatePairTransactionsPayload>
    ) => {
      state[networkId][address] = { ...(safeAccess(state[networkId], [address]) || {}), txns: transactions }
    },
    updateChartData: (state, { payload: { networkId, chartData, address } }: PayloadAction<UpdateChartDataPayload>) => {
      state[networkId][address] = {
        ...(safeAccess(state[networkId], [address]) || {}),
        chartData
      }
    },
    updateHourlyData: (
      state,
      { payload: { networkId, address, timeWindow, hourlyData } }: PayloadAction<UpdateHourlyDataPayload>
    ) => {
      const data = state[networkId][address]?.hourlyData
      state[networkId][address].hourlyData = { ...data, [timeWindow]: hourlyData }
    }
  }
})

export const { updatePair, updateTopPairs, updatePairTransactions, updateChartData, updateHourlyData } =
  pairsSlice.actions

export default pairsSlice.reducer
