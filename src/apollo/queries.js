import gql from 'graphql-tag'
import { FACTORY_ADDRESS, BUNDLE_ID } from '../constants'

export const SUBGRAPH_HEALTH = gql`
  query health {
    indexingStatusForCurrentVersion(subgraphName: "uniswap/uniswap-v2") {
      synced
      health
      chains {
        chainHeadBlock {
          number
        }
        latestBlock {
          number
        }
      }
    }
  }
`

// export const V1_DATA_QUERY = gql`
//   query uniswap($date: Int!, $date2: Int!) {
//     current: uniswap(id: "1") {
//       totalVolumeUSD
//       totalLiquidityUSD
//       txCount
//     }
//     oneDay: uniswapHistoricalDatas(where: { timestamp_lt: $date }, first: 1, orderBy: timestamp, orderDirection: desc) {
//       totalVolumeUSD
//       totalLiquidityUSD
//       txCount
//     }
//     twoDay: uniswapHistoricalDatas(
//       where: { timestamp_lt: $date2 }
//       first: 1
//       orderBy: timestamp
//       orderDirection: desc
//     ) {
//       totalVolumeUSD
//       totalLiquidityUSD
//       txCount
//     }
//     exchanges(first: 200, orderBy: ethBalance, orderDirection: desc) {
//       ethBalance
//     }
//   }
// `

// export const GET_BLOCK = gql`
//   query blocks($timestampFrom: Int!, $timestampTo: Int!) {
//     blocks(
//       first: 1
//       orderBy: timestamp
//       orderDirection: asc
//       where: { timestamp_gt: $timestampFrom, timestamp_lt: $timestampTo }
//     ) {
//       id
//       number
//       timestamp
//     }
//   }
// `

// export const GET_BLOCKS = (timestamps) => {
//   let queryString = 'query blocks {'
//   queryString += timestamps.map((timestamp) => {
//     return `t${timestamp}:blocks(first: 1, orderBy: timestamp, orderDirection: desc, where: { timestamp_gt: ${timestamp}, timestamp_lt: ${
//       timestamp + 600
//     } }) {
//       number
//     }`
//   })
//   queryString += '}'
//   return gql(queryString)
// }

// export const POSITIONS_BY_BLOCK = (account, blocks) => {
//   let queryString = 'query blocks {'
//   queryString += blocks.map(
//     (block) => `
//       t${block.timestamp}:liquidityPositions(where: {user: "${account}"}, block: { number: ${block.number} }) {
//         liquidityTokenBalance
//         pair  {
//           id
//           totalSupply
//           reserveUSD
//         }
//       }
//     `
//   )
//   queryString += '}'
//   return gql(queryString)
// }

// export const PRICES_BY_BLOCK = (tokenAddress, blocks) => {
//   let queryString = 'query blocks {'
//   queryString += blocks.map(
//     (block) => `
//       t${block.timestamp}:token(id:"${tokenAddress}", block: { number: ${block.number} }) {
//         derivedETH
//       }
//     `
//   )
//   queryString += ','
//   queryString += blocks.map(
//     (block) => `
//       b${block.timestamp}: bundle(id:"1", block: { number: ${block.number} }) {
//         ethPrice
//       }
//     `
//   )

//   queryString += '}'
//   return gql(queryString)
// }

//changed query
// export const TOP_LPS_PER_PAIRS = gql`
//   query liquiditypositions($pair: String!) {
//     liquiditypositions(first: 10, id: $pair) {
//       user {
//         id
//       }
//       pair {
//         id
//       }
//       liquidityTokenBalance
//     }
//   }
// `
export const TOP_LPS_PER_PAIRS = gql`
  query lps($pair: Bytes!) {
    liquidityPositions(where: { pair: $pair }, orderBy: liquidityTokenBalance, orderDirection: desc, first: 10) {
      user {
        id
      }
      pair {
        id
      }
      liquidityTokenBalance
    }
  }
`
export const HOURLY_PAIR_RATES = (pairAddress, blocks) => {
  let queryString = 'query blocks {'
  queryString += blocks.map(
    (block) => `
      t${block.timestamp}: pair(id:"${pairAddress}", block: { number: ${block.number} }) {
        token0Price
        token1Price
      }
    `
  )

  queryString += '}'
  return gql(queryString)
}

