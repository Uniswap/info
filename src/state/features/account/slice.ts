import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { SupportedNetwork } from 'constants/networks'
import {
  AccountState,
  UpdatePositionsPayload,
  UpdateTransactionsPayload,
  UpdatePositionHistoryPayload,
  UpdatePairReturnsPayload,
  AccountNetworkState,
  UpdateTopLiquidityPositionsPayload
} from './types'

const initialNetworkAccountState: AccountNetworkState = {
  topLiquidityPositions: undefined,
  byAddress: {}
}

const initialState: AccountState = {
  [SupportedNetwork.ETHEREUM]: initialNetworkAccountState,
  [SupportedNetwork.TRON]: initialNetworkAccountState
}

export const accountSlice = createSlice({
  name: 'accounts',
  initialState,
  reducers: {
    updateTransactions: (
      state,
      { payload: { networkId, transactions, account } }: PayloadAction<UpdateTransactionsPayload>
    ) => {
      state[networkId].byAddress[account] = { ...state[networkId].byAddress[account], transactions }
    },
    updatePositions: (state, { payload: { networkId, account, positions } }: PayloadAction<UpdatePositionsPayload>) => {
      state[networkId].byAddress[account] = { ...state[networkId].byAddress[account], positions }
    },
    updatePositionHistory: (
      state,
      { payload: { networkId, account, historyData } }: PayloadAction<UpdatePositionHistoryPayload>
    ) => {
      state[networkId].byAddress[account] = { ...state[networkId].byAddress[account], liquiditySnapshots: historyData }
    },
    updatePairReturns: (
      state,
      { payload: { networkId, account, pairAddress, data } }: PayloadAction<UpdatePairReturnsPayload>
    ) => {
      state[networkId].byAddress[account] = {
        ...state[networkId].byAddress[account],
        pairReturns: { ...state[networkId].byAddress[account]?.pairReturns, [pairAddress]: data }
      }
    },
    updateTopLiquidityPositions: (
      state,
      { payload: { networkId, liquidityPositions } }: PayloadAction<UpdateTopLiquidityPositionsPayload>
    ) => {
      state[networkId].topLiquidityPositions = liquidityPositions
    }
  }
})

export const {
  updateTransactions,
  updatePositions,
  updatePositionHistory,
  updatePairReturns,
  updateTopLiquidityPositions
} = accountSlice.actions

export default accountSlice.reducer
