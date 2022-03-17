import React, { useState, useRef, useEffect } from 'react'
import { Text } from 'rebass'
import styled from 'styled-components'
import { Area, XAxis, YAxis, ResponsiveContainer, Tooltip, AreaChart, BarChart, Bar } from 'recharts'
import { AutoRow, RowBetween, RowFixed } from '../Row'

import { toK, toNiceDate, toNiceDateYear, formattedNum, getTimeframe } from '../../utils'
import { OptionButton } from '../ButtonStyled'
import { darken } from 'polished'
import { useMedia, usePrevious } from 'react-use'
import { timeframeOptions } from '../../constants'
import { useTokenChartData, useTokenPriceData } from '../../contexts/TokenData'
import DropdownSelect from '../DropdownSelect'
import CandleStickChart from '../CandleChart'
import LocalLoader from '../LocalLoader'
import { AutoColumn } from '../Column'
import { useDarkModeManager } from '../../contexts/LocalStorage'
import useTheme from '../../hooks/useTheme'

const ChartWrapper = styled.div`
  height: 100%;
  min-height: 350px;

  @media screen and (max-width: 600px) {
    min-height: 200px;
  }
`

const CHART_VIEW = {
  VOLUME: 'Volume',
  LIQUIDITY: 'Liquidity',
  PRICE: 'Price',
  LINE_PRICE: 'Price (Line)',
}

