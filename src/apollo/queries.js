import { ApolloProvider, Query } from 'react-apollo'
import gql from 'graphql-tag'



export const TRANSACTIONS_QUERY = gql`
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