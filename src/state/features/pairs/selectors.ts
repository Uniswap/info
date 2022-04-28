import { useAppSelector } from 'state/hooks'
import { useActiveNetworkId } from '../application/selectors'

export function usePairs() {
  const activeNetwork = useActiveNetworkId()
  return useAppSelector(state => state.pairs[activeNetwork])
}
