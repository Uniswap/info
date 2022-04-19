export default interface IAccountController {
  /**
   * Fetch information about user mints, burns, swaps transactions
   * @param  {string} account This is user ID
   */
  getUserTransactions: (account: string) => Promise<any>
  /**
   *  Fetch all the snapshots of liquidity activity for this account.
   * Each snapshot is a moment when an LP position was created or updated.
   * @param  {string} account - user wallet address
   * @param  {number} skip - offset
   */
  getUserLiquidityPositionSnapshots: (account: string, skip: number) => Promise<any>
  /**
   * Fetch user active liquidity positions.
   * Get user liquidity pools,
   * information about amount of supplied tokens in each pool
   * @param  {string} account - user wallet address
   */
  getUserLiquidityPositions: (account: string) => Promise<any>
  /**
   * Fetch rating list of liquidity position for specific pair address.
   * List sorts by liquidity token balance
   *
   * @param  {string} pair - pair address
   */
  getTopLiquidityPools: (pair: string) => Promise<any>
  /**
   *  Fetch information about user mints, burns transactions
   * @param  {string} user - user wallet address
   * @param  {string} pair - pair address
   */
  getUserMintsBurnsPerPair: (user: string, pair: string) => Promise<any>
}
