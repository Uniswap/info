import React, { useState, useRef, useEffect } from 'react'
import styled from 'styled-components'
import { Area, XAxis, YAxis, ResponsiveContainer, Tooltip, AreaChart, BarChart, Bar } from 'recharts'
import { RowBetween, AutoRow } from '../Row'

import { toK, toNiceDate, toNiceDateYear, formattedNum, getTimeframe } from '../../utils'
import { OptionButton } from '../ButtonStyled'
import { darken } from 'polished'
import { usePoolChartData, useHourlyRateData, usePoolData } from '../../contexts/PoolData'
import { timeframeOptions } from '../../constants'
import { useMedia } from 'react-use'
import { EmptyCard } from '..'
import DropdownSelect from '../DropdownSelect'
import CandleStickChart from '../CandleChart'
import LocalLoader from '../LocalLoader'
import { useDarkModeManager } from '../../contexts/LocalStorage'
import useTheme from '../../hooks/useTheme'

const ChartWrapper = styled.div`
  height: 100%;
  max-height: 340px;

  @media screen and (max-width: 600px) {
    min-height: 200px;
  }
`

const OptionsRow = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  margin-bottom: 40px;
  justify-content: space-between;
`

const CHART_VIEW = {
  VOLUME: 'Volume',
  LIQUIDITY: 'Liquidity',
  RATE0: 'RATE0',
  RATE1: 'RATE1',
}

const PoolChart = ({ address, color, base0, base1 }) => {
  const [chartFilter, setChartFilter] = useState(CHART_VIEW.LIQUIDITY)

  const [timeWindow, setTimeWindow] = useState(timeframeOptions.MONTH)

  const [darkMode] = useDarkModeManager()
  const textColor = darkMode ? 'white' : 'black'
  const theme = useTheme()

  // update the width on a window resize
  const ref = useRef()
  const isClient = typeof window === 'object'
  const [width, setWidth] = useState(ref?.current?.container?.clientWidth)
  const [height, setHeight] = useState(ref?.current?.container?.clientHeight)
  useEffect(() => {
    if (!isClient) {
      return false
    }
    function handleResize() {
      setWidth(ref?.current?.container?.clientWidth ?? width)
      setHeight(ref?.current?.container?.clientHeight ?? height)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [height, isClient, width]) // Empty array ensures that effect is only run on mount and unmount

  // get data for pool, and rates
  const poolData = usePoolData(address)
  let chartData = usePoolChartData(address)
  const hourlyData = useHourlyRateData(
    address,
    timeWindow,
    timeWindow === timeframeOptions.FOUR_HOURS
      ? 30
      : timeWindow === timeframeOptions.ONE_DAY
      ? 120
      : timeWindow === timeframeOptions.THERE_DAYS
      ? 300
      : 3600
  )
  const hourlyRate0 = hourlyData && hourlyData[0]
  const hourlyRate1 = hourlyData && hourlyData[1]

  // formatted symbols for overflow
  const formattedSymbol0 =
    poolData?.token0?.symbol.length > 6 ? poolData?.token0?.symbol.slice(0, 5) + '...' : poolData?.token0?.symbol
  const formattedSymbol1 =
    poolData?.token1?.symbol.length > 6 ? poolData?.token1?.symbol.slice(0, 5) + '...' : poolData?.token1?.symbol

  const below1600 = useMedia('(max-width: 1600px)')
  const below1080 = useMedia('(max-width: 1080px)')
  const below600 = useMedia('(max-width: 600px)')

  let utcStartTime = getTimeframe(timeWindow)
  chartData = chartData?.filter(entry => entry.date >= utcStartTime)

  if (chartData && chartData.length === 0) {
    return (
      <ChartWrapper>
        <EmptyCard height='300px'>No historical data yet.</EmptyCard>{' '}
      </ChartWrapper>
    )
  }

  /**
   * Used to format values on chart on scroll
   * Needs to be raw html for chart API to parse styles
   * @param {*} val
   */
  function valueFormatter(val) {
    if (chartFilter === CHART_VIEW.RATE0) {
      return formattedNum(val) + `<span style="font-size: 12px; margin-left: 4px;">${formattedSymbol0}/${formattedSymbol1}<span>`
    }
    if (chartFilter === CHART_VIEW.RATE1) {
      return formattedNum(val) + `<span style="font-size: 12px; margin-left: 4px;">${formattedSymbol1}/${formattedSymbol0}<span>`
    }
  }

  const aspect = below600 ? 60 / 42 : below1080 ? 60 / 15 : below1600 ? 60 / 40 : 60 / 32

  const { ONE_DAY, FOUR_HOURS, ALL_TIME, ...timeWindowOptionsExcept1Day } = timeframeOptions
  const { ALL_TIME: alltime, ...timeWindowOptionsExceptAllTime } = timeframeOptions
  return (
    <ChartWrapper>
      {below600 ? (
        <RowBetween mb={80}>
          <DropdownSelect
            options={CHART_VIEW}
            active={chartFilter}
            setActive={value => {
              setChartFilter(value)
              if ([CHART_VIEW.LIQUIDITY, CHART_VIEW.VOLUME].includes(value)) setTimeWindow(timeframeOptions.MONTH)
            }}
            color={color}
            optionTitles={{
              ...CHART_VIEW,
              RATE0: poolData.token0 ? formattedSymbol1 + '/' + formattedSymbol0 : '-',
              RATE1: poolData.token0 ? formattedSymbol0 + '/' + formattedSymbol1 : '-',
            }}
          />
          <DropdownSelect
            options={
              [CHART_VIEW.LIQUIDITY, CHART_VIEW.VOLUME].includes(chartFilter)
                ? timeWindowOptionsExcept1Day
                : timeWindowOptionsExceptAllTime
            }
            active={timeWindow}
            setActive={setTimeWindow}
            color={color}
          />
        </RowBetween>
      ) : (
        <OptionsRow>
          <AutoRow style={{ background: theme.buttonBlack, borderRadius: '999px', width: 'fit-content' }}>
            <OptionButton
              active={chartFilter === CHART_VIEW.LIQUIDITY}
              onClick={() => {
                setTimeWindow(timeframeOptions.MONTH)
                setChartFilter(CHART_VIEW.LIQUIDITY)
              }}
              style={{ padding: '6px 12px', borderRadius: '999px' }}
            >
              Liquidity
            </OptionButton>
            <OptionButton
              active={chartFilter === CHART_VIEW.VOLUME}
              onClick={() => {
                setTimeWindow(timeframeOptions.MONTH)
                setChartFilter(CHART_VIEW.VOLUME)
              }}
              style={{ padding: '6px 12px', borderRadius: '999px' }}
            >
              Volume
            </OptionButton>
            <OptionButton
              active={chartFilter === CHART_VIEW.RATE0}
              onClick={() => {
                setTimeWindow(timeframeOptions.ONE_DAY)
                setChartFilter(CHART_VIEW.RATE0)
              }}
              style={{ padding: '6px 12px', borderRadius: '999px' }}
            >
              {poolData.token0 ? formattedSymbol1 + '/' + formattedSymbol0 : '-'}
            </OptionButton>
            <OptionButton
              active={chartFilter === CHART_VIEW.RATE1}
              onClick={() => {
                setTimeWindow(timeframeOptions.ONE_DAY)
                setChartFilter(CHART_VIEW.RATE1)
              }}
              style={{ padding: '6px 12px', borderRadius: '999px' }}
            >
              {poolData.token0 ? formattedSymbol0 + '/' + formattedSymbol1 : '-'}
            </OptionButton>
          </AutoRow>
          <AutoRow justify='flex-end' style={{ width: 'fit-content', gap: '6px' }}>
            {[CHART_VIEW.RATE1, CHART_VIEW.RATE0].includes(chartFilter) && (
              <>
                <OptionButton
                  active={timeWindow === timeframeOptions.FOUR_HOURS}
                  onClick={() => setTimeWindow(timeframeOptions.FOUR_HOURS)}
                >
                  4H
                </OptionButton>

                <OptionButton
                  active={timeWindow === timeframeOptions.ONE_DAY}
                  onClick={() => setTimeWindow(timeframeOptions.ONE_DAY)}
                >
                  1D
                </OptionButton>
              </>
            )}

            <OptionButton
              active={timeWindow === timeframeOptions.THERE_DAYS}
              onClick={() => setTimeWindow(timeframeOptions.THERE_DAYS)}
            >
              3D
            </OptionButton>
            <OptionButton active={timeWindow === timeframeOptions.WEEK} onClick={() => setTimeWindow(timeframeOptions.WEEK)}>
              1W
            </OptionButton>
            <OptionButton active={timeWindow === timeframeOptions.MONTH} onClick={() => setTimeWindow(timeframeOptions.MONTH)}>
              1M
            </OptionButton>
          </AutoRow>
        </OptionsRow>
      )}
      {chartFilter === CHART_VIEW.LIQUIDITY && (
        <ResponsiveContainer aspect={aspect}>
          <AreaChart margin={{ top: 0, right: 10, bottom: 6, left: 0 }} barCategoryGap={1} data={chartData}>
            <defs>
              <linearGradient id='colorUv' x1='0' y1='0' x2='0' y2='1'>
                <stop offset='5%' stopColor={color} stopOpacity={0.35} />
                <stop offset='95%' stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              tickLine={false}
              axisLine={false}
              interval='preserveEnd'
              tickMargin={14}
              minTickGap={80}
              tickFormatter={tick => toNiceDate(tick)}
              dataKey='date'
              tick={{ fill: textColor }}
              type={'number'}
              domain={['dataMin', 'dataMax']}
            />
            <YAxis
              type='number'
              orientation='right'
              tickFormatter={tick => '$' + toK(tick)}
              axisLine={false}
              tickLine={false}
              interval='preserveEnd'
              minTickGap={80}
              yAxisId={0}
              tickMargin={16}
              tick={{ fill: textColor }}
            />
            <Tooltip
              cursor={true}
              formatter={val => formattedNum(val, true)}
              labelFormatter={label => toNiceDateYear(label)}
              labelStyle={{ paddingTop: 4 }}
              contentStyle={{
                padding: '10px 14px',
                borderRadius: 10,
                borderColor: color,
                color: 'black',
              }}
              wrapperStyle={{ top: -70, left: -10 }}
            />
            <Area
              strokeWidth={2}
              dot={false}
              type='monotone'
              name={' (USD)'}
              dataKey={'reserveUSD'}
              yAxisId={0}
              stroke={darken(0.12, color)}
              fill='url(#colorUv)'
            />
          </AreaChart>
        </ResponsiveContainer>
      )}

      {chartFilter === CHART_VIEW.RATE1 &&
        (hourlyRate1 ? (
          <ResponsiveContainer aspect={aspect} ref={ref}>
            <CandleStickChart data={hourlyRate1} base={base0} margin={false} width={width} valueFormatter={valueFormatter} />
          </ResponsiveContainer>
        ) : (
          <LocalLoader />
        ))}

      {chartFilter === CHART_VIEW.RATE0 &&
        (hourlyRate0 ? (
          <ResponsiveContainer aspect={aspect} ref={ref}>
            <CandleStickChart data={hourlyRate0} base={base1} margin={false} width={width} valueFormatter={valueFormatter} />
          </ResponsiveContainer>
        ) : (
          <LocalLoader />
        ))}

      {chartFilter === CHART_VIEW.VOLUME && (
        <ResponsiveContainer aspect={aspect}>
          <BarChart margin={{ top: 0, right: 0, bottom: 6, left: below1080 ? 0 : 10 }} barCategoryGap={1} data={chartData}>
            <XAxis
              tickLine={false}
              axisLine={false}
              interval='preserveEnd'
              minTickGap={80}
              tickMargin={14}
              tickFormatter={tick => toNiceDate(tick)}
              dataKey='date'
              tick={{ fill: textColor }}
              type={'number'}
              domain={['dataMin', 'dataMax']}
            />
            <YAxis
              type='number'
              axisLine={false}
              tickMargin={16}
              tickFormatter={tick => '$' + toK(tick)}
              tickLine={false}
              interval='preserveEnd'
              orientation='right'
              minTickGap={80}
              yAxisId={0}
              tick={{ fill: textColor }}
            />
            <Tooltip
              cursor={{ fill: color, opacity: 0.1 }}
              formatter={val => formattedNum(val, true)}
              labelFormatter={label => toNiceDateYear(label)}
              labelStyle={{ paddingTop: 4 }}
              contentStyle={{
                padding: '10px 14px',
                borderRadius: 10,
                borderColor: color,
                color: 'black',
              }}
              wrapperStyle={{ top: -70, left: -10 }}
            />
            <Bar
              type='monotone'
              name={'Volume'}
              dataKey={'dailyVolumeUSD'}
              fill={color}
              opacity={'0.4'}
              yAxisId={0}
              stroke={color}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartWrapper>
  )
}

export default PoolChart
