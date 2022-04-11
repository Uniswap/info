import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { SupportedNetwork } from 'constants/networks'
import { AddPairPayload, AddTokenPayload, SavedItemPayload, UserState } from './types'

const initialNetworkSavedState = {
  dismissedPaths: {},
  savedAccounts: [],
  savedTokens: {},
  savedPairs: {}
}

const initialState: UserState = {
  darkMode: true,
  [SupportedNetwork.ETHEREUM]: initialNetworkSavedState,
  [SupportedNetwork.TRON]: initialNetworkSavedState
}

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setDarkMode: (state, action: PayloadAction<boolean>) => {
      state.darkMode = action.payload
    },
    setDismissedPath: (state, { payload: { id, networkId } }: PayloadAction<SavedItemPayload>) => {
      state[networkId].dismissedPaths[id] = true
    },
    addToken: (state, { payload: { id, networkId, symbol } }: PayloadAction<AddTokenPayload>) => {
      state[networkId].savedTokens[id] = { symbol }
    },
    removeToken: (state, { payload: { networkId, id } }: PayloadAction<SavedItemPayload>) => {
      delete state[networkId].savedTokens[id]
    },
    addPair: (state, { payload: { networkId, pair } }: PayloadAction<AddPairPayload>) => {
      state[networkId].savedPairs[pair.address] = pair
    },
    removePair: (state, { payload: { networkId, id } }: PayloadAction<SavedItemPayload>) => {
      delete state[networkId].savedPairs[id]
    },
    addAccount: (state, { payload: { networkId, id } }: PayloadAction<SavedItemPayload>) => {
      state[networkId].savedAccounts.push(id)
    },
    removeAccount: (state, { payload: { networkId, id } }: PayloadAction<SavedItemPayload>) => {
      const savedAccounts = state[networkId].savedAccounts
      const index = savedAccounts.indexOf(id)
      if (index > -1) {
        savedAccounts.splice(index, 1)
      }
    }
  }
})

export const { setDismissedPath, addPair, removePair, addToken, removeToken, addAccount, removeAccount, setDarkMode } =
  userSlice.actions

export default userSlice.reducer
