type PositionToken = {
  derivedETH: string
  id: string
  symbol: string
}

type Principal = {
  amount0: number
  amount1: number
  usd: number
}

type PositionPair = {
  id: string
  reserve0: string
  reserve1: string
  reserveUSD: string
  totalSupply: string
  token0: PositionToken
  token1: PositionToken
}

export interface Position {
  pair: PositionPair
  principal: Principal
  liquidityTokenBalance: string
  fees: {
    sum: number
  }
  net: {
    return: number
  }
  uniswap: {
    return: number
  }
}

export type SnapshotToken = {
  id: string
}

export type SnapshotPair = {
  id: string
  reserve0: string
  reserve1: string
  reserveUSD: string
  token0: SnapshotToken
  token1: SnapshotToken
}

export interface LiquiditySnapshot {
  liquidityTokenBalance: string
  liquidityTokenTotalSupply: string
  pair: SnapshotPair
  reserve0: string
  reserve1: string
  reserveUSD: string
  timestamp: number
  token0PriceUSD: string
  token1PriceUSD: string
}

export type PairReturn = {
  date: number
  fees: number
  usdValue: number
}

type PairReturns = Record<string, PairReturn[]>

export interface Account {
  positions: Position[]
  transactions: Transactions
  liquiditySnapshots: LiquiditySnapshot[]
  pairReturns: PairReturns
}

export type AccountNetworkState = {
  topLiquidityPositions?: Array<LiquidityPosition>
  byAddress: Record<string, Account>
}

export type AccountState = Record<SupportedNetwork, AccountNetworkState>

export type UpdateTransactionsPayload = ParamsWithNetwork<{
  account: string
  transactions: Transactions
}>

export type UpdatePositionsPayload = ParamsWithNetwork<{
  account: string
  positions: Position[]
}>

export type UpdatePositionHistoryPayload = ParamsWithNetwork<{
  account: string
  historyData: LiquiditySnapshot[]
}>

export type UpdatePairReturnsPayload = ParamsWithNetwork<{
  account: string
  pairAddress: string
  data: PairReturn[]
}>

export type LiquidityChart = {
  date: number
  valueUSD: number
}

export type LiquidityPositionUser = {
  id: string
}

export interface LiquidityPosition {
  pairAddress: string
  pairName: string
  token0: string
  token1: string
  usd: number
  user: LiquidityPositionUser
}

export type UpdateTopLiquidityPositionsPayload = ParamsWithNetwork<{
  liquidityPositions: Array<LiquidityPosition>
}>
