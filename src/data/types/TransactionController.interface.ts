export interface ITransactionDataController {
  getTransactions(allPairs: string[]): Promise<Transactions>
  /**
   * Fetch information about user mints, burns, swaps transactions
   * @param  {string} account This is user ID
   */
  getUserTransactions(account: string): Promise<Transactions>
  /**
   * Get and format transactions for global page
   */
  getAllTransactions(): Promise<Transactions>
}
