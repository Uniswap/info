import React, { createContext, useContext, useReducer, useMemo, useCallback } from 'react'
const UPDATE_CHAIN = 'UPDATE_CHAIN'

export const NetworksInfoEnv = []
for (const key in process.env) {
  if (key.startsWith('REACT_APP_NETWORK_INFO_')) {
    const splited = key.slice('REACT_APP_NETWORK_INFO_'.length).split('_')
    const networkName = splited[0]
    const networkProperty = splited.slice(1).join('_')
    let networkValue
    if (networkProperty === 'SUBGRAPH_URL') {
      networkValue = process.env[key].split(',')
    } else if (networkProperty === 'CHAIN_ID') {
      networkValue = parseInt(process.env[key])
    } else {
      networkValue = process.env[key]
    }
    let networkInfo = NetworksInfoEnv.find(network => network.ENV_KEY === networkName)
    if (networkInfo) {
      networkInfo[networkProperty] = networkValue
    } else {
      networkInfo = {}
      networkInfo.ENV_KEY = networkName
      networkInfo[networkProperty] = networkValue
      NetworksInfoEnv.push(networkInfo)
    }
  }
}
NetworksInfoEnv.sort((networkInfoA, networkInfoB) => networkInfoA.LIST_ORDER - networkInfoB.LIST_ORDER)
console.log('🚀 ---------------------------------------------')
console.log('🚀 ~ NetworksInfoEnv', NetworksInfoEnv)
console.log('🚀 ---------------------------------------------')

// const INITIAL_STATE = {}
const INITIAL_STATE = {
  networksInfo: NetworksInfoEnv[0],
}

const NetworkInfoContext = createContext()

function useNetworksInfoContext() {
  return useContext(NetworkInfoContext)
}

function reducer(state, { type, payload }) {
  switch (type) {
    case UPDATE_CHAIN: {
      const { newChain } = payload
      const newNetworkInfo = NetworksInfoEnv.find(network => network.ENV_KEY === newChain)
      return {
        networksInfo: newNetworkInfo ? newNetworkInfo : NetworksInfoEnv[0],
        // networksInfo: newNetworkInfo ? [newNetworkInfo] : NetworksInfoEnv,
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
  return [networksInfo, updateChain]
}
