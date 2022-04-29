import { gql } from 'apollo-boost'
import { PAIR_DETAILS, PAIR_FIELDS } from 'service/fragments'

export const HOURLY_PAIR_RATES = (pairAddress: string, blocks: BlockHeight[]) => {
  let queryString = 'query HourlyPairRates {'
  queryString += blocks.map(
    block => `
      t${block.timestamp}: pair(id:"${pairAddress}", block: { number: ${block.number} }) {
        token0Price
        token1Price
      }
    `
  )

  queryString += '}'
  return gql(queryString)
}

export const PAIR_CHART = gql`
  query PairChart($pairAddress: Bytes!, $skip: Int!) {
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

export const PAIR_DAY_DATA_BULK = gql`
  query PairDayDataBulk($pairs: [String]!, $startTimestamp: Int!) {
    pairDayDatas(
      first: 1000
      orderBy: date
      orderDirection: asc
      where: { pairAddress_in: $pairs, date_gt: $startTimestamp }
    ) {
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

export const PAIR_SEARCH = gql`
  ${PAIR_DETAILS}
  query PairSearch($tokens: [Bytes]!, $id: String) {
    as0: pairs(where: { token0_in: $tokens }) {
      ...PairDetails
    }
    as1: pairs(where: { token1_in: $tokens }) {
      ...PairDetails
    }
    asAddress: pairs(where: { id: $id }) {
      ...PairDetails
    }
  }
`

export const PAIRS_CURRENT = gql`
  query CurrentPairs {
    pairs(first: 200, orderBy: trackedReserveETH, orderDirection: desc) {
      id
    }
  }
`
// ! need mapped
export const PAIR_DATA = gql`
  ${PAIR_FIELDS}
  query PairData($pairAddress: String!, $block: Block_height) {
    pairs(block: $block, where: { id: $pairAddress }) {
      ...PairFields
    }
  }
`
// ! need mapped
export const PAIRS_BULK = gql`
  ${PAIR_FIELDS}
  query PairsBulk($allPairs: [Bytes]!) {
    pairs(where: { id_in: $allPairs }, orderBy: trackedReserveETH, orderDirection: desc) {
      ...PairFields
    }
  }
`

// ! need mapped
export const PAIRS_HISTORICAL_BULK = gql`
  query PairsHistoricalBulk($pairs: [String]!, $block: Block_height) {
    pairs(first: 200, where: { id_in: $pairs }, block: $block, orderBy: trackedReserveETH, orderDirection: desc) {
      id
      reserveUSD
      trackedReserveETH
      volumeUSD
      untrackedVolumeUSD
    }
  }
`
