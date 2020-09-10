import React, { createContext, useContext, useReducer, useMemo, useCallback, useEffect } from 'react'
import axios from 'axios'
import { formattedNum, parseRawNumber } from '../utils'
import { ASSETS_MAP } from '../constants/assets'

const UPDATE = 'UPDATE'

const HistoryContext = createContext()

const TIMESTAMP_FORMAT = { AE: true }

function useHistoryContext() {
  return useContext(HistoryContext)
}

function reducer(state, { type, payload }) {
  switch (type) {
    case UPDATE: {
      let swaps = payload

      if (!swaps) return

      swaps = swaps.reduce((result, s) => {
        if (ASSETS_MAP[s.network] && ASSETS_MAP[s.outputNetwork]) {
          if (TIMESTAMP_FORMAT[s.network]) {
            s.expiration = s.expiration / 1000
          }

          s.inputAmountNum = formattedNum(parseRawNumber(s.inputAmount, ASSETS_MAP[s.network].decimals))
          s.outputAmountNum = formattedNum(parseRawNumber(s.outputAmount, ASSETS_MAP[s.outputNetwork].decimals))

          result.push(s)
        }

        return result
      }, [])

      swaps = swaps.sort((a, b) => {
        return b.expiration - a.expiration
      })

      return [...state, ...swaps]
    }
    default: {
      throw Error(`Unexpected action type in HistoryContext reducer: '${type}'.`)
    }
  }
}

export default function Provider({ children }) {
  const [state, dispatch] = useReducer(reducer, [])

  const update = useCallback(swaps => {
    dispatch({ type: UPDATE, payload: swaps })
  }, [])

  useEffect(() => {
    function get() {
      getHistory().then(swaps => {
        update(swaps)
      })
    }

    get()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <HistoryContext.Provider
      value={useMemo(() => {
        return {
          state,
          update
        }
      }, [state, update])}
    >
      {children}
    </HistoryContext.Provider>
  )
}

export function useHistory() {
  const { state } = useHistoryContext()
  return state
}

export function useHistoryForAsset(asset) {
  const { state } = useHistoryContext()

  const txIncludingAsset = state.filter(tx => tx.network === asset || tx.outputNetwork === asset)

  return txIncludingAsset
}

export function useHistoryCount() {
  const { state } = useHistoryContext()
  return state.length
}

export const getHistory = async () => {
  try {
    const res = await axios.get(`
      https://jelly-tracker.herokuapp.com/api/v1/swaps/all`)
    return res.data
  } catch (error) {
    console.log('HISTORY_ERR: ', error)
    return {}
  }
}
