import { BURN_DETAILS, MINT_DETAILS, PAIR_DETAILS, PAIR_FIELDS, SWAP_DETAILS } from 'api/fragments'
import { Block } from 'api/types'
import { gql } from 'apollo-boost'

export const HOURLY_PAIR_RATES = (pairAddress: string, blocks: Block[]) => {
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

export const PAIR_DAY_DATA_BULK = (pairs: string[], startTimestamp: number) => {
  let pairsString = `[`
  pairs.map(pair => {
    return (pairsString += `"${pair}"`)
  })
  pairsString += ']'
  const queryString = `
    query PairDayDataBulk {
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

export const ALL_PAIRS = gql`
  ${PAIR_DETAILS}
  query AllPairs($skip: Int!) {
    pairs(first: 500, skip: $skip, orderBy: trackedReserveETH, orderDirection: desc) {
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

export const PAIR_DATA = (pairAddress: string, block?: number) => {
  const queryString = `
    ${PAIR_FIELDS}
    query PairData {
      pairs(${block ? `block: {number: ${block}}` : ``} where: { id: "${pairAddress}"} ) {
        ...PairFields
      }
    }`
  return gql(queryString)
}

export const PAIRS_BULK = gql`
  ${PAIR_FIELDS}
  query PairsBulk($allPairs: [Bytes]!) {
    pairs(where: { id_in: $allPairs }, orderBy: trackedReserveETH, orderDirection: desc) {
      ...PairFields
    }
  }
`

export const PAIRS_HISTORICAL_BULK = (block: number, pairs: string[]) => {
  let pairsString = `[`
  pairs.map(pair => {
    return (pairsString += `"${pair}"`)
  })
  pairsString += ']'
  const queryString = `
  query PairsHistoricalBulk {
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

export const FILTERED_TRANSACTIONS = gql`
  ${MINT_DETAILS}
  ${BURN_DETAILS}
  ${SWAP_DETAILS}
  query FilteredTransactions($allPairs: [Bytes]!) {
    mints(first: 20, where: { pair_in: $allPairs }, orderBy: timestamp, orderDirection: desc) {
      ...MintDetails
    }
    burns(first: 20, where: { pair_in: $allPairs }, orderBy: timestamp, orderDirection: desc) {
      ...BurnDetails
    }
    swaps(first: 30, where: { pair_in: $allPairs }, orderBy: timestamp, orderDirection: desc) {
      ...SwapDetails
    }
  }
`
