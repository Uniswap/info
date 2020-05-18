import gql from 'graphql-tag'
import { FACTORY_ADDRESS, BUNDLE_ID } from '../constants'

export const UNISWAP_GLOBALS_QUERY = gql`
  query totals {
    uniswap(id: "1") {
      totalVolumeUSD
      totalVolumeInEth
      totalLiquidityUSD
      totalLiquidityInEth
      txCount
      exchangeCount
    }
  }
`

export const UNISWAP_GLOBALS_24HOURS_AGO_QUERY = gql`
  query uniswapHistoricalDatas($date: Int!) {
    uniswapHistoricalDatas(where: { timestamp_lt: $date }, first: 1, orderBy: timestamp, orderDirection: desc) {
      totalVolumeInEth
      totalVolumeUSD
      totalLiquidityInEth
      totalLiquidityUSD
      txCount
      timestamp
    }
  }
`

export const GET_BLOCK = gql`
  query blocks($timestamp: Int!) {
    blocks(first: 1, orderBy: timestamp, orderDirection: asc, where: { timestamp_gt: $timestamp }) {
      id
      number
      timestamp
    }
  }
`

export const ETH_PRICE = block => {
  const queryString = block
    ? `
    query bundles {
      bundles(where: { id: ${BUNDLE_ID} } block: {number: ${block}}) {
        id
        ethPrice
      }
    }
  `
    : ` query bundles {
      bundles(where: { id: ${BUNDLE_ID} }) {
        id
        ethPrice
      }
    }
  `
  return gql(queryString)
}

export const PAIR_CHART = gql`
  query pairDayDatas($pairAddress: Bytes!) {
    pairDayDatas(orderBy: date, orderDirection: asc, where: { pairAddress: $pairAddress }) {
      id
      date
      dailyVolumeToken0
      dailyVolumeToken1
      dailyVolumeUSD
      reserveUSD
    }
  }
`

export const PAIR_TXNS = gql`
  query transactions($pairAddress: Bytes!) {
    mints(orderBy: timestamp, orderDirection: desc, where: { pair: $pairAddress }) {
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
    burns(orderBy: timestamp, orderDirection: desc, where: { pair: $pairAddress }) {
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
    swaps(orderBy: timestamp, orderDirection: desc, where: { pair: $pairAddress }) {
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
  }
`

export const PAIR_DATA = (pairAddress, block) => {
  const queryString = block
    ? `
    query pairs {
      pairs(block: {number: ${block} 
      } where: { id: "${pairAddress}"} ) {
        id
        txCount
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
        reserveETH
        volumeUSD
      }
    }`
    : ` query pairs {
      pairs( where: { id: "` +
      pairAddress +
      `"}) {
        id
        txCount
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
        volumeUSD
      }
    }`

  return gql(queryString)
}

export const GLOBAL_CHART = gql`
  query uniswapDayDatas($startTime: Int!) {
    uniswapDayDatas(where: { date_gt: $startTime }, orderBy: date, orderDirection: asc) {
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
  const queryString = block
    ? ` query uniswapFactories {
      uniswapFactories(block:   
       {number: ` +
      block +
      `}` +
      ` where: { id: "${FACTORY_ADDRESS}" }) {
        id
        totalVolumeUSD
        totalVolumeETH
        totalLiquidityUSD
        totalLiquidityETH
        txCount
      }
    }`
    : `query uniswapFactories {
      uniswapFactories(
        where: { id: "${FACTORY_ADDRESS}" }) {
        id
        totalVolumeUSD
        totalVolumeETH
        totalLiquidityUSD
        totalLiquidityETH
        txCount
      }
    }`

  return gql(queryString)
}

export const GLOBAL_TXNS = gql`
  query transactions {
    transactions(first: 200, orderBy: timestamp, orderDirection: desc) {
      mints {
        transaction {
          id
          timestamp
        }
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
        transaction {
          id
          timestamp
        }
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
        transaction {
          id
          timestamp
        }
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
        amountUSD
        to
      }
    }
  }
`

export const All_PAIRS = gql`
  query pairs {
    pairs(orderBy: reserveUSD, orderDirection: desc) {
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
    tokenDayDatas(orderBy: date, orderDirection: asc, where: { token: $tokenAddr }) {
      id
      date
      priceUSD
      totalLiquidityToken
      totalLiquidityUSD
      totalLiquidityETH
      dailyVolumeETH
      dailyVolumeToken
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
      }
    }
  }
`

export const TOKEN_DATA = (tokenAddress, block) => {
  const queryString = block
    ? `
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
      txCount
      allPairs(orderBy: reserveUSD, orderDirection: desc) {
        id
        reserveUSD
        volumeUSD
        token0 {
          id
          name
          symbol
          derivedETH
        }
        token1 {
          id
          name
          symbol
          derivedETH
        }
      }
    }
  }
`
    : ` query tokens {
  tokens( where: {id:"` +
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
    txCount
    allPairs(orderBy: reserveUSD, orderDirection: desc) {
      id
      reserveUSD
      volumeUSD
      token0 {
        id
        name
        symbol
        derivedETH
      }
      token1 {
        id
        name
        symbol
        derivedETH
      }
    }
  }
}`
  return gql(queryString)
}

export const TOKEN_TXNS = gql`
  query($allPairs: [Bytes]!) {
    mints(where: { pair_in: $allPairs }, orderBy: timestamp, orderDirection: desc) {
      transaction {
        id
        timestamp
      }
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
    burns(where: { pair_in: $allPairs }, orderBy: timestamp, orderDirection: desc) {
      transaction {
        id
        timestamp
      }
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
    swaps(where: { pair_in: $allPairs }, orderBy: timestamp, orderDirection: desc) {
      transaction {
        id
        timestamp
      }
      id
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
      amountUSD
      to
    }
  }
`
