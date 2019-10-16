import gql from 'graphql-tag'

export const TRANSACTIONS_QUERY = gql`
  query transactions($exchangeAddr: String!) {
    transactions(where: { exchangeAddress: $exchangeAddr }, orderBy: timestamp, orderDirection: desc) {
      id
      user
      block
      fee
      timestamp
      addLiquidityEvents {
        id
      }
      removeLiquidityEvents {
        id
      }
      tokenPurchaseEvents {
        id
      }
      ethPurchaseEvents {
        id
      }
    }
  }
`

export const TRANSACTIONS_QUERY_SKIPPABLE = gql`
  query transactions($exchangeAddr: String!, $skip: Int!) {
    transactions(skip: $skip, where: { exchangeAddress: $exchangeAddr }, orderBy: timestamp, orderDirection: desc) {
      id
      user
      block
      fee
      timestamp
      addLiquidityEvents {
        id
        ethAmount
        tokenAmount
      }
      removeLiquidityEvents {
        id
        ethAmount
        tokenAmount
      }
      tokenPurchaseEvents {
        id
        eth
        token
      }
      ethPurchaseEvents {
        id
        eth
        token
      }
    }
  }
`

export const PRICE_AT_TIME = gql`
  query exchangeHistoricalDatas($timestamp: Int!, $exchangeAddr: String!) {
    exchangeHistoricalDatas(
      where: { timestamp_lt: $timestamp, exchangeAddress: $exchangeAddr }
      first: 1
      orderBy: tradeVolumeEth
      orderDirection: desc
    ) {
      tokenPriceUSD
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
      priceUSD
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
      ethBalance
      tokenPriceUSD
    }
  }
`

export const DIRECTORY_QUERY = gql`
  query exchanges($first: Int!, $skip: Int!) {
    exchanges(first: $first, skip: $skip, orderBy: combinedBalanceInUSD, orderDirection: desc) {
      id
      tokenSymbol
      tokenName
      tokenDecimals
      tokenAddress
      ethBalance
    }
  }
`

export const OVERVIEW_PAGE_QUERY = gql`
  query exchanges {
    exchanges(orderBy: ethBalance, orderDirection: desc) {
      id
      tokenAddress
      tradeVolumeEth
      ethBalance
      tokenSymbol
      tokenName
      priceUSD
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

export const UNISWAP_24HOUR = gql`
  query uniswapDayDatas($date: Int!) {
    uniswapDayDatas(where: { date: $date }, first: 1, orderBy: date, orderDirection: desc) {
      totalVolumeInEth
      totalLiquidityInEth
      txCount
    }
  }
`

export const OVERVIEW_PAGE_24HOUR = gql`
  query exchangeHistoricalDatas($timestamp: Int!, $tokenAddress: String!) {
    exchangeHistoricalDatas(
      where: { timestamp_lt: $timestamp, tokenAddress: $tokenAddress }
      first: 1
      orderBy: timestamp
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
