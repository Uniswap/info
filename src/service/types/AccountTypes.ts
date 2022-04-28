export type UserParams = {
  user: string
}

export type TopLiquidityPoolsParams = {
  pair: string
}

export type UserMintsBurnsParams = {
  user: string
  pair: string
}

export type UserHistoryParams = OffsetParams<UserParams>

type Token = {
  id: string
  symbol: string
}

type Transaction = {
  id: string
  // FIXME: map this to number
  timestamp: string
}

type Pair = {
  id: string
  token0: Token
  token1: Token
}

type Mint = {
  id: string
  transaction: Transaction
  pair: Pair
  to: string
  liquidity: string
  amount0: string
  amount1: string
  amountUSD: string
}

type Burn = {
  id: string
  transaction: Transaction
  pair: Pair
  sender: string
  to: string
  liquidity: string
  amount0: string
  amount1: string
  amountUSD: string
}

export type UserMintsBurnsData = {
  mints: Mint[]
  burns: Burn[]
  swaps: []
}

export type User = {
  id: string
}

export type LiquidityPosition = {
  user: User
  pair: Pick<Pair, 'id'>
  liquidityTokenBalance: string
}

export type TopLiquidityPoolsData = {
  liquidityPositions: LiquidityPosition[]
}

//  getUserPositions
type LiquidityPositionsToken = {
  id: string
  symbol: string
  derivedETH: string
}

type LiquidityPositionsPair = {
  id: string
  reserve0: string
  reserve1: string
  reserveUSD: string
  token0: LiquidityPositionsToken
  token1: LiquidityPositionsToken
  totalSupply: string
}

type UserPositionLiquidityPositions = {
  liquidityPositions: {
    pair: LiquidityPositionsPair
    liquidityTokenBalance: string
  }
}

export type UserPositionData = {
  liquidityPositions: UserPositionLiquidityPositions[]
}
