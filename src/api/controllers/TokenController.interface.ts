export default interface ITokenController {
  getCurrentTokens(): any
  getDynamicTokens(block: number): any
  getTokenData(tokenAddress: string, block: number): any
  getTokenChart(tokenAddress: string, skip: number): any
  getAllTokens(skip: number): any
  searchToken(value: string, id: string): any
}
