import { ITransactionDataController } from 'data/types/TransactionController.interface'
import { client } from 'service/client'
import { FILTERED_TRANSACTIONS, GLOBAL_TXNS, USER_TRANSACTIONS } from 'service/queries/ethereum/transactions'
import {
  FilteredTransactionsQueryVariables,
  GlobalTransactionsResponse,
  TransactionQuery,
  UserTransactionQueryVariables
} from 'service/generated/ethereumGraphql'

export default class TransactionDataController implements ITransactionDataController {
  async getTransactions(allPairs: string[]) {
    const result = await client.query<TransactionQuery, FilteredTransactionsQueryVariables>({
      query: FILTERED_TRANSACTIONS,
      variables: {
        allPairs
      }
    })
    return result.data
  }
  async getUserTransactions(account: string) {
    const result = await client.query<TransactionQuery, UserTransactionQueryVariables>({
      query: USER_TRANSACTIONS,
      variables: {
        user: account
      },
      fetchPolicy: 'no-cache'
    })
    return result.data
  }
  async getAllTransactions() {
    const result = await client.query<GlobalTransactionsResponse>({
      query: GLOBAL_TXNS
    })

    return result.data.transactions.reduce<Transactions>(
      (acc, cur) => {
        return {
          mints: acc.mints.concat(cur.mints),
          swaps: acc.swaps.concat(cur.swaps),
          burns: acc.burns.concat(cur.burns)
        }
      },
      {
        mints: [],
        swaps: [],
        burns: []
      }
    )
  }
}
