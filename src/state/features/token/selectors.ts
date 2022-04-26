import { useAppSelector } from 'state/hooks'
import { useActiveNetworkId } from '../application/hooks'

export function useTokens() {
  const activeNetwork = useActiveNetworkId()
  return useAppSelector(state => state.token[activeNetwork])
}
