import { TOKEN_FIELDS, TOKEN_INFO_LIQUIDITY } from 'api/fragments'
import { gql } from 'apollo-boost'

export const TOKEN_SEARCH = gql`
  ${TOKEN_INFO_LIQUIDITY}
  query TokenSearch($value: String, $id: String) {
    asSymbol: tokens(where: { symbol_contains: $value }, orderBy: totalLiquidity, orderDirection: desc) {
      ...TokenInfoLiquidity
    }
    asName: tokens(where: { name_contains: $value }, orderBy: totalLiquidity, orderDirection: desc) {
      ...TokenInfoLiquidity
    }
    asAddress: tokens(where: { id: $id }, orderBy: totalLiquidity, orderDirection: desc) {
      ...TokenInfoLiquidity
    }
  }
`

// ! need mapped
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
// ! need mapped
export const TOKENS_CURRENT = gql`
  ${TOKEN_FIELDS}
  query CurrentToken {
    tokens(first: 200, orderBy: tradeVolumeUSD, orderDirection: desc) {
      ...TokenFields
    }
  }
`
// ! need mapped
export const TOKENS_DYNAMIC = gql`
  ${TOKEN_FIELDS}
  query DynamicToken($block: Int!) {
    tokens(block: { number: $block }, first: 200, orderBy: tradeVolumeUSD, orderDirection: desc) {
      ...TokenFields
    }
  }
`
// ! need mapped
export const TOKEN_DATA = gql`
  ${TOKEN_FIELDS}
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
