interface PairToken {
  derivedETH: string
  id: string
  name: string
  symbol: string
  totalLiquidity: string
}

export interface Pair {
  createdAtTimestamp: string
  id: string
  liquidityChangeUSD: number
  oneDayVolumeUSD: number
  oneDayVolumeUntracked: number
  oneWeekVolumeUSD: number
  reserve0: string
  reserve1: string
  reserveETH: string
  reserveUSD: string
  token0: PairToken
  token0Price: string
  token1: PairToken
  token1Price: string
  totalSupply: string
  trackedReserveETH: string
  trackedReserveUSD: number
  txCount: string
  untrackedVolumeUSD: string
  volumeChangeUSD: number
  volumeChangeUntracked: number
  volumeUSD: string
  chartData?: PairDayData[]
  timeWindowData?: TimeWindowData
  txns?: Transactions
}

export interface PairDayData {
  dailyVolumeToken0?: string
  dailyVolumeToken1?: string
  dailyVolumeUSD: number
  date: number
  dayString?: number
  id: string
  reserveUSD: number
}

export interface HourDataItem {
  close: number
  open: number
  timestamp: string
}

export type PairsState = Record<SupportedNetwork, Record<string, Pair>>

export type UpdatePairPayload = ParamsWithNetwork<{
  pairAddress: string
  data: Pair
}>

export type UpdateTopPairsPayload = ParamsWithNetwork<{
  topPairs: Pair[]
}>

export type UpdatePairTransactionsPayload = ParamsWithNetwork<{
  address: string
  transactions: Transactions
}>

export type UpdateChartDataPayload = ParamsWithNetwork<{
  address: string
  chartData: PairDayData[]
}>

export type UpdateHourlyDataPayload = ParamsWithNetwork<{
  address: string
  hourlyData: HourDataItem[][]
  timeWindow: string
}>
