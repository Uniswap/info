import React, { createContext, useContext, useReducer, useMemo, useCallback } from 'react'
import { NETWORKS_INFO } from '../constants/networks'
const UPDATE_CHAIN = 'UPDATE_CHAIN'

export const NetworksInfoEnv = process.env.REACT_APP_SUPPORT_CHAINS_ID.split(',').map(
  supportChainId => NETWORKS_INFO[supportChainId]
)
const INITIAL_STATE = {
  networksInfo: [NetworksInfoEnv[0]],
}

const NetworkInfoContext = createContext()

function useNetworksInfoContext() {
  return useContext(NetworkInfoContext)
}

function reducer(state, { type, payload }) {
  switch (type) {
    case UPDATE_CHAIN: {
      const { newChain } = payload
      const newNetworkInfo = NetworksInfoEnv.find(network => network.chainId === newChain)
      return {
        networksInfo: newNetworkInfo ? [newNetworkInfo] : NetworksInfoEnv,
      }
    }

    default: {
      throw Error(`Unexpected action type in DataContext reducer: '${type}'.`)
    }
  }
}

export default function Provider({ children }) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE)
  const updateChain = useCallback(newChain => {
    dispatch({
      type: UPDATE_CHAIN,
      payload: {
        newChain,
      },
    })
  }, [])

  return (
    <NetworkInfoContext.Provider
      value={useMemo(
        () => [
          state,
          {
            updateChain,
          },
        ],
        [state, updateChain]
      )}
    >
      {children}
    </NetworkInfoContext.Provider>
  )
}

export function useNetworksInfo() {
  const [{ networksInfo }, { updateChain }] = useNetworksInfoContext()
  return [networksInfo.filter(Boolean).length ? networksInfo : [NetworksInfoEnv[0]], updateChain]
}
