import gql from 'graphql-tag'

export const TRANSACTIONS_QUERY = gql`
  query transactions($exchangeAddr: String!) {
    transactions(where: { exchangeAddress: $exchangeAddr }, orderBy: timestamp, orderDirection: desc) {
      id
      user
      block
      ethAmount
      tokenAmount
      fee
      event
      timestamp
      tx
    }
  }
`
export const CHART_QUERY = gql`
  query exchangeDayDatas($date: Int!, $exchangeAddr: String!) {
    exchangeDayDatas(where: { exchangeAddress: $exchangeAddr, date_gt: $date }, orderBy: date, orderDirection: asc) {
      date
      ethBalance
      tokenBalance
      marginalEthRate
      ethVolume
      ROI
      tokenPriceUSD
      totalEvents
    }
  }
`

export const TICKER_QUERY = gql`
  query exchange($id: String!) {
    exchange(id: $id) {
      price
      tokenBalance
      ethBalance
      tradeVolumeEth
    }
  }
`
export const TICKER_24HOUR_QUERY = gql`
  query exchangeHistoricalDatas($timestamp: Int!, $exchangeAddr: String!) {
    exchangeHistoricalDatas(
      where: { timestamp_lt: $timestamp, exchangeAddress: $exchangeAddr }
      first: 1
      orderBy: tradeVolumeEth
      orderDirection: desc
    ) {
      price
      tradeVolumeEth
    }
  }
`

export const DIRECTORY_QUERY = gql`
  query exchanges($first: Int!, $skip: Int!) {
    exchanges(first: $first, skip: $skip, orderBy: tradeVolumeEth, orderDirection: desc) {
      id
      tokenSymbol
      tokenName
      tokenDecimals
      tokenAddress
    }
  }
`

export const OVERVIEW_PAGE_QUERY = gql`
  query exchanges($first: Int!) {
    exchanges(first: $first, orderBy: tradeVolumeEth, orderDirection: desc) {
      id
      tradeVolumeEth
      tokenName
    }
  }
`
export const TOTALS_QUERY = gql`
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
export const OVERVIEW_PAGE_24HOUR = gql`
  query exchangeHistoricalDatas($timestamp: Int!, $exchangeAddr: String!) {
    exchangeHistoricalDatas(
      where: { timestamp_lt: $timestamp, exchangeAddress: $exchangeAddr }
      first: 1
      orderBy: tradeVolumeEth
      orderDirection: desc
    ) {
      tradeVolumeEth
    }
  }
`

export const USER_POOL_QUERY = gql`
  query userExchangeData($id: String!) {
    userExchangeData(id: $id) {
      uniTokenBalance
    }
  }
`

export const TOTAL_POOL_QUERY = gql`
  query exchange($id: String!) {
    exchange(id: $id) {
      totalUniToken
      tokenAddress
    }
  }
`
