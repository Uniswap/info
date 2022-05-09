import { PairDayData } from 'state/features/pairs/types'

export interface IPairDataController {
  getPairList(price: number): Promise<Pair[]>
  /**
   * Fetch user liquidity value by specific period of time.
   * For each day starting with min(first position timestamp, beginning of time window),
   * get total liquidity supplied by user in USD.
   * @param  {string[]} pairs - list of pair addresses which user provide liquidity
   * @param  {number} startDateTimestamp - selected period of time
   */
  getBulkPairData(pairList: string[], price: number): Promise<Pair[]>
  getPairChartData(pairAddress: string): Promise<PairDayData[]>
  getHourlyRateData(pairAddress: string, startTime: number, latestBlock: number): Promise<TimeWindowItem[][]>
  searchPair(tokens: string[], id: string): any
}
