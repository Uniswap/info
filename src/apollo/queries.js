import gql from 'graphql-tag'

export const ETH_PRICE = gql`
  query bundles {
    bundles(where: { id: 1 }) {
      id
      ethPrice
    }
  }
`

export const PAIR_CHART = gql`
  query pairDayDatas($pairAddress: Bytes!) {
    pairDayDatas(orderBy: date, orderDirection: asc, where: { pairAddress: $pairAddress }) {
      id
      date
      dailyVolumeToken0
      dailyVolumeToken1
      dailyVolumeUSD
      reserve0
      reserve1
      reserveUSD
    }
  }
`

export const PAIR_TXNS = gql`
  query transactions($pairAddress: Bytes!) {
    mints(orderBy: timestamp, orderDirection: desc, where: { pair: $pairAddress }) {
      pair {
        token0
        token1
      }
      to
      liquidity
      amount0
      amount1
      amountUSD
    }
    burns(orderBy: timestamp, orderDirection: desc, where: { pair: $pairAddress }) {
      pair {
        token0
        token1
      }
      to
      liquidity
      amount0
      amount1
      amountUSD
    }
    swaps(orderBy: timestamp, orderDirection: desc, where: { pair: $pairAddress }) {
      pair {
        token0
        token1
      }
      liquidity
      amount0In
      amount0Out
      amount1In
      amount1Out
      to
    }
  }
`

export const PAIR_DATA = (pairAddress, block) => {
  const queryString =
    `
    query pairs {
      pairs(block: {number: ` +
    block +
    `} where: { id: "` +
    pairAddress +
    `"}) {
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
        reserve0
        reserve1
        reserveUSD
      }
    }`

  return gql(queryString)
}

export const GLOBAL_CHART = gql`
  query uniswapDayDatas {
    uniswapDayDatas(orderBy: date, orderDirection: desc) {
      id
      date
      totalVolumeUSD
      dailyVolumeUSD
      dailyVolumeETH
      totalLiquidityUSD
      totalLiquidityETH
      mostLiquidTokens {
        id
        totalLiquidityETH
        totalLiquidityUSD
        token {
          id
          symbol
        }
      }
    }
  }
`

export const GLOBAL_DATA = block => {
  const queryString =
    `
  query uniswapFactories {
    uniswapFactories(block: {number: ` +
    block +
    `} where: { id: "0xe2f197885abe8ec7c866cFf76605FD06d4576218" }) {
      id
      totalVolumeUSD
      totalVolumeETH
      totalLiquidityUSD
      totalLiquidityETH
      txCount
    }
  }
`
  return gql(queryString)
}

export const GLOBAL_TXNS = gql`
  query transactions {
    transactions(first: 200, orderBy: timestamp, orderDirection: desc) {
      id
      timestamp
      mints {
        pair {
          token0 {
            id
            symbol
          }
          token1 {
            id
            symbol
          }
        }
        to
        liquidity
        amount0
        amount1
        amountUSD
      }
      burns {
        pair {
          token0 {
            id
            symbol
          }
          token1 {
            id
            symbol
          }
        }
        to
        liquidity
        amount0
        amount1
        amountUSD
      }
      swaps {
        pair {
          token0 {
            id
            symbol
          }
          token1 {
            id
            symbol
          }
        }
        amount0In
        amount0Out
        amount1In
        amount1Out
        to
      }
    }
  }
`

export const All_PAIRS = gql`
  query pairs {
    pairs {
      id
    }
  }
`

export const All_TOKENS = gql`
  query tokens {
    tokens {
      id
      symbol
    }
  }
`

export const TOKEN_CHART = gql`
  query tokenDayDatas($tokenAddr: String!) {
    tokenDayDatas(orderBy: date, orderDirection: desc, where: { token: $tokenAddr }) {
      id
      date
      totalLiquidityUSD
      dailyVolumeUSD
      mostLiquidPairs {
        id
        token0 {
          id
          derivedETH
        }
        token1 {
          id
          derivedETH
        }
        token0Balance
        token1Balance
      }
    }
  }
`

export const TOKEN_DATA = (tokenAddress, block) => {
  const queryString =
    `
  query tokens {
    tokens(block: {number:` +
    block +
    `} where: {id:"` +
    tokenAddress +
    `"}) {
      id
      name
      symbol
      decimals
      derivedETH
      tradeVolume
      tradeVolumeUSD
      totalLiquidity
      allPairs(orderBy: reserveUSD, orderDirection: desc) {
        id
        reserveUSD
        volumeUSD
        token0 {
          name
          symbol
          derivedETH
        }
        token1 {
          name
          symbol
          derivedETH
        }
      }
    }
  }
`
  return gql(queryString)
}

export const TOKEN_TXNS = gql`
  fragment comparisonFieldsMint on Mint {
    token0 {
      id
      symbol
    }
    token1 {
      symbol
    }
    timestamp
    amount0
    amount1
    to
    valueETH
    valueUSD
  }
  fragment comparisonFieldsBurn on Burn {
    token0 {
      id
      symbol
    }
    token1 {
      id
      symbol
    }
    timestamp
    amount0
    amount1
    from
    valueETH
    valueUSD
  }
  fragment comparisonFieldsSwap on Swap {
    tokenBought {
      id
      symbol
    }
    tokenSold {
      id
      symbol
    }
    timestamp
    amountBought
    amountSold
    to
    valueETH
    valueUSD
  }
  query($tokenAddr: String!) {
    asToken0Mint: mints(where: { token0: $tokenAddr }, orderBy: timestamp, orderDirection: desc) {
      ...comparisonFieldsMint
    }
    asToken1Mint: mints(where: { token1: $tokenAddr }, orderBy: timestamp, orderDirection: desc) {
      ...comparisonFieldsMint
    }
    asToken0Burn: burns(where: { token0: $tokenAddr }, orderBy: timestamp, orderDirection: desc) {
      ...comparisonFieldsBurn
    }
    asToken1Burn: burns(where: { token1: $tokenAddr }, orderBy: timestamp, orderDirection: desc) {
      ...comparisonFieldsBurn
    }
    asTokenBoughtSwap: swaps(where: { tokenBought: $tokenAddr }, orderBy: timestamp, orderDirection: desc) {
      ...comparisonFieldsSwap
    }
    asTokenSoldSwap: swaps(where: { tokenSold: $tokenAddr }, orderBy: timestamp, orderDirection: desc) {
      ...comparisonFieldsSwap
    }
  }
`
