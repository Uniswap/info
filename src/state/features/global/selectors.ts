import { useAppSelector } from 'state/hooks'
import { useActiveNetworkId } from '../application/selectors'

export function useGlobalDataSelector() {
  const activeNetwork = useActiveNetworkId()
  return useAppSelector(state => state.global[activeNetwork]?.globalData)
}

export function useGlobalChartDataSelector() {
  const activeNetwork = useActiveNetworkId()
  return useAppSelector(state => state.global[activeNetwork]?.chartData)
}

export function useGlobalTransactionsSelector() {
  const activeNetwork = useActiveNetworkId()
  return useAppSelector(state => state.global[activeNetwork]?.transactions)
}

export function useActiveTokenPrice() {
  const activeNetwork = useActiveNetworkId()
  return useAppSelector(state => state.global[activeNetwork]?.price)
}

export function useActiveTokenOneDayPrice() {
  const activeNetwork = useActiveNetworkId()
  return useAppSelector(state => state.global[activeNetwork]?.oneDayPrice)
}
