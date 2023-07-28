import React, { useState, useMemo, useEffect, useRef } from 'react'
import { ResponsiveContainer } from 'recharts'
import { timeframeOptions } from '../../constants'
import { useGlobalChartData, useGlobalData } from '../../contexts/GlobalData'
import TradingViewChart, { CHART_TYPES } from '../TradingviewChart'
import { RowFixed } from '../Row'
import { OptionButton } from '../ButtonStyled'
import { getTimeframe } from '../../utils'
import { TYPE } from '../../Theme'
import { aggregateChartData, aggregateGlobalData } from '../../utils/aggregateData'
import { useNetworksInfo } from '../../contexts/NetworkInfo'

const CHART_VIEW = {
  VOLUME: 'Volume',
  LIQUIDITY: 'Liquidity',
}

const VOLUME_WINDOW = {
  WEEKLY: 'WEEKLY',
  DAYS: 'DAYS',
}

const GlobalChart = ({ display }) => {
  const chartView = display === 'volume' ? CHART_VIEW.VOLUME : CHART_VIEW.LIQUIDITY

  // time window and window size for chart
  const timeWindow = timeframeOptions.ALL_TIME
  const [volumeWindow, setVolumeWindow] = useState(VOLUME_WINDOW.DAYS)
  const [networksInfo] = useNetworksInfo()

  // global historical data
  const [dailyDatas, weeklyDatas] = useGlobalChartData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const aggregatedDailyDatas = useMemo(() => aggregateChartData(dailyDatas), [JSON.stringify(dailyDatas)])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const aggregatedWeeklyDatas = useMemo(() => aggregateChartData(weeklyDatas), [JSON.stringify(weeklyDatas)])
  const globalDatas = useGlobalData()
  const {
    totalLiquidityUSD,
    oneDayVolumeUSD,
    volumeChangeUSD,
    liquidityChangeUSD,
    oneWeekVolume,
    weeklyVolumeChange,
  } = globalDatas[1] ? aggregateGlobalData(globalDatas) : globalDatas[0] || {}

  // based on window, get starttim
  let utcStartTime = getTimeframe(timeWindow)

  const chartDataFiltered = useMemo(() => {
    let currentDatas = volumeWindow === VOLUME_WINDOW.DAYS ? aggregatedDailyDatas : aggregatedWeeklyDatas
    return currentDatas.filter(item => item.date > utcStartTime)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(aggregatedDailyDatas), utcStartTime, volumeWindow, JSON.stringify(aggregatedWeeklyDatas)])

  // update the width on a window resize
  const ref = useRef()
  const isClient = typeof window === 'object'
  const [width, setWidth] = useState(ref?.current?.container?.clientWidth)
  useEffect(() => {
    if (!isClient) {
      return false
    }
    function handleResize() {
      setWidth(ref?.current?.container?.clientWidth ?? width)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [isClient, width]) // Empty array ensures that effect is only run on mount and unmount

  return chartDataFiltered ? (
    <>
      {chartDataFiltered &&
        (chartView === CHART_VIEW.LIQUIDITY ? (
          <ResponsiveContainer aspect={60 / 28} ref={ref}>
            <TradingViewChart
              data={aggregatedDailyDatas}
              base={totalLiquidityUSD}
              baseChange={liquidityChangeUSD}
              title={(networksInfo[1] ? 'Total ' : '') + 'Liquidity'}
              field='totalLiquidityUSD'
              width={width}
              type={CHART_TYPES.AREA}
            />
          </ResponsiveContainer>
        ) : chartView === CHART_VIEW.VOLUME ? (
          <ResponsiveContainer aspect={60 / 28}>
            <TradingViewChart
              data={chartDataFiltered}
              base={volumeWindow === VOLUME_WINDOW.WEEKLY ? oneWeekVolume : oneDayVolumeUSD}
              baseChange={volumeWindow === VOLUME_WINDOW.WEEKLY ? weeklyVolumeChange : volumeChangeUSD}
              title={
                (networksInfo[1] ? 'Total ' : '') + 'Trading Volume' + (volumeWindow === VOLUME_WINDOW.WEEKLY ? ' (7d)' : '')
              }
              field={volumeWindow === VOLUME_WINDOW.WEEKLY ? 'weeklyVolumeUSD' : 'dailyVolumeUSD'}
              width={width}
              type={CHART_TYPES.BAR}
              useWeekly={volumeWindow === VOLUME_WINDOW.WEEKLY}
            />
          </ResponsiveContainer>
        ) : null)}

      {display === 'volume' && (
        <RowFixed
          style={{
            top: '20px',
            position: 'absolute',
            right: '20px',
            zIndex: 10,
          }}
        >
          <OptionButton active={volumeWindow === VOLUME_WINDOW.DAYS} onClick={() => setVolumeWindow(VOLUME_WINDOW.DAYS)}>
            <TYPE.body>D</TYPE.body>
          </OptionButton>
          <OptionButton
            style={{ marginLeft: '4px' }}
            active={volumeWindow === VOLUME_WINDOW.WEEKLY}
            onClick={() => setVolumeWindow(VOLUME_WINDOW.WEEKLY)}
          >
            <TYPE.body>W</TYPE.body>
          </OptionButton>
        </RowFixed>
      )}
    </>
  ) : null
}

export default GlobalChart
