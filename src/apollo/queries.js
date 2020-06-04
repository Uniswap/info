import gql from 'graphql-tag'
import { FACTORY_ADDRESS, BUNDLE_ID } from '../constants'

export const V1_DATA_QUERY = gql`
  query uniswap($date: Int!, $date2: Int!) {
    current: uniswap(id: "1") {
      totalVolumeUSD
      totalLiquidityUSD
      txCount
    }
    oneDay: uniswapHistoricalDatas(where: { timestamp_lt: $date }, first: 1, orderBy: timestamp, orderDirection: desc) {
      totalVolumeUSD
      totalLiquidityUSD
      txCount
    }
    twoDay: uniswapHistoricalDatas(
      where: { timestamp_lt: $date2 }
      first: 1
      orderBy: timestamp
      orderDirection: desc
    ) {
      totalVolumeUSD
      totalLiquidityUSD
      txCount
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
       {number: ${block}} 
       where: { id: "${FACTORY_ADDRESS}" }) {
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

export const GLOBAL_SUBSCRIPTION = gql`
  subscription onUniswapFactories {
    uniswapFactories {
      id
      totalVolumeUSD
      totalVolumeETH
      totalLiquidityUSD
      totalLiquidityETH
      txCount
    }
  }
`

export const GLOBAL_TXNS = gql`
  query transactions {
    transactions(first: 100, orderBy: timestamp, orderDirection: desc) {
      mints(orderBy: timestamp, orderDirection: desc) {
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
      burns(orderBy: timestamp, orderDirection: desc) {
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
      swaps(orderBy: timestamp, orderDirection: desc) {
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

export const PAIRS_DYNAMIC_BULK = (block, pairs) => {
  let pairsString = `[`
  pairs.map(pair => {
    return (pairsString += `"${pair}"`)
  })
  pairsString += ']'
  let queryString = `
  query pairs {
    pairs(where: {id_in: ${pairsString}}, block: {number: ${block}}, orderBy: reserveUSD, orderDirection: desc) {
      id
      txCount
      reserveUSD
      volumeUSD
    }
  }
  `
  return gql(queryString)
}

export const PAIRS_BULK = gql`
  query pairs($allPairs: [Bytes]!) {
    pairs(where: { id_in: $allPairs }, orderBy: reserveUSD, orderDirection: desc) {
      id
      txCount
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
      token0Price
      token1Price
      reserveUSD
      volumeUSD
      createdAtBlockNumber
    }
  }
`

export const ALL_TOKENS = gql`
  query tokens {
    tokens(first: 1000) {
      id
      name
      symbol
    }
  }
`

export const ALL_PAIRS = gql`
  query pairs {
    pairs(first: 1000) {
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
  }
`

export const PAIRS_CURRENT = gql`
  query pairs {
    pairs(first: 200, orderBy: reserveUSD, orderDirection: desc) {
      id
      txCount
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
      token0Price
      token1Price
      reserveUSD
      volumeUSD
      createdAtBlockNumber
    }
  }
`

export const PAIRS_DYNAMIC = block => {
  let queryString = `
  query pairs {
    pairs(block: {number: ${block}} first: 200, orderBy: reserveUSD, orderDirection: desc) {
      id
      txCount
      reserveUSD
      volumeUSD
    }
  }
  `
  return gql(queryString)
}

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

export const TOKENS_CURRENT = gql`
  query tokens {
    tokens(first: 200, orderBy: tradeVolumeUSD, orderDirection: desc) {
      id
      name
      symbol
      derivedETH
      tradeVolume
      tradeVolumeUSD
      totalLiquidity
      txCount
      allPairs(first: 200, orderBy: reserveUSD, orderDirection: desc) {
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

export const TOKENS_DYNAMIC = block => {
  const queryString = `
    query tokens {
      tokens(block: {number: ${block}} first: 200, orderBy: tradeVolumeUSD, orderDirection: desc) {
        id
        name
        symbol
        derivedETH
        tradeVolume
        tradeVolumeUSD
        totalLiquidity
        txCount
      }
    }
  `
  return gql(queryString)
}

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
      allPairs(first: 200, orderBy: reserveUSD, orderDirection: desc) {
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
    allPairs(first: 200, orderBy: reserveUSD, orderDirection: desc) {
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
    mints(first: 30, where: { pair_in: $allPairs }, orderBy: timestamp, orderDirection: desc) {
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
    burns(first: 30, where: { pair_in: $allPairs }, orderBy: timestamp, orderDirection: desc) {
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
    swaps(first: 30, where: { pair_in: $allPairs }, orderBy: timestamp, orderDirection: desc) {
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
