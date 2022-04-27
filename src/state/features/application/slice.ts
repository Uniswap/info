import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { timeframeOptions } from '../../../constants'
import { NetworkInfo, SupportedNetwork } from 'constants/networks'
import { ApplicationState } from './types'
import { getCurrentNetwork } from 'utils'

const initialState: ApplicationState = {
  timeKey: timeframeOptions.ALL_TIME,
  sessionStart: 0,
  latestBlock: 0,
  headBlock: 0,
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
    setTimeFrame: (state, action: PayloadAction<string>) => {
      state.timeKey = action.payload
    },
    setSessionStart: (state, action: PayloadAction<number>) => {
      state.sessionStart = action.payload
    },
    setLatestBlock: (state, action: PayloadAction<number>) => {
      state.latestBlock = action.payload
    },
    setHeadBlock: (state, action: PayloadAction<number>) => {
      state.headBlock = action.payload
    },
    setSupportedTokens: (state, action: PayloadAction<Array<string>>) => {
      state.supportedTokens[state.activeNetwork.id] = action.payload
    },
    setActiveNetwork: (state, action: PayloadAction<NetworkInfo>) => {
      state.activeNetwork = action.payload
    }
  }
})

export const { setTimeFrame, setSessionStart, setLatestBlock, setHeadBlock, setSupportedTokens, setActiveNetwork } =
  applicationSlice.actions

export default applicationSlice.reducer
