import gql from 'graphql-tag'

export const TRANSACTIONS_QUERY = gql`
  query transactions($exchangeAddr: String!) {
    transactions(where:{exchangeAddress: $exchangeAddr}, orderBy: timestamp, orderDirection: desc){
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
// TODO
export const CHART_QUERY = gql`
  query transactions {
    transactions(where:{exchangeAddress: "0x2c4bd064b998838076fa341a83d007fc2fa50957"}, orderBy: timestamp, orderDirection: desc){
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
export const TICKER_QUERY = gql`
  query userExchnageData($id: String!) {
    exchange(id: $id) {
        price
        ethBalance
        tokenBalance
        tradeVolumeEth
        tradeVolumeToken
    }
  }
`
// TODO - figure out how to get roughly a 24 hour time
export const TICKER_24HOUR_QUERY = gql`
  query userExchnageData($id: String!) {
    exchange(id: $id) {
      price
      tradeVolumeEth
      tradeVolumeToken
    }
  }
`

export const DIRECTORY_QUERY = gql`
  query exchanges($first: Int!, $skip: Int!) {
    exchanges(first: $first, skip: $skip) {
      id
      tokenSymbol
      tokenName
      tokenDecimals
      tokenAddress
    }
  }
`

export const USER_POOL_QUERY = gql`
  query exchange ($id: String!) {
    userExchangeData(id: $id){
      uniTokenBalance
    }
  }
`

export const TOTAL_POOL_QUERY = gql`
  query userExchnageData($id: String!) {
    exchange(id: $id) {
      totalUniToken
      tokenAddress
    }
  }
`