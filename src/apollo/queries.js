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
        CH
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
  query transactions($timestamp: Int!, $exchangeAddr: String!, $skip: Int!) {
    transactions(
      skip: $skip
      where: { timestamp_gt: $timestamp, exchangeAddress: $exchangeAddr }
      orderBy: timestamp
      orderDirection: desc
    ) {
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
      priceUSD
      tokenBalance
      ethBalance
      tradeVolumeEth
      tradeVolumeToken
      totalTxsCount
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
      id
      exchangeAddress
      tradeVolumeEth
      tradeVolumeToken
      tokenPriceUSD
      price
      ethBalance
      totalTxsCount
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
      priceUSD
      price
      ethBalance
      tokenSymbol
      tokenName
      tokenBalance
      totalTxsCount
    }
  }
`

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

export const UNISWAP_CHART_QUERY = gql`
  query uniswapDayDatas($date: Int!) {
    uniswapDayDatas(where: { date_gt: $date }, orderBy: date, orderDirection: asc) {
      date
      totalVolumeInEth
      totalVolumeUSD
      totalLiquidityInEth
      totalLiquidityUSD
      txCount
    }
  }
`
