import React, { useState, useRef, useEffect } from 'react'
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
import { Activity } from 'react-feather'
import { useDarkModeManager } from '../../contexts/LocalStorage'

const ChartWrapper = styled.div`
  height: 100%;
  min-height: 300px;

  @media screen and (max-width: 600px) {
    min-height: 200px;
  }
`

const PriceOption = styled(OptionButton)`
  border-radius: 2px;
`

const CHART_VIEW = {
  VOLUME: 'Volume',
  LIQUIDITY: 'Liquidity',
  PRICE: 'Price',
  LINE_PRICE: 'Price (Line)',
}

const DATA_FREQUENCY = {
  ONE_MINUTE: 'ONE_MINUTE',
  FIVE_MINUTES: 'FIVE_MINUTES',
  HOUR: 'HOUR',
  LINE: 'LINE',
}

const TokenChart = ({ address, color, base }) => {
  // settings for the window and candle width
  const [chartFilter, setChartFilter] = useState(CHART_VIEW.PRICE)
  const [frequency, setFrequency] = useState(DATA_FREQUENCY.FIVE_MINUTES)

  const [darkMode] = useDarkModeManager()
  const textColor = darkMode ? 'white' : 'black'

  // reset view on new address
  const addressPrev = usePrevious(address)
  useEffect(() => {
    if (address !== addressPrev && addressPrev) {
      setChartFilter(CHART_VIEW.LIQUIDITY)
    }
  }, [address, addressPrev])

  let chartData = useTokenChartData(address)

  const [timeWindow, setTimeWindow] = useState(timeframeOptions.THERE_DAYS)
  const prevWindow = usePrevious(timeWindow)

  // hourly and daily price data based on the current time window
  const data1m1day = useTokenPriceData(address, timeframeOptions.ONE_DAY, 60)
  const data5m3days = useTokenPriceData(address, timeframeOptions.THERE_DAYS, 300)
  // const data5mWeek = useTokenPriceData(address, timeframeOptions.WEEK, 300)
  // const data5mMonth = useTokenPriceData(address, timeframeOptions.MONTH, 300)
  const dataHourly3days = useTokenPriceData(address, timeframeOptions.THERE_DAYS, 3600)
  const dataHourlyWeek = useTokenPriceData(address, timeframeOptions.WEEK, 3600)
  const dataHourlyMonth = useTokenPriceData(address, timeframeOptions.MONTH, 3600)

  const priceData =
    timeWindow === timeframeOptions.ONE_DAY
      ? data1m1day
      : timeWindow === timeframeOptions.MONTH
      ? // monthly selected
        // frequency === DATA_FREQUENCY.FIVE_MINUTES
        // ? data5mMonth :
        dataHourlyMonth
      : // weekly selected
      timeWindow === timeframeOptions.WEEK
      ? // frequency === DATA_FREQUENCY.FIVE_MINUTES
        //     ? data5mWeek :
        dataHourlyWeek
      : // 3 days selected
      frequency === DATA_FREQUENCY.FIVE_MINUTES
      ? data5m3days
      : dataHourly3days

  // switch to 5m data when switched to 3 days window
  // switch to hourly data when switched to week window
  // switch to hourly data if switched to month window
  useEffect(() => {
    if (timeWindow === timeframeOptions.THERE_DAYS && prevWindow && prevWindow !== timeframeOptions.THERE_DAYS) {
      setFrequency(DATA_FREQUENCY.FIVE_MINUTES)
    }

    if (timeWindow === timeframeOptions.WEEK && prevWindow && prevWindow !== timeframeOptions.WEEK) {
      setFrequency(DATA_FREQUENCY.HOUR)
    }

    if (timeWindow === timeframeOptions.MONTH && prevWindow && prevWindow !== timeframeOptions.MONTH) {
      setFrequency(DATA_FREQUENCY.HOUR)
    }

    if (timeWindow === timeframeOptions.ONE_DAY && prevWindow && prevWindow !== timeframeOptions.ONE_DAY) {
      setFrequency(DATA_FREQUENCY.ONE_MINUTE)
    }
  }, [prevWindow, timeWindow])

  const below1080 = useMedia('(max-width: 1080px)')
  const below600 = useMedia('(max-width: 600px)')

  let utcStartTime = getTimeframe(timeWindow)
  const aspect = below1080 ? 60 / 32 : below600 ? 60 / 42 : 60 / 22

  chartData = chartData?.filter((entry) => entry.date >= utcStartTime)

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

  const { ONE_DAY, ...timeWindowOptionsExcept1Day } = timeframeOptions
  return (
    <ChartWrapper>
      {below600 ? (
        <RowBetween mb={40}>
          <DropdownSelect
            options={CHART_VIEW}
            active={chartFilter}
            setActive={(value) => {
              setChartFilter(value)
              if (value === CHART_VIEW.LIQUIDITY || value === CHART_VIEW.VOLUME)
                setTimeWindow(timeframeOptions.THERE_DAYS)
            }}
            color={color}
          />
          <DropdownSelect
            options={
              [CHART_VIEW.LIQUIDITY, CHART_VIEW.VOLUME].includes(chartFilter)
                ? timeWindowOptionsExcept1Day
                : timeframeOptions
            }
            active={timeWindow}
            setActive={setTimeWindow}
            color={color}
          />
        </RowBetween>
      ) : (
        <RowBetween
          mb={
            chartFilter === CHART_VIEW.LIQUIDITY ||
            chartFilter === CHART_VIEW.VOLUME ||
            (chartFilter === CHART_VIEW.PRICE && frequency === DATA_FREQUENCY.LINE)
              ? 40
              : 0
          }
          align="flex-start"
        >
          <AutoColumn gap="8px">
            <RowFixed>
              <OptionButton
                active={chartFilter === CHART_VIEW.LIQUIDITY}
                onClick={() => {
                  setChartFilter(CHART_VIEW.LIQUIDITY)
                  setTimeWindow(timeframeOptions.THERE_DAYS)
                }}
                style={{ marginRight: '6px' }}
              >
                Liquidity
              </OptionButton>
              <OptionButton
                active={chartFilter === CHART_VIEW.VOLUME}
                onClick={() => {
                  setChartFilter(CHART_VIEW.VOLUME)
                  setTimeWindow(timeframeOptions.THERE_DAYS)
                }}
                style={{ marginRight: '6px' }}
              >
                Volume
              </OptionButton>
              <OptionButton
                active={chartFilter === CHART_VIEW.PRICE}
                onClick={() => {
                  setChartFilter(CHART_VIEW.PRICE)
                }}
              >
                Price
              </OptionButton>
            </RowFixed>
            {chartFilter === CHART_VIEW.PRICE && (
              <AutoRow gap="4px">
                {timeWindow === timeframeOptions.ONE_DAY && (
                  <PriceOption
                    active={frequency === DATA_FREQUENCY.ONE_MINUTE}
                    onClick={() => {
                      setTimeWindow(timeframeOptions.ONE_DAY)
                      setFrequency(DATA_FREQUENCY.ONE_MINUTE)
                    }}
                  >
                    1m
                  </PriceOption>
                )}

                {timeWindow === timeframeOptions.THERE_DAYS && (
                  <PriceOption
                    active={frequency === DATA_FREQUENCY.FIVE_MINUTES}
                    onClick={() => {
                      setTimeWindow(timeframeOptions.THERE_DAYS)
                      setFrequency(DATA_FREQUENCY.FIVE_MINUTES)
                    }}
                  >
                    5m
                  </PriceOption>
                )}
                <>
                  {timeWindow !== timeframeOptions.ONE_DAY && (
                    <PriceOption
                      active={frequency === DATA_FREQUENCY.HOUR}
                      onClick={() => setFrequency(DATA_FREQUENCY.HOUR)}
                    >
                      H
                    </PriceOption>
                  )}
                  <PriceOption
                    active={frequency === DATA_FREQUENCY.LINE}
                    onClick={() => setFrequency(DATA_FREQUENCY.LINE)}
                  >
                    <Activity size={14} />
                  </PriceOption>
                </>
              </AutoRow>
            )}
          </AutoColumn>
          <AutoRow justify="flex-end" gap="6px" align="flex-start" style={{ width: 'fit-content' }}>
            {chartFilter === CHART_VIEW.PRICE && (
              <OptionButton
                active={timeWindow === timeframeOptions.ONE_DAY}
                onClick={() => setTimeWindow(timeframeOptions.ONE_DAY)}
              >
                1D
              </OptionButton>
            )}

            <OptionButton
              active={timeWindow === timeframeOptions.THERE_DAYS}
              onClick={() => setTimeWindow(timeframeOptions.THERE_DAYS)}
            >
              3D
            </OptionButton>
            <OptionButton
              active={timeWindow === timeframeOptions.WEEK}
              onClick={() => setTimeWindow(timeframeOptions.WEEK)}
            >
              1W
            </OptionButton>
            <OptionButton
              active={timeWindow === timeframeOptions.MONTH}
              onClick={() => setTimeWindow(timeframeOptions.MONTH)}
            >
              1M
            </OptionButton>
          </AutoRow>
        </RowBetween>
      )}
      {chartFilter === CHART_VIEW.LIQUIDITY && chartData && (
        <ResponsiveContainer aspect={aspect}>
          <AreaChart margin={{ top: 0, right: 10, bottom: 6, left: 0 }} barCategoryGap={1} data={chartData}>
            <defs>
              <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.35} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              tickLine={false}
              axisLine={false}
              interval="preserveEnd"
              tickMargin={16}
              minTickGap={120}
              tickFormatter={(tick) => toNiceDate(tick)}
              dataKey="date"
              tick={{ fill: textColor }}
              type={'number'}
              domain={['dataMin', 'dataMax']}
            />
            <YAxis
              type="number"
              orientation="right"
              tickFormatter={(tick) => '$' + toK(tick)}
              axisLine={false}
              tickLine={false}
              interval="preserveEnd"
              minTickGap={80}
              yAxisId={0}
              tick={{ fill: textColor }}
            />
            <Tooltip
              cursor={true}
              formatter={(val) => formattedNum(val, true)}
              labelFormatter={(label) => toNiceDateYear(label)}
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
              stackId="2"
              strokeWidth={2}
              dot={false}
              type="monotone"
              name={'Liquidity'}
              yAxisId={0}
              stroke={darken(0.12, color)}
              fill="url(#colorUv)"
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
      {[CHART_VIEW.PRICE, CHART_VIEW.LINE_PRICE].includes(chartFilter) &&
        (frequency === DATA_FREQUENCY.LINE || CHART_VIEW.LINE_PRICE === chartFilter ? (
          <ResponsiveContainer aspect={below1080 ? 60 / 32 : 60 / 16}>
            <AreaChart margin={{ top: 0, right: 10, bottom: 6, left: 0 }} barCategoryGap={1} data={priceData}>
              <defs>
                <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.35} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                tickLine={false}
                axisLine={false}
                interval="preserveEnd"
                tickMargin={16}
                minTickGap={120}
                tickFormatter={(tick) => toNiceDate(tick)}
                dataKey="timestamp"
                tick={{ fill: textColor }}
                domain={['dataMin', 'dataMax']}
              />
              <YAxis
                type="number"
                dataKey="open"
                orientation="right"
                tickFormatter={(tick) => '$' + toK(tick)}
                domain={['auto', 'auto']}
                tick={{ fill: textColor }}
              />
              <Tooltip
                cursor={true}
                formatter={(val) => formattedNum(val.toString(), true)}
                labelFormatter={(label) => toNiceDateYear(label)}
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
                stackId="2"
                strokeWidth={2}
                dot={false}
                type="monotone"
                name={'Price'}
                yAxisId={0}
                stroke={darken(0.12, color)}
                fill="url(#colorUv)"
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
              interval="preserveEnd"
              minTickGap={80}
              tickMargin={14}
              tickFormatter={(tick) => toNiceDate(tick)}
              dataKey="date"
              tick={{ fill: textColor }}
              type={'number'}
              domain={['dataMin', 'dataMax']}
            />
            <YAxis
              type="number"
              axisLine={false}
              tickMargin={16}
              tickFormatter={(tick) => '$' + toK(tick)}
              tickLine={false}
              orientation="right"
              interval="preserveEnd"
              minTickGap={80}
              yAxisId={0}
              tick={{ fill: textColor }}
            />
            <Tooltip
              cursor={{ fill: color, opacity: 0.1 }}
              formatter={(val) => formattedNum(val, true)}
              labelFormatter={(label) => toNiceDateYear(label)}
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
              type="monotone"
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
