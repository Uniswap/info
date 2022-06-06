import React, { createContext, useContext, useReducer, useMemo, useCallback, useEffect } from 'react'
import { NETWORKS_INFO } from '../constants/networks'
import { memoRequest } from '../utils'

const UPDATE_CHAIN = 'UPDATE_CHAIN'
const UPDATE_TOKENS_LIST = 'UPDATE_TOKENS_LIST'

export const NetworksInfoEnv = process.env.REACT_APP_SUPPORT_CHAINS_ID.split(',').map(
  supportChainId => NETWORKS_INFO[supportChainId]
)

const INITIAL_STATE = {
  networksInfo: [NetworksInfoEnv[0]],
  tokensList: {},
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
        ...state,
        networksInfo: newNetworkInfo ? [newNetworkInfo] : NetworksInfoEnv,
      }
    }

    case UPDATE_TOKENS_LIST: {
      const { chainId, tokensList } = payload
      const tokensListMapped = tokensList?.tokens?.reduce(
        (acc, cur) => ({
          ...acc,
          [cur.address]: cur,
        }),
        {}
      )

      state.tokensList = {
        ...state.tokensList,
        [chainId]: tokensListMapped,
      }
      return state
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

  const updateTokensList = useCallback((chainId, tokensList) => {
    dispatch({
      type: UPDATE_TOKENS_LIST,
      payload: {
        chainId,
        tokensList,
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
            updateTokensList,
          },
        ],
        [state, updateChain, updateTokensList]
      )}
    >
      {children}
    </NetworkInfoContext.Provider>
  )
}

async function getTokenList(listUrl) {
  let response
  try {
    response = await fetch(listUrl)
  } catch (error) {
    console.debug('Failed to fetch list', listUrl, error)
    throw new Error(`Failed to download list ${listUrl}`)
  }

  if (!response.ok) {
    throw new Error(`Failed to download list ${listUrl}`)
  }

  const json = await response.json()
  // if (!tokenListValidator(json)) {
  //   const validationErrors: string =
  //     tokenListValidator.errors?.reduce<string>((memo, error) => {
  //       const add = `${error.dataPath} ${error.message ?? ''}`
  //       return memo.length > 0 ? `${memo}; ${add}` : `${add}`
  //     }, '') ?? 'unknown error'
  //   throw new Error(`Token list failed validation: ${validationErrors}`)
  // }
  return json
}

export function useNetworksInfo() {
  const [{ networksInfo }, { updateChain }] = useNetworksInfoContext()
  return [networksInfo.filter(Boolean).length ? networksInfo : [NetworksInfoEnv[0]], updateChain]
}

export function useTokensList() {
  const [networksInfo] = useNetworksInfo()
  const [{ tokensList }, { updateTokensList }] = useNetworksInfoContext()

  useEffect(() => {
    const fetchTokensList = async index => {
      try {
        const tokenList = await getTokenList(networksInfo[index].tokensListUrl)
        updateTokensList(networksInfo[index].chainId, tokenList)
      } catch (e) {}
    }
    networksInfo.forEach((networkInfo, index) => {
      if (!tokensList?.[networkInfo.chainId]) {
        memoRequest(() => fetchTokensList(index), 'useTokensList_' + networkInfo.chainId, 9999999999) //never expired cache
      }
    })
  }, [networksInfo, tokensList, updateTokensList])

  return tokensList
}
