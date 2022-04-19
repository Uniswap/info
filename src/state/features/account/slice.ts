import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { SupportedNetwork } from 'constants/networks'
import {
  AccountState,
  UpdatePositionsPayload,
  UpdateTransactionsPayload,
  UpdatePositionHistoryPayload,
  UpdatePairReturnsPayload
} from './types'

const initialState: AccountState = {
  [SupportedNetwork.ETHEREUM]: {},
  [SupportedNetwork.TRON]: {}
}

export const accountSlice = createSlice({
  name: 'accounts',
  initialState,
  reducers: {
    updateTransactions: (
      state,
      { payload: { networkId, transactions, account } }: PayloadAction<UpdateTransactionsPayload>
    ) => {
      state[networkId][account] = { ...state[networkId][account], transactions }
    },
    updatePositions: (state, { payload: { networkId, account, positions } }: PayloadAction<UpdatePositionsPayload>) => {
      state[networkId][account] = { ...state[networkId][account], positions }
    },
    updatePositionHistory: (
      state,
      { payload: { networkId, account, historyData } }: PayloadAction<UpdatePositionHistoryPayload>
    ) => {
      state[networkId][account] = { ...state[networkId][account], liquiditySnapshots: historyData }
    },
    updatePairReturns: (
      state,
      { payload: { networkId, account, pairAddress, data } }: PayloadAction<UpdatePairReturnsPayload>
    ) => {
      state[networkId][account] = {
        ...state[networkId][account],
        pairReturns: { ...state[networkId][account]?.pairReturns, [pairAddress]: data }
      }
      state[networkId][account].pairReturns[pairAddress] = data
    }
  }
})

export const { updateTransactions, updatePositions, updatePositionHistory, updatePairReturns } = accountSlice.actions

export default accountSlice.reducer
