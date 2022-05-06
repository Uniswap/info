import { ChartDailyItem } from 'state/features/global/types'
import { IGlobalDataController } from 'data/types/GlobalController.interface'
import { ChartDataMock, GlobalDataMock, HealthStatusMock, PriceMock } from '__mocks__/global'

export default class GlobalDataController implements IGlobalDataController {
  async getHealthStatus() {
    return Promise.resolve(HealthStatusMock)
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getGlobalData(_price: number, _oldPrice: number) {
    return Promise.resolve(GlobalDataMock)
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getChartData(_oldestDateToFetch: number): Promise<ChartDailyItem[]> {
    return Promise.resolve(ChartDataMock)
  }
  async getPrice() {
    return Promise.resolve<number[]>(PriceMock)
  }
}
