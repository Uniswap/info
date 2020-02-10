import gql from "graphql-tag"

export const ETH_PRICE = gql`
  query bundles {
    bundles(where: { id: 1 }) {
      id
      ethPrice
    }
  }
`

export const PAIR_CHART = gql`
  query exchangeDayDatas($exchangeAddress: Bytes!) {
    exchangeDayDatas(
      orderBy: date
      orderDirection: asc
      where: { exchangeAddress: $exchangeAddress }
    ) {
      id
      date
      dailyVolumeUSD
      combinedBalanceUSD
    }
  }
`

export const PAIR_TXNS = gql`
  query transactions($pairAddress: Bytes!) {
    mints(
      where: { exchange: $pairAddress }
      orderBy: timestamp
      orderDirection: desc
    ) {
      timestamp
      token0 {
        symbol
      }
      token1 {
        symbol
      }
      amount0
      amount1
      to
      valueETH
      valueUSD
    }
    burns(
      where: { exchange: $pairAddress }
      orderBy: timestamp
      orderDirection: desc
    ) {
      timestamp
      token0 {
        symbol
      }
      token1 {
        symbol
      }
      amount0
      amount1
      from
      valueETH
      valueUSD
    }
    swaps(
      where: { exchange: $pairAddress }
      orderBy: timestamp
      orderDirection: desc
    ) {
      timestamp
      tokenBought {
        symbol
      }
      tokenSold {
        symbol
      }
      amountBought
      amountSold
      to
      valueETH
      valueUSD
    }
  }
`

export const PAIR_HISTORICAL_DATA = gql`
  query exchangeHistoricalDatas($timestamp: Int!, $pairAddress: Bytes!) {
    exchangeHistoricalDatas(
      first: 1
      where: { exchangeAddress: $pairAddress, timestamp_lt: $timestamp }
      orderBy: timestamp
      orderDirection: desc
    ) {
      id
      exchangeAddress
      token0Balance
      token1Balance
      combinedBalanceETH
      combinedBalanceUSD
      totalUniToken
      tradeVolumeETH
      tradeVolumeUSD
      token0Price
      token1Price
    }
  }
`

export const PAIR_DATA = gql`
  query exchanges($exchangeAddress: String!) {
    exchanges(where: { id: $exchangeAddress }) {
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
      token0Balance
      token1Balance
      combinedBalanceETH
      totalUniToken
      tradeVolumeETH
      tradeVolumeUSD
      token0Price
      token1Price
    }
  }
`

export const GLOBAL_HISTORICAL_DATA = gql`
  query uniswapHistoricalDatas($timestamp: Int!) {
    uniswapHistoricalDatas(
      first: 1
      where: { timestamp_lt: $timestamp }
      orderBy: timestamp
      orderDirection: desc
    ) {
      id
      timestamp
      totalVolumeUSD
      totalVolumeETH
      totalLiquidityUSD
      totalLiquidityETH
    }
  }
`

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

export const GLOBAL_DATA = gql`
  query uniswaps {
    uniswaps(where: { id: "1" }) {
      id
      totalVolumeUSD
      totalVolumeETH
      totalLiquidityUSD
      totalLiquidityETH
    }
  }
`

export const GLOBAL_TXNS = gql`
  query transactions {
    mints(first: 200, orderBy: timestamp, orderDirection: desc) {
      timestamp
      token0 {
        symbol
      }
      token1 {
        symbol
      }
      amount0
      amount1
      to
      valueETH
      valueUSD
    }
    burns(first: 200, orderBy: timestamp, orderDirection: desc) {
      timestamp
      token0 {
        symbol
      }
      token1 {
        symbol
      }
      amount0
      amount1
      from
      valueETH
      valueUSD
    }
    swaps(first: 200, orderBy: timestamp, orderDirection: desc) {
      timestamp
      tokenBought {
        symbol
      }
      tokenSold {
        symbol
      }
      amountBought
      amountSold
      to
      valueETH
      valueUSD
    }
  }
`

export const All_PAIRS = gql`
  query exchanges {
    exchanges {
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
    tokenDayDatas(
      orderBy: date
      orderDirection: desc
      where: { token: $tokenAddr }
    ) {
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

export const TOKEN_HISTORICAL_DATA = gql`
  query tokenHistoricalDatas($tokenAddr: String!, $timestamp: Int!) {
    tokenHistoricalDatas(
      first: 1
      orderBy: timestamp
      orderDirection: desc
      where: { token: $tokenAddr, timestamp_lt: $timestamp }
    ) {
      id
      timestamp
      priceETH
      priceUSD
      tradeVolumeUSD
      tradeVolumeETH
      totalLiquidityUSD
      totalLiquidityETH
    }
  }
`

export const TOKEN_DATA = gql`
  query tokens($tokenAddr: String!) {
    tokens(where: { id: $tokenAddr }) {
      id
      name
      symbol
      decimals
      derivedETH
      tradeVolumeUSD
      tradeVolumeETH
      totalLiquidityToken
      totalLiquidityETH
      allPairs(orderBy: combinedBalanceETH, orderDirection: desc) {
        id
        combinedBalanceETH
        tradeVolumeUSD
        tradeVolumeETH
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
    asToken0Mint: mints(
      where: { token0: $tokenAddr }
      orderBy: timestamp
      orderDirection: desc
    ) {
      ...comparisonFieldsMint
    }
    asToken1Mint: mints(
      where: { token1: $tokenAddr }
      orderBy: timestamp
      orderDirection: desc
    ) {
      ...comparisonFieldsMint
    }
    asToken0Burn: burns(
      where: { token0: $tokenAddr }
      orderBy: timestamp
      orderDirection: desc
    ) {
      ...comparisonFieldsBurn
    }
    asToken1Burn: burns(
      where: { token1: $tokenAddr }
      orderBy: timestamp
      orderDirection: desc
    ) {
      ...comparisonFieldsBurn
    }
    asTokenBoughtSwap: swaps(
      where: { tokenBought: $tokenAddr }
      orderBy: timestamp
      orderDirection: desc
    ) {
      ...comparisonFieldsSwap
    }
    asTokenSoldSwap: swaps(
      where: { tokenSold: $tokenAddr }
      orderBy: timestamp
      orderDirection: desc
    ) {
      ...comparisonFieldsSwap
    }
  }
`
