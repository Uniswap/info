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

export const V1_TOP_PAIRS = gql`
  query exchanges {
    exchanges(first: 200, orderBy: ethBalance, orderDirection: desc) {
      ethBalance
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
