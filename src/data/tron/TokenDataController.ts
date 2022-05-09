import { ITokenDataController } from 'data/types/TokenController.interface'
import { client } from 'service/client'
import { TOKEN_SEARCH } from 'service/queries/ethereum/tokens'
import { IntervalTokenDataMock, TokenChartDatMock, TokenPairsMock, TopTokensMock } from '__mocks__/tokens'

export default class TokenDataController implements ITokenDataController {
  async searchToken(value: string, id: string) {
    return client.query({
      query: TOKEN_SEARCH,
      variables: {
        value,
        id
      }
    })
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getTopTokens(_price: number, _priceOld: number) {
    return Promise.resolve(TopTokensMock)
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getTokenData(_address: string, _price: number, _priceOld: number) {
    return Promise.resolve(TopTokensMock[0])
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getTokenPairs(_tokenAddress: string) {
    return Promise.resolve(TokenPairsMock)
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getIntervalTokenData(_tokenAddress: string, _startTime: number, _interval: number, _latestBlock: number) {
    return Promise.resolve(IntervalTokenDataMock)
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getTokenChartData(_tokenAddress: string) {
    return Promise.resolve(TokenChartDatMock)
  }
}
