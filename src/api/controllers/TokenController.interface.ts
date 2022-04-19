export default interface ITokenController {
  getTokens(block?: number): Promise<any>
  getTokenData(tokenAddress: string, block: number): Promise<any>
  getTokenChart(tokenAddress: string, skip: number): Promise<any>
  searchToken(value: string, id: string): Promise<any>
}
