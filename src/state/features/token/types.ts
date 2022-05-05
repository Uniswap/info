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

export type TokenPair = {
  id: string
}

export interface Token {
  derivedETH: number
  id: string
  liquidityChangeUSD: number
  name: string
  oneDayTxns: number
  oneDayVolumeUSD: number
  oneDayVolumeUT: number
  oneDayVolumeETH?: number
  priceChangeUSD: number
  priceUSD: number
  symbol: string
  totalLiquidity: number
  totalLiquidityUSD: number
  tradeVolume: number
  tradeVolumeUSD: number
  txCount: number
  txnChange: number
  untrackedVolumeUSD: number
  volumeChangeUSD: number
  volumeChangeUT: number
  transactions?: Transactions
  chartData?: TokenDayData[]
  tokenPairs?: string[]
  timeWindowData?: Record<string, Record<string, TimeWindowItem[]>>
}

export type TokenState = Record<SupportedNetwork, Record<string, Token>>

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
