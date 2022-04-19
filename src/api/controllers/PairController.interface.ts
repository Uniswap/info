import { BlockHeight } from 'api/types'

export interface IPairController {
  getFilteredTransactions(allPairs: string[]): any
  getPairData(pairAddress: string, block?: number): any
  getPairsBulk(allPairs: string[]): any
  getPairsHistoricalBulk(block: number, pairs: string[]): any
  getPairChart(pairAddress: string, skip: number): any
  getCurrentPairs(): any
  getPairHourlyRates(pairAddress: string, blocks: BlockHeight[]): any
  searchPair(tokens: string[], id: string): any
  /**
   * Fetch user liquidity value by specific period of time.
   * For each day starting with min(first position timestamp, beginning of time window),
   * get total liquidity supplied by user in USD.
   * @param  {string[]} pairs - list of pair addresses which user provide liquidity
   * @param  {number} startDateTimestamp - selected period of time
   */
  getPairDayDataBulk: (pairs: string[], startDateTimestamp: number) => Promise<any>
}
