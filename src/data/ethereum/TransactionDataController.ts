import { ITransactionDataController } from 'data/types/TransactionController.interface'
import { client } from 'service/client'
import { FILTERED_TRANSACTIONS, GLOBAL_TXNS, USER_TRANSACTIONS } from 'service/queries/transactions'
import { UserParams } from 'service/types/AccountTypes'

export default class TransactionDataController implements ITransactionDataController {
  async getTransactions(allPairs: string[]) {
    const transactions: Transactions = {
      mints: [],
      burns: [],
      swaps: []
    }
    try {
      const result = await client.query({
        query: FILTERED_TRANSACTIONS,
        variables: {
          allPairs
        }
      })
      transactions.mints = result.data.mints
      transactions.burns = result.data.burns
      transactions.swaps = result.data.swaps
    } catch (e) {
      console.log(e)
    }
    return transactions
  }
  async getUserTransactions(account: string) {
    const result = await client.query<Transactions, UserParams>({
      query: USER_TRANSACTIONS,
      variables: {
        user: account
      },
      fetchPolicy: 'no-cache'
    })
    return result.data
  }
  async getAllTransactions() {
    const transactions: Transactions = {
      mints: [],
      burns: [],
      swaps: []
    }

    try {
      const result = await client.query({
        query: GLOBAL_TXNS
      })
      transactions.mints = []
      transactions.burns = []
      transactions.swaps = []
      result?.data?.transactions &&
        result.data.transactions.map((transaction: any) => {
          if (transaction.mints.length > 0) {
            transaction.mints.map((mint: any) => {
              return transactions.mints.push(mint)
            })
          }
          if (transaction.burns.length > 0) {
            transaction.burns.map((burn: any) => {
              return transactions.burns.push(burn)
            })
          }
          if (transaction.swaps.length > 0) {
            transaction.swaps.map((swap: any) => {
              return transactions.swaps.push(swap)
            })
          }
          return true
        })
    } catch (e) {
      console.log(e)
    }

    return transactions
  }
}