export const SHARE_VALUE = (pairAddress, blocks) => {
  let queryString = 'query blocks {'
  queryString += blocks.map(
    (block) => `
      t${block.timestamp}:pair(id:"${pairAddress}", block: { number: ${block.number} }) {
        reserve0
        reserve1
        reserveUSD
        totalSupply
        token0{
          derivedETH
        }
        token1{
          derivedETH
        }
      }
    `
  )
  queryString += ','
  queryString += blocks.map(
    (block) => `
      b${block.timestamp}: bundle(id:"1", block: { number: ${block.number} }) {
        ethPrice
      }
    `
  )

  queryString += '}'
  return gql(queryString)
}
//changed query
// export const ETH_PRICE = (block) => {
//   const queryString = block
//     ? `
//     query bundle {
//       bundle(id: ${BUNDLE_ID}) {
//         id
//         ethPrice
//       }
//     }
//   `
//     : ` query bundle {
//       bundle(id: ${BUNDLE_ID}) {
//         id
//         ethPrice
//       }
//     }
//   `
//   return gql(queryString)
// }

export const ETH_PRICE = (block) => {
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
//changed query
// export const USER = (block, account) => {
//   const queryString = `
//     query user {
//       user(id: "${account}") {
//         liquidityPositions
//       }
//     }
// `
//   return gql(queryString)
// }

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

//changed query
// export const USER_MINTS_BUNRS_PER_PAIR = gql`
//   query events($user: String!, $pair: String!) {
//     mints(to: $user, pair: $pair) {
//       amountUSD
//       amount0
//       amount1
//       timestamp
//       pair {
//         token0 {
//           id
//         }
//         token1 {
//           id
//         }
//       }
//     }
//     burns(sender: $user, pair: $pair) {
//       amountUSD
//       amount0
//       amount1
//       timestamp
//       pair {
//         token0 {
//           id
//         }
//         token1 {
//           id
//         }
//       }
//     }
//   }
// `
export const USER_MINTS_BUNRS_PER_PAIR = gql`
  query events($user: Bytes!, $pair: Bytes!) {
    mints(where: { to: $user, pair: $pair }) {
      amountUSD
      amount0
      amount1
      timestamp
      pair {
        token0 {
          id
        }
        token1 {
          id
        }
      }
    }
    burns(where: { sender: $user, pair: $pair }) {
      amountUSD
      amount0
      amount1
      timestamp
      pair {
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

// export const FIRST_SNAPSHOT = gql`
//   query snapshots($user: Bytes!) {
//     liquidityPositionSnapshots(first: 1, where: { user: $user }, orderBy: timestamp, orderDirection: asc) {
//       timestamp
//     }
//   }
// `

//changed query
// export const USER_HISTORY = gql`
//   query snapshots($user: String!, $skip: Int!) {
//     liquiditypositionsnapshots(first: 1000, skip: $skip, user: $user) {
//       timestamp
//       reserveUSD
//       liquidityTokenBalance
//       liquidityTokenTotalSupply
//       reserve0
//       reserve1
//       token0PriceUSD
//       token1PriceUSD
//       pair {
//         id
//         reserve0
//         reserve1
//         reserveUSD
//         token0 {
//           id
//         }
//         token1 {
//           id
//         }
//       }
//     }
//   }
// `

export const USER_HISTORY = gql`
  query snapshots($user: Bytes!, $skip: Int!) {
    liquidityPositionSnapshots(first: 1000, skip: $skip, where: { user: $user }) {
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
        reserve0
        reserve1
        reserveUSD
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
// export const USER_POSITIONS = gql`
//   query liquidityPositionsagainstuserId($user: String!) {
//     liquidityPositionsagainstuserId(user: $user) {
//       pair {
//         id
//         reserve0
//         reserve1
//         reserveUSD
//         token0 {
//           id
//           symbol
//           derivedETH
//         }
//         token1 {
//           id
//           symbol
//           derivedETH
//         }
//         totalSupply
//       }
//       liquidityTokenBalance
//     }
//   }
// `
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
// export const USER_TRANSACTIONS = gql`
//   query transactions($user: String!) {
//     mints(to: $user) {
//       id
//       transaction {
//         id
//         timestamp
//       }
//       pair {
//         id
//         token0 {
//           id
//           symbol
//         }
//         token1 {
//           id
//           symbol
//         }
//       }
//       to
//       liquidity
//       amount0
//       amount1
//       amountUSD
//     }
//     burns(sender: $user) {
//       id
//       transaction {
//         id
//         timestamp
//       }
//       pair {
//         id
//         token0 {
//           symbol
//         }
//         token1 {
//           symbol
//         }
//       }
//       sender
//       to
//       liquidity
//       amount0
//       amount1
//       amountUSD
//     }
//     swaps(to: $user) {
//       id
//       transaction {
//         id
//         timestamp
//       }
//       pair {
//         token0 {
//           symbol
//         }
//         token1 {
//           symbol
//         }
//       }
//       amount0In
//       amount0Out
//       amount1In
//       amount1Out
//       amountUSD
//       to
//     }
//   }
// `
export const USER_TRANSACTIONS = gql`
  query transactions($user: Bytes!) {
    mints(orderBy: timestamp, orderDirection: desc, where: { to: $user }) {
      id
      transaction {
        id
        timestamp
      }
      pair {
        id
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
        id
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
  query pairDayDatas($pairAddress: Bytes!, $skip: Int!) {
    pairDayDatas(first: 1000, skip: $skip, orderBy: date, orderDirection: asc, where: { pairAddress: $pairAddress }) {
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

export const PAIR_DAY_DATA_BULK = (pairs, startTimestamp) => {
  let pairsString = `[`
  pairs.map((pair) => {
    return (pairsString += `"${pair}"`)
  })
  pairsString += ']'
  const queryString = `
    query days {
      pairDayDatas(first: 1000, orderBy: date, orderDirection: asc, where: { pairAddress_in: ${pairsString}, date_gt: ${startTimestamp} }) {
        id
        pairAddress
        date
        dailyVolumeToken0
        dailyVolumeToken1
        dailyVolumeUSD
        totalSupply
        reserveUSD
      }
    } 
`
  return gql(queryString)
}

export const GLOBAL_CHART = gql`
  query uniswapDayDatas($startTime: Int!, $skip: Int!) {
    uniswapDayDatas(first: 1000, skip: $skip, where: { date_gt: $startTime }, orderBy: date, orderDirection: asc) {
      id
      date
      totalVolumeUSD
      dailyVolumeUSD
      dailyVolumeETH
      totalLiquidityUSD
      totalLiquidityETH
    }
  }
`

export const GLOBAL_DATA = (block) => {
  const queryString = ` query uniswapFactories {
      uniswapFactories(
       ${block ? `block: { number: ${block}}` : ``} 
       where: { id: "${FACTORY_ADDRESS}" }) {
        id
        totalVolumeUSD
        totalVolumeETH
        untrackedVolumeUSD
        totalLiquidityUSD
        totalLiquidityETH
        txCount
        pairCount
      }
    }`
  return gql(queryString)
}

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

export const ALL_TOKENS = gql`
  query tokens($skip: Int!) {
    tokens(first: 500, skip: $skip) {
      id
      name
      symbol
      totalLiquidity
    }
  }
`
//orderBy: totalLiquidity, orderDirection: desc
export const TOKEN_SEARCH = gql`
  query tokens($value: String, $id: String) {
    asSymbol: tokens(where: { symbol_contains: $value }) {
      id
      symbol
      name
      totalLiquidity
    }
    asName: tokens(where: { name_contains: $value }) {
      id
      symbol
      name
      totalLiquidity
    }
    asAddress: tokens(where: { id: $id }) {
      id
      symbol
      name
      totalLiquidity
    }
  }
`

export const PAIR_SEARCH = gql`
  query pairs($tokens: [Bytes]!, $id: String) {
    as0: pairs(where: { token0_in: $tokens }) {
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
    as1: pairs(where: { token1_in: $tokens }) {
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
    asAddress: pairs(where: { id: $id }) {
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
//orderBy: trackedReserveETH, orderDirection: desc
export const ALL_PAIRS = gql`
  query pairs($skip: Int!) {
    pairs(first: 500, skip: $skip) {
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

const PairFields = `
  fragment PairFields on Pair {
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
    totalSupply
    trackedReserveETH
    reserveETH
    volumeUSD
    untrackedVolumeUSD
    token0Price
    token1Price
    createdAtTimestamp
  }
`
//orderBy: reserveUSD, orderDirection: desc
export const PAIRS_CURRENT = gql`
  query pairs {
    pairs(first: 200) {
      id
    }
  }
`

export const PAIR_DATA = (pairAddress, block) => {
  const queryString = `
    ${PairFields}
    query pairs {
      pairs(${block ? `block: {number: ${block}}` : ``} where: { id: "${pairAddress}"} ) {
        ...PairFields
      }
    }`
  return gql(queryString)
}

// export const PAIR_DATA = (pairAddress, block) => {
//   const queryString = `
//     ${PairFields}
//     query pair ($id: String!){
//       pair(id: "${pairAddress}" ) {
//         ...PairFields
//       }
//     }`
//   return gql(queryString)
// }
// export const MINING_POSITIONS = (account) => {
//   const queryString = `
//     query users {
//       user(id: "${account}") {
//         miningPosition {
//           id
//           user {
//             id
//           }
//           miningPool {
//               pair {
//                 id
//                 token0
//                 token1
//               }
//           }
//           balance
//         }
//       }
//     }
// `
//   return gql(queryString)
// }

//orderBy: trackedReserveETH, orderDirection: desc
export const PAIRS_BULK = gql`
  ${PairFields}
  query pairs($allPairs: [Bytes]!) {
    pairs(first: 500, where: { id_in: $allPairs }, orderBy: trackedReserveETH, orderDirection: desc) {
      ...PairFields
    }
  }
`

export const PAIRS_HISTORICAL_BULK = (block, pairs) => {
  let pairsString = `[`
  pairs.map((pair) => {
    return (pairsString += `"${pair}"`)
  })
  pairsString += ']'
  let queryString = `
  query pairs {
    pairs(first: 200, where: {id_in: ${pairsString}}, block: {number: ${block}}, orderBy: trackedReserveETH, orderDirection: desc) {
      id
      reserveUSD
      trackedReserveETH
      volumeUSD
      untrackedVolumeUSD
    }
  }
  `
  return gql(queryString)
}
// export const TOKEN_CHART = gql`
//   query tokendaydatas($tokenAddr: String!, $skip: Int!) {
//     tokendaydatas(first: 1000, skip: $skip, id: $tokenAddr) {
//       id
//       date
//       priceUSD
//       totalLiquidityToken
//       totalLiquidityUSD
//       totalLiquidityETH
//       dailyVolumeETH
//       dailyVolumeToken
//       dailyVolumeUSD
//     }
//   }
// `
export const TOKEN_CHART = gql`
  query tokenDayDatas($tokenAddr: String!, $skip: Int!) {
    tokenDayDatas(first: 1000, skip: $skip, orderBy: date, orderDirection: asc, where: { token: $tokenAddr }) {
      id
      date
      priceUSD
      totalLiquidityToken
      totalLiquidityUSD
      totalLiquidityETH
      dailyVolumeETH
      dailyVolumeToken
      dailyVolumeUSD
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
    untrackedVolumeUSD
    totalLiquidity
    txCount
  }
`
// export const TOKEN_TOP_DAY_DATAS = gql`
//   query tokendaydatasbydate($date: Int) {
//     tokendaydatasbydate(first: 50, date: $date) {
//       id
//       date
//     }
//   }
// `

// used for getting top tokens by daily volume
export const TOKEN_TOP_DAY_DATAS = gql`
  query tokenDayDatas($date: Int) {
    tokenDayDatas(first: 50, orderBy: totalLiquidityUSD, orderDirection: desc, where: { date_gt: $date }) {
      id
      date
    }
  }
`

// export const TOKENS_BULK = gql`
//   ${TokenFields}
//   query tokens($tokenAddresses: [Bytes]!) {
//     pairs(where: { id_in: $tokenAddresses }) {
//       ...TokenFields
//     }
//   }
// `

export const TOKENS_HISTORICAL_BULK = (tokens, block) => {
  let tokenString = `[`
  tokens.map((token) => {
    return (tokenString += `"${token}",`)
  })
  tokenString += ']'
  let queryString = `
  query tokens {
    tokens(first: 50, where: {id_in: ${tokenString}}, ${block ? 'block: {number: ' + block + '}' : ''}  ) {
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
  }
  `
  return gql(queryString)
}

// export const TOKENS_HISTORICAL_BULK = (tokens, block) => {
//   let tokenString = `[`
//   tokens.map((token) => {
//     return (tokenString += `"${token}",`)
//   })
//   tokenString += ']'
//   let queryString = `
//   query tokens {
//     tokens(first: 50, where: {id_in: ${tokenString}}, ${block ? 'block: {number: ' + block + '}' : ''}  ) {
//       id
//       name
//       symbol
//       derivedETH
//       tradeVolume
//       tradeVolumeUSD
//       untrackedVolumeUSD
//       totalLiquidity
//       txCount
//     }
//   }
//   `
//   return gql(queryString)
// }

// export const TOKENS_CURRENT = gql`
//   ${TokenFields}
//   query tokens {
//     tokens(first: 200, orderBy: tradeVolumeUSD, orderDirection: desc) {
//       ...TokenFields
//     }
//   }
// `

// export const TOKENS_DYNAMIC = (block) => {
//   const queryString = `
//     ${TokenFields}
//     query tokens {
//       tokens(block: {number: ${block}} first: 200, orderBy: tradeVolumeUSD, orderDirection: desc) {
//         ...TokenFields
//       }
//     }
//   `
//   return gql(queryString)
// }

export const TOKEN_DATA = (tokenAddress, block) => {
  const queryString = `
    ${TokenFields}
    query tokens {
      tokens(${block ? `block : {number: ${block}}` : ``} where: {id:"${tokenAddress}"}) {
        ...TokenFields
      }
      pairs0: pairs(where: {token0: "${tokenAddress}"}, first: 50, orderBy: reserveUSD, orderDirection: desc){
        id
      }
      pairs1: pairs(where: {token1: "${tokenAddress}"}, first: 50, orderBy: reserveUSD, orderDirection: desc){
        id
      }
    }
  `
  return gql(queryString)
}

export const FILTERED_TRANSACTIONS = gql`
  query ($allPairs: [Bytes]!) {
    mints(first: 20, where: { pair_in: $allPairs }, orderBy: timestamp, orderDirection: desc) {
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
    burns(first: 20, where: { pair_in: $allPairs }, orderBy: timestamp, orderDirection: desc) {
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
