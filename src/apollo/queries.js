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
    exchanges(first: 200, orderBy: ethBalance, orderDirection: desc) {
      ethBalance
    }
  }
`

export const GET_BLOCK = gql`
  query blocks($timestampFrom: Int!, $timestampTo: Int!) {
    blocks(
      first: 1
      orderBy: timestamp
      orderDirection: asc
      where: { timestamp_gt: $timestampFrom, timestamp_lt: $timestampTo }
    ) {
      id
      number
      timestamp
    }
  }
`

export const GET_BLOCKS = timestamps => {
  let queryString = 'query blocks {'
  queryString += timestamps.map(
    timestamp => `t${timestamp}:blocks(first: 1, orderBy: timestamp, orderDirection: asc, where: { timestamp_gt: ${timestamp}, timestamp_lt: ${timestamp +
      600} }) {
      number
    }`
  )
  queryString += '}'
  return gql(queryString)
}

export const SHARE_VALUE = (pairAddress, blocks) => {
  let queryString = 'query blocks {'
  queryString += blocks.map(
    block => `t${block.timestamp}:pair(id:"${pairAddress}", block: { number: ${block.number} }) { 
    reserveUSD
    totalSupply 
  }`
  )
  queryString += '}'
  return gql(queryString)
}

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

export const USER = (block, account) => {
  const queryString = `
    query users {
      user(id: "${account}", block: {number: ${block}}) {
        liquidityPositions
      }
    }
`
  return gql(queryString)
}

export const USER_HISTORY__PER_PAIR = gql`
  query snapshots($user: Bytes!, $pair: Bytes!) {
    liquidityPositionSnapshots(where: { user: $user, pair: $pair }, orderBy: timestamp, orderDirection: asc) {
      timestamp
      reserveUSD
      liquidityTokenBalance
      liquidityTokenTotalSupply
      reserve0
      reserve1
      token0PriceUSD
      token1PriceUSD
      pair {
        id
        reserveUSD
        totalSupply
        token0 {
          id
        }
        token1 {
          id
        }
      }
    }
  }
`

export const USER_HISTORY = gql`
  query snapshots($user: Bytes!) {
    liquidityPositionSnapshots(where: { user: $user }) {
      timestamp
      reserveUSD
      liquidityTokenBalance
      liquidityTokenTotalSupply
      pair {
        id
      }
    }
  }
`

export const USER_POSITIONS = gql`
  query liquidityPositions($user: Bytes!) {
    liquidityPositions(where: { user: $user }) {
      pair {
        id
        reserve0
        reserve1
        reserveUSD
        token0 {
          id
          symbol
          derivedETH
        }
        token1 {
          id
          symbol
          derivedETH
        }
        totalSupply
      }
      liquidityTokenBalance
    }
  }
`

export const USER_TRANSACTIONS = gql`
  query transactions($user: Bytes!) {
    mints(orderBy: timestamp, orderDirection: desc, where: { to: $user }) {
      id
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
    burns(orderBy: timestamp, orderDirection: desc, where: { sender: $user }) {
      id
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
    swaps(orderBy: timestamp, orderDirection: desc, where: { to: $user }) {
      id
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
      reserveUSD
    }
  }
`

export const PAIR_DAY_DATA = gql`
  query pairDayDatas($pairAddress: Bytes!, $date: Int!) {
    pairDayDatas(first: 1, orderBy: date, orderDirection: desc, where: { pairAddress: $pairAddress, date_lt: $date }) {
      id
      date
      dailyVolumeToken0
      dailyVolumeToken1
      dailyVolumeUSD
      totalSupply
      reserveUSD
    }
  }
`

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

export const GLOBAL_TXNS = gql`
  query transactions {
    transactions(first: 60, orderBy: timestamp, orderDirection: desc) {
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
        sender
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
        trackedReserveETH
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
        trackedReserveETH
        volumeUSD
      }
    }`

  return gql(queryString)
}

export const PAIRS_DYNAMIC_BULK = (block, pairs) => {
  let pairsString = `[`
  pairs.map(pair => {
    return (pairsString += `"${pair}"`)
  })
  pairsString += ']'
  let queryString = `
  query pairs {
    pairs(where: {id_in: ${pairsString}}, block: {number: ${block}}, orderBy: trackedReserveETH, orderDirection: desc) {
      id
      txCount
      reserveUSD
      trackedReserveETH
      volumeUSD
    }
  }
  `
  return gql(queryString)
}

export const PAIRS_BULK = gql`
  query pairs($allPairs: [Bytes]!) {
    pairs(where: { id_in: $allPairs }, orderBy: trackedReserveETH, orderDirection: desc) {
      id
      txCount
      token0 {
        id
        symbol
        name
        derivedETH
      }
      token1 {
        id
        symbol
        name
        derivedETH
      }
      reserve0
      reserve1
      token0Price
      token1Price
      reserveUSD
      trackedReserveETH
      volumeUSD
      createdAtBlockNumber
    }
  }
`

export const ALL_TOKENS = gql`
  query tokens($skip: Int!) {
    tokens(first: 1000, skip: $skip) {
      id
      name
      symbol
    }
  }
`

export const ALL_PAIRS = gql`
  query pairs($skip: Int!) {
    pairs(first: 1000, skip: $skip) {
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
    pairs(first: 200, orderBy: trackedReserveETH, orderDirection: desc) {
      id
      txCount
      token0 {
        id
        symbol
        name
        derivedETH
      }
      token1 {
        id
        symbol
        name
        derivedETH
      }
      reserve0
      reserve1
      trackedReserveETH
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
    pairs(block: {number: ${block}} first: 200, orderBy: trackedReserveETH, orderDirection: desc) {
      id
      txCount
      reserveUSD
      trackedReserveETH
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

const TokenFields = `
  fragment TokenFields on Token {
    id
    name
    symbol
    derivedETH
    tradeVolume
    tradeVolumeUSD
    totalLiquidity
    txCount
  }
`

export const TOKENS_CURRENT = gql`
  ${TokenFields}
  query tokens {
    tokens(first: 200, orderBy: tradeVolumeUSD, orderDirection: desc) {
      ...TokenFields
    }
  }
`

export const TOKENS_DYNAMIC = block => {
  const queryString = `
    ${TokenFields}
    query tokens {
      tokens(block: {number: ${block}} first: 200, orderBy: tradeVolumeUSD, orderDirection: desc) {
        ...TokenFields
      }
    }
  `
  return gql(queryString)
}

export const TOKEN_DATA = (tokenAddress, block) => {
  const queryString = `
    ${TokenFields}
    query tokens {
      tokens(${block ? `block : {number ${block}}` : ``} where: {id:"${tokenAddress}"}) {
        ...TokenFields
      }
      pairs0: pairs(where: {token0: "${tokenAddress}"}){
        id
      }
      pairs1: pairs(where: {token1: "${tokenAddress}"}){
        id
      }
    }
  `
  return gql(queryString)
}

export const FILTERED_TRANSACTIONS = gql`
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
      sender
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
