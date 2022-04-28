import { useAppSelector } from 'state/hooks'
import { useActiveNetworkId } from '../application/selectors'

export function useTokens() {
  const activeNetwork = useActiveNetworkId()
  return useAppSelector(state => state.token[activeNetwork])
}
