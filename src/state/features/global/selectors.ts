import { useAppSelector } from 'state/hooks'
import { useActiveNetworkId } from '../application/selectors'
import { GlobalData } from './types'

export function useGlobalDataSelector() {
  const activeNetwork = useActiveNetworkId()
  return useAppSelector<GlobalData>(
    state =>
      state.global[activeNetwork]?.globalData || {
        pairCount: 0,
        oneDayVolumeUSD: 0,
        volumeChangeUSD: 0,
        liquidityChangeUSD: 0,
        oneDayTxns: 0,
        oneWeekVolume: 0,
        weeklyVolumeChange: 0,
        totalLiquidityUSD: 0
      }
  )
}

export function useGlobalChartDataSelector() {
  const activeNetwork = useActiveNetworkId()
  return useAppSelector(state => state.global[activeNetwork]?.chartData || [])
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
