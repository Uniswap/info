import { gql } from 'apollo-boost'

export const PAIR_FIELDS = gql`
  fragment PairFields on Pair {
    id
    token0 {
      id
      symbol
      name
      totalLiquidity
      derivedETH
    }
    token1 {
      id
      symbol
      name
      totalLiquidity
      derivedETH
    }
    reserve0
    reserve1
    reserveUSD
    totalSupply
    trackedReserveETH
    volumeUSD
    untrackedVolumeUSD
    token0Price
    token1Price
    createdAtTimestamp
  }
`

export const TOKEN_FIELDS = gql`
  fragment TokenFields on Token {
    id
    name
    symbol
    derivedETH
    tradeVolume
    tradeVolumeUSD
    untrackedVolumeUSD
    totalLiquidity
    txCount
  }
`

export const TOKEN_INFO = gql`
  fragment TokenInfo on Token {
    id
    symbol
    name
  }
`

export const TOKEN_INFO_LIQUIDITY = gql`
  fragment TokenInfoLiquidity on Token {
    id
    symbol
    name
    totalLiquidity
  }
`

export const PAIR_DETAILS = gql`
  fragment PairDetails on Pair {
    id
    token0 {
      id
      symbol
      name
    }
    token1 {
      id
      symbol
      name
    }
  }
`

export const MINT_DETAILS = gql`
  fragment MintDetails on Mint {
    transaction {
      id
      timestamp
    }
    pair {
      token0 {
        symbol
      }
      token1 {
        symbol
      }
    }
    to
    liquidity
    amount0
    amount1
    amountUSD
  }
`

export const BURN_DETAILS = gql`
  fragment BurnDetails on Burn {
    transaction {
      id
      timestamp
    }
    pair {
      token0 {
        symbol
      }
      token1 {
        symbol
      }
    }
    sender
    to
    liquidity
    amount0
    amount1
    amountUSD
  }
`

export const SWAP_DETAILS = gql`
  fragment SwapDetails on Swap {
    transaction {
      id
      timestamp
    }
    pair {
      token0 {
        symbol
      }
      token1 {
        symbol
      }
    }
    amount0In
    amount0Out
    amount1In
    amount1Out
    amountUSD
    to
  }
`
