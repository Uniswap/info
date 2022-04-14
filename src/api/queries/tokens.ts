import { gql } from 'apollo-boost'

export const ALL_TOKENS = gql`
  query AllTokens($skip: Int!) {
    tokens(first: 500, skip: $skip) {
      id
      name
      symbol
      totalLiquidity
    }
  }
`

export const TOKEN_SEARCH = gql`
  query TokenSearch($value: String, $id: String) {
    asSymbol: tokens(where: { symbol_contains: $value }, orderBy: totalLiquidity, orderDirection: desc) {
      id
      symbol
      name
      totalLiquidity
    }
    asName: tokens(where: { name_contains: $value }, orderBy: totalLiquidity, orderDirection: desc) {
      id
      symbol
      name
      totalLiquidity
    }
    asAddress: tokens(where: { id: $id }, orderBy: totalLiquidity, orderDirection: desc) {
      id
      symbol
      name
      totalLiquidity
    }
  }
`

export const TOKEN_CHART = gql`
  query TokenChart($tokenAddr: String!, $skip: Int!) {
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

const TokenFields = gql`
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

export const TOKENS_CURRENT = gql`
  ${TokenFields}
  query CurrentToken {
    tokens(first: 200, orderBy: tradeVolumeUSD, orderDirection: desc) {
      ...TokenFields
    }
  }
`

export const TOKENS_DYNAMIC = gql`
  ${TokenFields}
  query DynamicToken($block: Int!) {
    tokens(block: { number: $block }, first: 200, orderBy: tradeVolumeUSD, orderDirection: desc) {
      ...TokenFields
    }
  }
`

export const TOKEN_DATA = gql`
  ${TokenFields}
  query TokenData($tokenAddress: String!, $block: Int) {
    tokens(block: $block, where: { id: $tokenAddress }) {
      ...TokenFields
    }
    pairs0: pairs(where: { token0: $tokenAddress }, first: 50, orderBy: reserveUSD, orderDirection: desc) {
      id
    }
    pairs1: pairs(where: { token1: $tokenAddress }, first: 50, orderBy: reserveUSD, orderDirection: desc) {
      id
    }
  }
`
