import { HealthStatus } from 'state/features/application/types'
import { GlobalData } from 'state/features/global/types'

export interface IGlobalDataController {
  /**
   * Gets all the global data for the overview page.
   * Needs current eth price and the old eth price to get
   * 24 hour USD changes.
   * @param {*} price
   * @param {*} oldPrice
   */
  getGlobalData(price: number, oldPrice: number): Promise<GlobalData>
  /**
   * Get historical data for volume and liquidity used in global charts
   * on main page
   * @param {*} oldestDateToFetch // start of window to fetch from
   */
  getChartData(oldestDateToFetch: number): Promise<ChartDailyItem[]>
  /**
   * Gets the current price  of ETH, 24 hour price, and % change between them
   */
  getPrice(): Promise<number[]>
  getHealthStatus(): Promise<HealthStatus>
}
