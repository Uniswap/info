import React, { useState, useMemo, useEffect, useRef } from 'react'
import { ResponsiveContainer } from 'recharts'
import { timeframeOptions } from '../../constants'
import TradingViewChart, { CHART_TYPES } from '../TradingviewChart'
import { getTimeframe } from '../../utils'
import { useLiquidityChart } from '../../contexts/LiquidityChart'
import { useTotalLiquidity } from '../../contexts/TokenData'

const CHART_VIEW = {
  VOLUME: 'Volume',
  LIQUIDITY: 'Liquidity'
}

const GlobalChart = ({ display }) => {
  // chart options
  const [chartView] = useState(display === 'volume' ? CHART_VIEW.VOLUME : CHART_VIEW.LIQUIDITY)

  // time window and window size for chart
  const timeWindow = timeframeOptions.ALL_TIME

  const totalLiquidity = useTotalLiquidity()
  const dailyData = useLiquidityChart()

  // based on window, get starttim
  let utcStartTime = getTimeframe(timeWindow)

  const chartDataFiltered = useMemo(() => {
    let currentData = dailyData
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
  }, [dailyData, utcStartTime])

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
      {chartDataFiltered && chartView === CHART_VIEW.LIQUIDITY && (
        <ResponsiveContainer aspect={60 / 28} ref={ref}>
          <TradingViewChart
            data={dailyData}
            base={Number(totalLiquidity)}
            baseChange={0}
            title="Liquidity"
            field="totalLiquidityUsd"
            width={width}
            type={CHART_TYPES.AREA}
          />
        </ResponsiveContainer>
      )}
    </>
  ) : (
    ''
  )
}

export default GlobalChart
