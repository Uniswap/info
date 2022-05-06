import { ITransactionDataController } from 'data/types/TransactionController.interface'
import { TransactionsMock } from '__mocks__/transactions'

export default class TransactionDataController implements ITransactionDataController {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getTransactions(_allPairs: string[]) {
    return Promise.resolve(TransactionsMock)
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getUserTransactions(_account: string) {
    return Promise.resolve(TransactionsMock)
  }
  async getAllTransactions() {
    return Promise.resolve(TransactionsMock)
  }
}
