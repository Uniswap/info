import { BlockHeight } from 'api/types'

export interface IPairController {
  getFilteredTransactions(allPairs: string): any
  getPairData(pairAddress: string, block?: number): any
  getPairsBulk(allPairs: string[]): any
  getPairsHistoricalBulk(block: number, pairs: string[]): any
  getPairChart(pairAddress: string, skip: number): any
  getCurrentPairs(): any
  getPairHourlyRates(pairAddress: string, blocks: BlockHeight[]): any
  searchPair(tokens: string[], id: string): any
}
