import { IGlobalDataController } from 'data/types/GlobalController.interface'
import { GlobalDataMock, HealthStatusMock, PriceMock } from '__mocks__/global'
import { client } from 'service/client'
import { GlobalChartQuery, GlobalChartQueryVariables } from 'service/generated/tronGraphql'
import { GLOBAL_CHART } from 'service/queries/tron/global'

export default class GlobalDataController implements IGlobalDataController {
  async getHealthStatus() {
    return Promise.resolve(HealthStatusMock)
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getGlobalData(_price: number, _oldPrice: number) {
    return Promise.resolve(GlobalDataMock)
  }
  async getChartData(oldestDateToFetch: number): Promise<ChartDailyItem[]> {
    const { data } = await client.query<GlobalChartQuery, GlobalChartQueryVariables>({
      query: GLOBAL_CHART,
      variables: { startTime: oldestDateToFetch }
    })

    const formattedChart = data.whiteSwapDayDatas!.map(el => ({
      date: el!.date!,
      dailyVolumeUSD: +el!.dailyVolumeUSD!,
      totalLiquidityUSD: +el!.totalLiquidityUSD!
    }))
    return formattedChart
  }
  async getPrice() {
    return Promise.resolve<number[]>(PriceMock)
  }
}
