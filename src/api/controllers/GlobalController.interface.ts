import { BlockHeight } from 'api/types'

export default interface IGlobalController {
  getGlobalData: (block?: number) => Promise<any>
  getGlobalChart: (startTime: number, skip: number) => Promise<any>
  getGlobalTransactions: () => Promise<any>
  getPrice: (block?: number) => Promise<any>
  getPricesByBlock: (tokenAddress: string, blocks: BlockHeight[]) => Promise<any>
  getBlocks: (timestamps: number[]) => Promise<any>
  getBlock: (timestampFrom: number, timestampTo: number) => Promise<any>
  getHealthStatus: () => Promise<any>
  getShareValue: (pairAddress: string, blocks: BlockHeight[]) => Promise<any>
}
