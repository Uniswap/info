import React, { useState, useMemo, useEffect } from 'react'
import { ResponsiveContainer } from 'recharts'
import { useTimeframe } from '../../contexts/Application'
import { timeframeOptions } from '../../constants'
import { useGlobalChartData, useGlobalData } from '../../contexts/GlobalData'
import dayjs from 'dayjs'
import CustomAreaChart from '../CustomAreaChart'
import CustomBarChart from '../CustomBarChart'
import { useMedia } from 'react-use'
import DropdownSelect from '../DropdownSelect'

const CHART_VIEW = {
  VOLUME: 'Volume',
  LIQUIDITY: 'Liquidity'
}

const VOLUME_WINDOW = {
  WEEKLY: 'WEEKLY',
  DAYS: 'DAYS'
}
const GlobalChart = ({ display }) => {
  // chart options
  const [chartView, setChartView] = useState(display === 'volume' ? CHART_VIEW.VOLUME : CHART_VIEW.LIQUIDITY)

  const [volumeWindow] = useState(VOLUME_WINDOW.DAYS)

  // local window used for this chart only, global window for all data detching
  const [globalWindow, setGlobalWindow] = useTimeframe()
  const [localWindow] = useState(globalWindow)

  // global historical data
  const [dailyData, weeklyData] = useGlobalChartData()
  const { totalLiquidityUSD, oneDayVolumeUSD, volumeChangeUSD, liquidityChangeUSD } = useGlobalData()

  let utcEndTime = dayjs.utc()
  useEffect(() => {
    setGlobalWindow(localWindow)
  }, [localWindow, setGlobalWindow])
  // based on window, get starttime
  let utcStartTime
  switch (localWindow) {
    case timeframeOptions.WEEK:
      utcStartTime =
        utcEndTime
          ?.subtract(1, 'week')
          .startOf('day')
          .unix() - 1
      break
    case timeframeOptions.ALL_TIME:
      utcStartTime = utcEndTime?.subtract(1, 'year').unix() - 1
      break
    default:
      utcStartTime =
        utcEndTime
          ?.subtract(1, 'year')
          .startOf('year')
          .unix() - 1
      break
  }

  const chartDataFiltered = useMemo(() => {
    let currentData = volumeWindow === VOLUME_WINDOW.DAYS ? dailyData : weeklyData
    return (
      currentData &&
      Object.keys(currentData)
        ?.map(key => {
          let item = currentData[key]
          if (item.date > utcStartTime) {
            return item
          } else {
            return
          }
        })
        .filter(item => {
          return !!item
        })
    )
  }, [dailyData, utcStartTime, volumeWindow, weeklyData])
  const below800 = useMedia('(max-width: 800px)')

  return chartDataFiltered ? (
    <>
      {below800 && (
        <DropdownSelect options={CHART_VIEW} active={chartView} setActive={setChartView} color={'#ff007a'} />
      )}
      {chartDataFiltered && chartView === CHART_VIEW.LIQUIDITY && (
        <ResponsiveContainer aspect={60 / 28}>
          <CustomAreaChart
            data={chartDataFiltered}
            base={totalLiquidityUSD}
            baseChange={liquidityChangeUSD}
            title="Liquidity"
            field="totalLiquidityUSD"
          />
        </ResponsiveContainer>
      )}
      {chartDataFiltered && chartView === CHART_VIEW.VOLUME && (
        <ResponsiveContainer aspect={60 / 28}>
          <CustomBarChart
            data={chartDataFiltered}
            base={oneDayVolumeUSD}
            baseChange={volumeChangeUSD}
            title="Volume"
            field="dailyVolumeUSD"
          />
        </ResponsiveContainer>
      )}
    </>
  ) : (
    ''
  )
}

export default GlobalChart
