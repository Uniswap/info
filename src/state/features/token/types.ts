export interface TokenDetails extends Token {
  transactions?: Transactions
  chartData?: TokenDayData[]
  tokenPairs?: string[]
  timeWindowData?: Record<string, Record<string, TimeWindowItem[]>>
}

export type TokenDayData = {
  dailyVolumeETH?: string
  dailyVolumeToken?: string
  dailyVolumeUSD: number
  date: number
  id?: string
  priceUSD: string
  totalLiquidityETH?: string
  totalLiquidityToken?: string
  totalLiquidityUSD: string
  dayString?: number
}

export type TokenState = Record<SupportedNetwork, Record<string, TokenDetails>>

export type UpdateTokenPayload = ParamsWithNetwork<{
  tokenAddress: string
  data: Token
}>

export type UpdateTopTokensPayload = ParamsWithNetwork<{
  topTokens: Token[]
}>

export type UpdateTransactionsPayload = ParamsWithNetwork<{
  address: string
  transactions: Transactions
}>

export type UpdateChartDataPayload = ParamsWithNetwork<{
  address: string
  chartData: TokenDayData[]
}>

export type UpdatePriceDataPayload = ParamsWithNetwork<{
  address: string
  data: TimeWindowItem[]
  timeWindow: string
  interval: number
}>

export type UpdateAllPairsPayload = ParamsWithNetwork<{
  address: string
  allPairs: string[]
}>
