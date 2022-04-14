export default interface IAccountController {
  getUserTransactions: (account: string) => Promise<any>
  getUserHistory: (account: string, skip: number) => Promise<any>
  getUserLiquidityChart: (pairs: string[], startDateTimestamp: number) => Promise<any>
  getUserPositions: (account: string) => Promise<any>
  getMiningPositions: (account: string) => Promise<any>
  getTopLiquidityPools: (pair: string) => Promise<any>
  getUserMintsBurnsPerPair: (user: string, pair: string) => Promise<any>
}
