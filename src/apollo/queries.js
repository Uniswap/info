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

export const DIRECTORY_QUERY = gql`
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

//"0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2-0x1146a21769f81c9f2de05eae4dd117241b17d3c5"
// "0x2c4bd064b998838076fa341a83d007fc2fa50957"