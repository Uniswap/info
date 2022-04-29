import { Token, TokenDayData } from 'state/features/token/types'

export interface ITokenDataController {
  getTopTokens(price: number, priceOld: number): Promise<Token[]>
  getTokenData(address: string, price: number, priceOld: number): Promise<Token | undefined>
  getTokenPairs(tokenAddress: string): Promise<string[]>
  getIntervalTokenData(
    tokenAddress: string,
    startTime: number,
    interval: number,
    latestBlock: number
  ): Promise<TimeWindowItem[]>
  getTokenChartData(tokenAddress: string): Promise<TokenDayData[]>
  searchToken(value: string, id: string): Promise<any>
}
