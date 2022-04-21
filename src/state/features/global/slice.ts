import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { SupportedNetwork } from 'constants/networks'
import {
  GlobalNetworkState,
  GlobalState,
  UpdateChartPayload,
  UpdateGlobalDataPayload,
  UpdatePricePayload,
  UpdateTransactionsPayload
} from './types'

const initialGlobalNetworkState: GlobalNetworkState = {
  globalData: undefined,
  chartData: undefined,
  transactions: undefined,
  price: 0,
  oneDayPrice: 0,
  priceChange: 0
}

const initialState: GlobalState = {
  [SupportedNetwork.ETHEREUM]: initialGlobalNetworkState,
  [SupportedNetwork.TRON]: initialGlobalNetworkState
}

export const globalSlice = createSlice({
  name: 'global',
  initialState,
  reducers: {
    updateGlobalData: (state, { payload: { networkId, data } }: PayloadAction<UpdateGlobalDataPayload>) => {
      state[networkId].globalData = data
    },
    updateTransactions: (state, { payload: { networkId, transactions } }: PayloadAction<UpdateTransactionsPayload>) => {
      state[networkId].transactions = transactions
    },
    updateChart: (state, { payload: { networkId, daily, weekly } }: PayloadAction<UpdateChartPayload>) => {
      state[networkId].chartData = {
        daily,
        weekly
      }
    },
    updatePrice: (
      state,
      { payload: { networkId, price, oneDayPrice, priceChange } }: PayloadAction<UpdatePricePayload>
    ) => {
      state[networkId].price = price
      state[networkId].oneDayPrice = oneDayPrice
      state[networkId].priceChange = priceChange
    }
  }
})

export const { updateGlobalData, updateTransactions, updateChart, updatePrice } = globalSlice.actions

export default globalSlice.reducer
