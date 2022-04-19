import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { timeframeOptions } from '../../../constants'
import { NetworkInfo, SupportedNetwork } from 'constants/networks'
import { ApplicationState } from './types'
import { getCurrentNetwork } from 'utils'

const initialState: ApplicationState = {
  currency: 'USD',
  timeKey: timeframeOptions.ALL_TIME,
  sessionStart: 0,
  latestBlock: '',
  headBlock: '',
  supportedTokens: {
    [SupportedNetwork.ETHEREUM]: [],
    [SupportedNetwork.TRON]: []
  },
  activeNetwork: getCurrentNetwork()
}

export const applicationSlice = createSlice({
  name: 'application',
  initialState,
  reducers: {
    updateCurrency: (state, action: PayloadAction<string>) => {
      state.currency = action.payload
    },
    updateTimeFrame: (state, action: PayloadAction<string>) => {
      state.timeKey = action.payload
    },
    updateSessionStart: (state, action: PayloadAction<number>) => {
      state.sessionStart = action.payload
    },
    updateLatestBlock: (state, action: PayloadAction<string>) => {
      state.latestBlock = action.payload
    },
    updateHeadBlock: (state, action: PayloadAction<string>) => {
      state.headBlock = action.payload
    },
    updateSupportedTokens: (state, action: PayloadAction<Array<string>>) => {
      state.supportedTokens[state.activeNetwork.id] = action.payload
    },
    updateActiveNetwork: (state, action: PayloadAction<NetworkInfo>) => {
      state.activeNetwork = action.payload
    }
  }
})

export const {
  updateCurrency,
  updateTimeFrame,
  updateSessionStart,
  updateLatestBlock,
  updateHeadBlock,
  updateSupportedTokens,
  updateActiveNetwork
} = applicationSlice.actions

export default applicationSlice.reducer
