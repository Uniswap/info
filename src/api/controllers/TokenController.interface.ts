export default interface ITokenController {
  getCurrentTokens(): Promise<any>
  getDynamicTokens(block: number): Promise<any>
  getTokenData(tokenAddress: string, block: number): Promise<any>
  getTokenChart(tokenAddress: string, skip: number): Promise<any>
  getAllTokens(skip: number): Promise<any>
  searchToken(value: string, id: string): Promise<any>
}
