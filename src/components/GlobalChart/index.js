import React, { useState, useMemo, useEffect, useRef } from 'react'
import { ResponsiveContainer } from 'recharts'
import { timeframeOptions } from '../../constants'
import { useGlobalChartData, useGlobalData } from '../../contexts/GlobalData'
import { useMedia } from 'react-use'
import DropdownSelect from '../DropdownSelect'
import TradingViewChart, { CHART_TYPES } from '../TradingviewChart'
import { RowFixed } from '../Row'
import { OptionButton } from '../ButtonStyled'
import { getTimeframe } from '../../utils'
import { TYPE } from '../../Theme'
import { useAllPrices } from '../../contexts/Price'
import { useLiquidity } from '../../contexts/Liquidity'
import { ASSETS } from '../../constants/assets'

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
  const [totalLiquidity, setTotalLiquidity] = useState(0)
  const [chartView, setChartView] = useState(display === 'volume' ? CHART_VIEW.VOLUME : CHART_VIEW.LIQUIDITY)

  // time window and window size for chart
  const timeWindow = timeframeOptions.ALL_TIME
  const [volumeWindow, setVolumeWindow] = useState(VOLUME_WINDOW.DAYS)

  const prices = useAllPrices()
  const liquidity = useLiquidity()

  useEffect(() => {
    let _totalLiquidity = 0
    ASSETS.forEach(token => {
      if (prices && liquidity) {
        const p = prices[token.symbol] || 0
        const l = liquidity[token.symbol] || 0

        _totalLiquidity += l * p
      }
    })
    setTotalLiquidity(_totalLiquidity)
  }, [prices, liquidity])

  // global historical data
  const [dailyData, weeklyData] = useGlobalChartData()

  const {
    totalLiquidityUSD
    // oneDayVolumeUSD,
    // volumeChangeUSD,
    // liquidityChangeUSD,
    // oneWeekVolume,
    // weeklyVolumeChange
  } = useGlobalData()

  // based on window, get starttim
  let utcStartTime = getTimeframe(timeWindow)

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

  console.log(chartDataFiltered)

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
      {below800 && (
        <DropdownSelect options={CHART_VIEW} active={chartView} setActive={setChartView} color={'#ff007a'} />
      )}

      {chartDataFiltered && chartView === CHART_VIEW.LIQUIDITY && (
        <ResponsiveContainer aspect={60 / 28} ref={ref}>
          <TradingViewChart
            data={[
              {
                date: '1598572800',
                totalLiquidityUSD: '17043.42886349621537016424864454717'
              },
              {
                date: '1598659200',
                totalLiquidityUSD: '18043.42886349621537016424864454717'
              },
              {
                date: '1598745600',
                totalLiquidityUSD: '17043.42886349621537016424864454717'
              },
              {
                date: '1598832000',
                totalLiquidityUSD: '57043.42886349621537016424864454717'
              },
              {
                date: '1598918400',
                totalLiquidityUSD: '67043.42886349621537016424864454717'
              },
              {
                date: '1599004800',
                totalLiquidityUSD: '77043.42886349621537016424864454717'
              },
              {
                date: '1599091200',
                totalLiquidityUSD: '87043.42886349621537016424864454717'
              }
            ]}
            // data={dailyData}
            base={Number(totalLiquidity)}
            baseChange={0}
            title="Liquidity"
            field="totalLiquidityUSD"
            width={width}
            type={CHART_TYPES.AREA}
          />
        </ResponsiveContainer>
      )}
      {/* {chartDataFiltered && chartView === CHART_VIEW.VOLUME && (
        <ResponsiveContainer aspect={60 / 28}>
          <TradingViewChart
            data={chartDataFiltered}
            base={volumeWindow === VOLUME_WINDOW.WEEKLY ? oneWeekVolume : oneDayVolumeUSD}
            baseChange={volumeWindow === VOLUME_WINDOW.WEEKLY ? weeklyVolumeChange : volumeChangeUSD}
            title={volumeWindow === VOLUME_WINDOW.WEEKLY ? 'Volume (7d)' : 'Volume'}
            field={volumeWindow === VOLUME_WINDOW.WEEKLY ? 'weeklyVolumeUSD' : 'dailyVolumeUSD'}
            width={width}
            type={CHART_TYPES.BAR}
            useWeekly={volumeWindow === VOLUME_WINDOW.WEEKLY}
          />
        </ResponsiveContainer>
      )} */}
      {display === 'volume' && (
        <RowFixed style={{ bottom: '70px', position: 'absolute', left: '20px', zIndex: 10 }}>
          <OptionButton
            active={volumeWindow === VOLUME_WINDOW.DAYS}
            onClick={() => setVolumeWindow(VOLUME_WINDOW.DAYS)}
          >
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
  ) : (
    ''
  )
}

export default GlobalChart
