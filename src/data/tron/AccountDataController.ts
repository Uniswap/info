import { IAccountDataController } from 'data/types/AccountController.interface'
import { TopLpsMock, UserHistoryMock, UserLiquidityChartMock, UserPositionsMock } from '__mocks__/account'

export default class AccountDataController implements IAccountDataController {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getUserHistory(_account: string) {
    return Promise.resolve(UserHistoryMock)
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getUserLiquidityChart(_startDateTimestamp: number, _history: LiquiditySnapshot[]) {
    return Promise.resolve(UserLiquidityChartMock)
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getUserPositions(_account: string, _price: number, _snapshots: LiquiditySnapshot[]) {
    return Promise.resolve(UserPositionsMock)
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getTopLps(_allPairs: any) {
    return Promise.resolve(TopLpsMock)
  }
}
