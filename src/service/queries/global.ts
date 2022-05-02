import { gql } from 'apollo-boost'
import { BUNDLE_ID } from '../../constants'

export const SUBGRAPH_HEALTH = gql`
  query Health {
    indexingStatusForCurrentVersion(subgraphName: "whiteswapfi/whiteswap") {
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

export const GET_BLOCK = gql`
  query GetBlock($timestampFrom: Int!, $timestampTo: Int!) {
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

export const GET_BLOCKS = (timestamps: number[]) => {
  let queryString = 'query GetBlocks {'
  queryString += timestamps.map(timestamp => {
    return `t${timestamp}:blocks(first: 1, orderBy: timestamp, orderDirection: desc, where: { timestamp_gt: ${timestamp}, timestamp_lt: ${
      timestamp + 600
    } }) {
      number
    }`
  })
  queryString += '}'
  return gql(queryString)
}
// ! need mapped
export const PRICES_BY_BLOCK = (tokenAddress: string, blocks: BlockHeight[]) => {
  let queryString = 'query GetPriceByBlock {'
  queryString += blocks.map(
    block => `
      t${block.timestamp}:token(id:"${tokenAddress}", block: { number: ${block.number} }) {
        derivedETH
      }
    `
  )
  queryString += ','
  queryString += blocks.map(
    block => `
      b${block.timestamp}: bundle(id:"1", block: { number: ${block.number} }) {
        ethPrice
      }
    `
  )

  queryString += '}'
  return gql(queryString)
}
// ! need mapped
export const SHARE_VALUE = (pairAddress: string, blocks: BlockHeight[]) => {
  let queryString = 'query blocks {'
  queryString += blocks.map(
    block => `
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
    block => `
      b${block.timestamp}: bundle(id:"1", block: { number: ${block.number} }) {
        ethPrice
      }
    `
  )

  queryString += '}'
  return gql(queryString)
}
// ! need mapped
export const ETH_PRICE = gql`
  query EthPrice($block: Block_height) {
    bundles(block: $block, where: { id: ${BUNDLE_ID} }) {
      id
      ethPrice
    }
  }
`
// ! need mapped
export const GLOBAL_CHART = gql`
  query whiteSwapDayDatas($startTime: Int!, $skip: Int!) {
    whiteSwapDayDatas(first: 1000, skip: $skip, where: { date_gt: $startTime }, orderBy: date, orderDirection: asc) {
      date
      dailyVolumeUSD
      totalLiquidityUSD
    }
  }
`
// ! need mapped
export const GLOBAL_DATA = gql`
  query WhiteSwapFactories($block: Block_height, $factoryAddress: String!) {
    whiteSwapFactories(block: $block, where: { id: $factoryAddress }) {
      id
      totalVolumeUSD
      totalVolumeETH
      untrackedVolumeUSD
      totalLiquidityUSD
      totalLiquidityETH
      txCount
      pairCount
    }
  }
`