const TokenChart = ({ address, color, base }) => {
  // settings for the window and candle width
  const [chartFilter, setChartFilter] = useState(CHART_VIEW.PRICE)

  const [darkMode] = useDarkModeManager()
  const theme = useTheme()
  const textColor = darkMode ? 'white' : 'black'

  // reset view on new address
  const addressPrev = usePrevious(address)
  useEffect(() => {
    if (address !== addressPrev && addressPrev) {
      setChartFilter(CHART_VIEW.LIQUIDITY)
    }
  }, [address, addressPrev])

  let chartData = useTokenChartData(address)

  const [timeWindow, setTimeWindow] = useState(timeframeOptions.ONE_DAY)

  const priceData = useTokenPriceData(
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

  const below1080 = useMedia('(max-width: 1080px)')
  const below600 = useMedia('(max-width: 600px)')

  let utcStartTime = getTimeframe(timeWindow)
  const aspect = below600 ? 60 / 42 : below1080 ? 60 / 30 : 60 / 20

  chartData = chartData?.filter(entry => entry.date >= utcStartTime)

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

  const { ONE_DAY, FOUR_HOURS, ALL_TIME, ...timeWindowOptionsExcept1Day } = timeframeOptions
  const { ALL_TIME: alltime, ...timeWindowOptionsExceptAllTime } = timeframeOptions
  return (
    <ChartWrapper>
      {below600 ? (
        <RowBetween mb={20}>
          <DropdownSelect
            options={CHART_VIEW}
            active={chartFilter}
            setActive={value => {
              setChartFilter(value)
              if (value === CHART_VIEW.LIQUIDITY || value === CHART_VIEW.VOLUME) setTimeWindow(timeframeOptions.THERE_DAYS)
            }}
            color={color}
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
        <RowBetween mb={20} align='flex-start'>
          <RowFixed style={{ background: theme.buttonBlack, borderRadius: '999px' }}>
            <OptionButton
              active={chartFilter === CHART_VIEW.PRICE}
              onClick={() => {
                setChartFilter(CHART_VIEW.PRICE)
              }}
              style={{ padding: '6px 12px', borderRadius: '999px' }}
            >
              Price
            </OptionButton>

            <OptionButton
              active={chartFilter === CHART_VIEW.LINE_PRICE}
              onClick={() => {
                setChartFilter(CHART_VIEW.LINE_PRICE)
              }}
              style={{ padding: '6px 12px', borderRadius: '999px' }}
            >
              Price (Line)
            </OptionButton>

            <OptionButton
              active={chartFilter === CHART_VIEW.LIQUIDITY}
              onClick={() => {
                setChartFilter(CHART_VIEW.LIQUIDITY)
                setTimeWindow(timeframeOptions.THERE_DAYS)
              }}
              style={{ padding: '6px 12px', borderRadius: '999px' }}
            >
              Liquidity
            </OptionButton>
            <OptionButton
              active={chartFilter === CHART_VIEW.VOLUME}
              onClick={() => {
                setChartFilter(CHART_VIEW.VOLUME)
                setTimeWindow(timeframeOptions.THERE_DAYS)
              }}
              style={{ padding: '6px 12px', borderRadius: '999px' }}
            >
              Volume
            </OptionButton>
          </RowFixed>
          <AutoColumn justify='flex-end'>
            <AutoRow justify='flex-end' align='flex-start' style={{ width: 'fit-content', gap: '6px' }}>
              {[CHART_VIEW.PRICE, CHART_VIEW.LINE_PRICE].includes(chartFilter) && (
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
            <Text color={theme.subText} fontSize={10} marginTop='12px'>
              {![CHART_VIEW.LINE_PRICE, CHART_VIEW.PRICE].includes(chartFilter)
                ? ' '
                : timeWindow === timeframeOptions.FOUR_HOURS
                ? '30s'
                : timeWindow === timeframeOptions.ONE_DAY
                ? '2 Mins'
                : timeWindow === timeframeOptions.THERE_DAYS
                ? '5 Mins'
                : '1 Hr'}
            </Text>
          </AutoColumn>
        </RowBetween>
      )}
      {chartFilter === CHART_VIEW.LIQUIDITY && chartData && (
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
              tickMargin={16}
              minTickGap={120}
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
              key={'other'}
              dataKey={'totalLiquidityUSD'}
              stackId='2'
              strokeWidth={2}
              dot={false}
              type='monotone'
              name={'Liquidity'}
              yAxisId={0}
              stroke={darken(0.12, color)}
              fill='url(#colorUv)'
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
      {[CHART_VIEW.PRICE, CHART_VIEW.LINE_PRICE].includes(chartFilter) &&
        (priceData && CHART_VIEW.LINE_PRICE === chartFilter ? (
          <ResponsiveContainer aspect={aspect}>
            <AreaChart margin={{ top: 0, right: 10, bottom: 6, left: 0 }} barCategoryGap={1} data={priceData}>
              <defs>
                <linearGradient id='colorUv' x1='0' y1='0' x2='0' y2='1'>
                  <stop offset='5%' stopColor={color} stopOpacity={0.35} />
                  <stop offset='95%' stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                tickLine={false}
                axisLine={false}
                tickMargin={16}
                minTickGap={120}
                tickFormatter={tick => toNiceDate(tick)}
                dataKey='timestamp'
                tick={{ fill: textColor }}
                domain={['dataMin', 'dataMax']}
              />
              <YAxis
                type='number'
                dataKey='open'
                orientation='right'
                tickFormatter={tick => formattedNum(tick, true)}
                domain={['auto', 'auto']}
                tick={{ fill: textColor }}
              />
              <Tooltip
                cursor={true}
                formatter={val => formattedNum(val.toString(), true)}
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
                key={'other'}
                dataKey={'open'}
                stackId='2'
                strokeWidth={2}
                dot={false}
                type='monotone'
                name={'Price'}
                yAxisId={0}
                stroke={darken(0.12, color)}
                fill='url(#colorUv)'
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : priceData ? (
          <ResponsiveContainer aspect={aspect} ref={ref}>
            <CandleStickChart data={priceData} width={width} base={base} />
          </ResponsiveContainer>
        ) : (
          <LocalLoader />
        ))}

      {chartFilter === CHART_VIEW.VOLUME && (
        <ResponsiveContainer aspect={aspect}>
          <BarChart margin={{ top: 0, right: 10, bottom: 6, left: 10 }} barCategoryGap={1} data={chartData}>
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
              orientation='right'
              interval='preserveEnd'
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

export default TokenChart
