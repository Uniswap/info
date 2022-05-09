import { gql } from 'apollo-boost'

export const GLOBAL_CHART = gql`
  query GlobalChart($startTime: Int!) {
    whiteSwapDayDatas(startTime: $startTime) {
      date
      dailyVolumeUSD
      totalLiquidityUSD
    }
  }
`
