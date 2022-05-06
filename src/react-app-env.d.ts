/// <reference types="react-scripts" />

declare enum SupportedNetwork {
  ETHEREUM = 'eth',
  TRON = 'trx'
}

type BlockHeight = {
  timestamp: string
  number: number
}

type OffsetParams<T> = T & {
  skip: number
}

type ParamsWithNetwork<T = unknown> = T & {
  networkId: SupportedNetwork
}

interface TransactionData {
  pair: {
    token0: Pick<Token, 'symbol'>
    token1: Pick<Token, 'symbol'>
  }
  transaction: Transaction
  to: string
}

interface BurnTransaction extends TransactionData {
  amount0: string
  amount1: string
  amountUSD: string
  liquidity: string
  sender: string
}

interface MintTransaction extends TransactionData {
  amount0: string
  amount1: string
  amountUSD: string
  liquidity: string
}

interface SwapTransactions extends TransactionData {
  amount0In: string
  amount0Out: string
  amount1In: string
  amount1Out: string
  amountUSD: string
}

interface Transactions {
  burns: BurnTransaction[]
  mints: MintTransaction[]
  swaps: SwapTransactions[]
}

interface TimeWindowItem {
  close: number
  open: number
  timestamp: string
}

type TimeWindowData = Record<string, TimeWindowItem[][]>

interface Token {
  id: string
  name: string
  symbol: string
  derivedETH: number
  liquidityChangeUSD: number
  oneDayTxns: number
  oneDayVolumeUSD: number
  oneDayVolumeUT: number
  priceChangeUSD: number
  priceUSD: number
  totalLiquidity: number
  totalLiquidityUSD: number
  tradeVolumeUSD: number
  txCount: number
  txnChange: number
  untrackedVolumeUSD: number
  volumeChangeUSD: number
  volumeChangeUT: number
}

interface Pair {
  createdAtTimestamp: string
  id: string
  liquidityChangeUSD: number
  oneDayVolumeUSD: number
  oneDayVolumeUntracked: number
  oneWeekVolumeUSD: number
  reserve0: string
  reserve1: string
  reserveUSD: string
  token0: Pick<Token, 'derivedETH' | 'id' | 'name' | 'symbol' | 'totalLiquidity'>
  token0Price: string
  token1: Pick<Token, 'derivedETH' | 'id' | 'name' | 'symbol' | 'totalLiquidity'>
  token1Price: string
  totalSupply: string
  trackedReserveETH: string
  trackedReserveUSD: number
  untrackedVolumeUSD: string
  volumeChangeUSD: number
  volumeChangeUntracked: number
  volumeUSD: string
}

type PositionPair = Pick<Pair, 'id' | 'reserve0' | 'reserve1' | 'reserveUSD' | 'totalSupply'>

type SnapshotPair = Pick<Pair, 'id' | 'reserve0' | 'reserve1' | 'reserveUSD'> & {
  token0: Pick<Token, 'id'>
  token1: Pick<Token, 'id'>
}

interface Position {
  pair: PositionPair
  liquidityTokenBalance: string
  feeEarned: number
}

interface LiquiditySnapshot {
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

type PairReturn = {
  date: number
  fees: number
  usdValue: number
}

interface LiquidityPosition {
  pairAddress: string
  pairName: string
  token0: string
  token1: string
  usd: number
  user: {
    id: string
  }
}
