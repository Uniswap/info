import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { SupportedNetwork } from 'constants/networks'
import {
  TokenState,
  UpdateAllPairsPayload,
  UpdateChartDataPayload,
  UpdatePriceDataPayload,
  UpdateTokenPayload,
  UpdateTopTokensPayload,
  UpdateTransactionsPayload
} from './types'

const initialState: TokenState = {
  [SupportedNetwork.ETHEREUM]: {},
  [SupportedNetwork.TRON]: {}
}

export const tokenSlice = createSlice({
  name: 'tokens',
  initialState,
  reducers: {
    updateToken: (state, { payload: { networkId, data, tokenAddress } }: PayloadAction<UpdateTokenPayload>) => {
      state[networkId][tokenAddress] = data
    },
    updateTopTokens: (state, { payload: { networkId, topTokens } }: PayloadAction<UpdateTopTokensPayload>) => {
      state[networkId] = topTokens.reduce((acc, pair) => ({ ...acc, [pair.id]: pair }), {})
    },
    updateTransactions: (
      state,
      { payload: { networkId, transactions, address } }: PayloadAction<UpdateTransactionsPayload>
    ) => {
      state[networkId][address].transactions = transactions
    },
    updateChartData: (state, { payload: { networkId, chartData, address } }: PayloadAction<UpdateChartDataPayload>) => {
      state[networkId][address].chartData = chartData
    },
    updatePriceData: (
      state,
      { payload: { networkId, address, timeWindow, interval, data } }: PayloadAction<UpdatePriceDataPayload>
    ) => {
      state[networkId][address] = {
        ...state[networkId][address],
        timeWindowData: {
          ...state[networkId][address].timeWindowData,
          [timeWindow]: {
            ...state[networkId][address].timeWindowData?.[timeWindow],
            [interval]: data
          }
        }
      }
    },
    updateAllPairs: (state, { payload: { networkId, address, allPairs } }: PayloadAction<UpdateAllPairsPayload>) => {
      state[networkId][address].tokenPairs = allPairs
    }
  }
})

export const { updateToken, updateTopTokens, updateTransactions, updateChartData, updatePriceData, updateAllPairs } =
  tokenSlice.actions

export default tokenSlice.reducer
