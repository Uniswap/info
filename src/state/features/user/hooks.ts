import { useAppDispatch, useAppSelector } from 'state/hooks'
import {
  removeAccount,
  addAccount,
  setDarkMode,
  setDismissedPath,
  addPair,
  removePair,
  addToken,
  removeToken
} from './slice'
import { useActiveNetworkId } from 'state/features/application/hooks'

export function useDarkModeManager(): [boolean, () => void] {
  const dispatch = useAppDispatch()
  const isDarkMode = useAppSelector(state => state.user.darkMode)
  const toggleDarkMode = () => {
    dispatch(setDarkMode(!isDarkMode))
  }
  return [isDarkMode, toggleDarkMode]
}

export function usePathDismissed(path: string) {
  const activeNetwork = useActiveNetworkId()
  const dispatch = useAppDispatch()
  const dismissedPaths = useAppSelector(state => state.user[activeNetwork].dismissedPaths)

  const markDismissedPath = () => {
    dispatch(setDismissedPath({ id: path, networkId: activeNetwork }))
  }

  return [dismissedPaths?.[path], markDismissedPath]
}

export function useSavedAccounts(): [string[], (account: string) => void, (account: string) => void] {
  const activeNetwork = useActiveNetworkId()
  const dispatch = useAppDispatch()
  const savedAccounts = useAppSelector(state => state.user[activeNetwork].savedAccounts)

  const addSavedAccount = (account: string) => {
    dispatch(addAccount({ id: account, networkId: activeNetwork }))
  }

  const removeSavedAccount = (account: string) => {
    dispatch(removeAccount({ id: account, networkId: activeNetwork }))
  }

  return [savedAccounts, addSavedAccount, removeSavedAccount]
}

export function useSavedPairs() {
  const dispatch = useAppDispatch()
  const activeNetwork = useActiveNetworkId()
  const savedPairs = useAppSelector(state => state.user[activeNetwork].savedPairs)

  const addSavedPair = (
    address: string,
    token0Address: string,
    token1Address: string,
    token0Symbol: string,
    token1Symbol: string
  ) => {
    dispatch(
      addPair({
        pair: {
          address,
          token0Address,
          token1Address,
          token0Symbol,
          token1Symbol
        },
        networkId: activeNetwork
      })
    )
  }

  const removeSavedPair = (address: string) => {
    dispatch(removePair({ id: address, networkId: activeNetwork }))
  }

  return [savedPairs, addSavedPair, removeSavedPair]
}

export function useSavedTokens() {
  const dispatch = useAppDispatch()
  const activeNetwork = useActiveNetworkId()
  const savedTokens = useAppSelector(state => state.user[activeNetwork].savedTokens)

  const addSavedToken = (address: string, symbol: string) => {
    dispatch(addToken({ id: address, symbol, networkId: activeNetwork }))
  }

  const removeSavedToken = (address: string) => {
    dispatch(removeToken({ id: address, networkId: activeNetwork }))
  }

  return [savedTokens, addSavedToken, removeSavedToken]
}
