import { LiquidityChart, LiquiditySnapshot, Position, LiquidityPosition } from 'state/features/account/types'

export interface IAccountDataController {
  /**
   *  Fetch all the snapshots of liquidity activity for this account.
   * Each snapshot is a moment when an LP position was created or updated.
   * @param  {string} account - user wallet address
   * @param  {number} skip - offset
   */
  getUserHistory(account: string): Promise<LiquiditySnapshot[]>
  getUserLiquidityChart(startDateTimestamp: number, history: LiquiditySnapshot[]): Promise<LiquidityChart[]>
  /**
   * Fetch user active liquidity positions.
   * Get user liquidity pools,
   * information about amount of supplied tokens in each pool
   * @param  {string} account - user wallet address
   */
  getUserPositions(account: string, price: number, snapshots: LiquiditySnapshot[]): Promise<Position[]>
  /**
   * Fetch rating list of liquidity position for specific pair address.
   * List sorts by liquidity token balance
   *
   * @param  {string} pair - pair address
   */
  getTopLps(allPairs: any): Promise<LiquidityPosition[]>
}
