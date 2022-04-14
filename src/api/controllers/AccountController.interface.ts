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
  getUserHistory: (account: string, skip: number) => Promise<any>
  /**
   * Fetch user liquidity value by specific period of time.
   * For each day starting with min(first position timestamp, beginning of time window),
   * get total liquidity supplied by user in USD.
   * @param  {string[]} pairs - list of pair addresses which user provide liquidity
   * @param  {number} startDateTimestamp - selected period of time
   */
  getPairDayDataBulk: (pairs: string[], startDateTimestamp: number) => Promise<any>
  /**
   * Fetch user active liquidity positions.
   * Get user liquidity pools,
   * information about amount of supplied tokens in each pool
   * @param  {string} account - user wallet address
   */
  getUserPositions: (account: string) => Promise<any>
  /**
   * FIXME: Currently disabled
   * @param  {string} account
   */
  getMiningPositions: (account: string) => Promise<any>
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
