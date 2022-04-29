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
  pair: Pair
  transaction: Transaction
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
  to: string
}

interface SwapTransactions extends TransactionData {
  amount0In: string
  amount0Out: string
  amount1In: string
  amount1Out: string
  amountUSD: string
  to: string
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
