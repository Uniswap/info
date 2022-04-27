import { useAppSelector } from 'state/hooks'

export function useActiveNetworkId() {
  return useAppSelector(state => state.application.activeNetwork.id)
}

export function useLatestBlock() {
  return useAppSelector(state => state.application.latestBlock)
}

export function useTimeFrame() {
  return useAppSelector(state => state.application.timeKey)
}
