import { SupportedNetwork } from 'constants/networks'

export interface ChartDailyItem {
  date: number
  dailyVolumeUSD: number
  totalLiquidityUSD: number
}

export interface GlobalData {
  pairCount: number
  oneDayVolumeUSD: number
  volumeChangeUSD: number
  liquidityChangeUSD: number
  oneDayTxns: number
  oneWeekVolume: number
  weeklyVolumeChange: number
  totalLiquidityUSD: number
}

export interface GlobalNetworkState {
  globalData?: GlobalData
  chartData?: ChartDailyItem[]
  transactions?: Transactions
  price: number
  oneDayPrice: number
  priceChange: number
}

export type GlobalState = Record<SupportedNetwork, GlobalNetworkState>

export type UpdateGlobalDataPayload = ParamsWithNetwork<{
  data: GlobalData
}>

export type UpdateTransactionsPayload = ParamsWithNetwork<{
  transactions: Transactions
}>

export type UpdateChartPayload = ParamsWithNetwork<{
  data: ChartDailyItem[]
}>

export type UpdatePricePayload = ParamsWithNetwork<{
  price: number
  oneDayPrice: number
  priceChange: number
}>
