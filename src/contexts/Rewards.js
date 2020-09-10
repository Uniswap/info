import React, { createContext, useContext, useReducer, useMemo, useCallback, useEffect } from 'react'
import axios from 'axios'
import { safeAccess } from '../utils'

const MINUTES_5 = 5 * 60 * 1000
const UPDATE = 'UPDATE'

const RewardsContext = createContext()

function useRewardsContext() {
  return useContext(RewardsContext)
}

function reducer(state, { type, payload }) {
  switch (type) {
    case UPDATE: {
      const reward = payload

      if (!reward) return

      return {
        ...state,
        reward
      }
    }
    default: {
      throw Error(`Unexpected action type in RewardsContext reducer: '${type}'.`)
    }
  }
}

export default function Provider({ children }) {
  const [state, dispatch] = useReducer(reducer, [])

  const update = useCallback(rewards => {
    dispatch({ type: UPDATE, payload: rewards })
  }, [])

  return (
    <RewardsContext.Provider
      value={useMemo(() => {
        return {
          state,
          update
        }
      }, [state, update])}
    >
      {children}
    </RewardsContext.Provider>
  )
}

export function Updater() {
  const { update } = useRewardsContext()

  useEffect(() => {
    let stale = false

    const get = async () => {
      if (!stale) {
        const result = await getRewards()
        update(result)
      }
    }

    get()

    const pricePoll = setInterval(() => {
      get()
    }, MINUTES_5)

    return () => {
      stale = true
      clearInterval(pricePoll)
    }
  }, [update])

  return null
}

export function useRewards() {
  const { state } = useRewardsContext()
  return safeAccess(state, ['reward'])
}

const getRewards = async () => {
  try {
    const res = await axios.get(`https://spacejelly.network/candy/api/v1/lp/get`)
    return res.data
  } catch (error) {
    console.log('REWARDS_ERROR: ', error)
    return {}
  }
}
