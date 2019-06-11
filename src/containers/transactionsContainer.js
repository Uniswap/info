import { Container } from 'unstated'

import { client } from '../apollo/client'
import { TRANSACTIONS_QUERY } from '../apollo/queries'

export class TransactionsContainer extends Container {
  state = {
    transactions: []
  }

  resetTransactions = () => this.setState({ transactions: [] })

  async fetchTransactions(exchangeAddress) {
    try {
      const result = await client.query({
        query: TRANSACTIONS_QUERY,
        variables: {
          exchangeAddr: exchangeAddress
        },
        fetchPolicy: 'network-only'
      })
      let data
      if (result) {
        data = result.data
        console.log(`fetched ${data.transactions.length} tx for ${exchangeAddress}`)
        this.setState({
          transactions: data.transactions
        })
      }
    } catch (err) {
      console.log('error: ', err)
    }
  }
}
