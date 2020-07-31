import React, { useState, useRef } from 'react'
import styled from 'styled-components'
import { Area, XAxis, YAxis, ResponsiveContainer, Tooltip, AreaChart, BarChart, Bar } from 'recharts'
import { RowBetween, AutoRow } from '../Row'

import { toK, toNiceDate, toNiceDateYear, formattedNum, getTimeframe } from '../../utils'
import { OptionButton } from '../ButtonStyled'
import { darken } from 'polished'
import { usePairChartData, useHourlyRateData, usePairData } from '../../contexts/PairData'
import { timeframeOptions } from '../../constants'
import { useMedia } from 'react-use'
import { EmptyCard } from '..'
import DropdownSelect from '../DropdownSelect'
import CandleStickChart from '../CandleChart'
import LocalLoader from '../LocalLoader'

const ChartWrapper = styled.div`
  height: 100%;
  max-height: 320px;

  @media screen and (max-width: 600px) {
    min-height: 200px;
  }
`

const OptionsRow = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  margin-bottom: 40px;
`

const CHART_VIEW = {
  VOLUME: 'Volume',
  LIQUIDITY: 'Liquidity',
  RATE0: 'Rate 0',
  RATE1: 'Rate 1'
}

const PairChart = ({ address, color }) => {
  const [chartFilter, setChartFilter] = useState(CHART_VIEW.LIQUIDITY)

  const [timeWindow, setTimeWindow] = useState(timeframeOptions.WEEK)

  const ref = useRef()

  // get data for pair, and rates
  const pairData = usePairData(address)
  const chartData = usePairChartData(address)
  const hourlyData = useHourlyRateData(address, timeWindow)
  const hourlyRate0 = hourlyData && hourlyData[0]
  const hourlyRate1 = hourlyData && hourlyData[1]

  const below1080 = useMedia('(max-width: 1080px)')
  const below600 = useMedia('(max-width: 600px)')

  let utcStartTime = getTimeframe(timeWindow)

  const domain = [dataMin => (dataMin > utcStartTime ? dataMin : utcStartTime), 'dataMax']

  if (chartData && chartData.length === 0) {
    return (
      <ChartWrapper>
        <EmptyCard height="300px">No historical data yet.</EmptyCard>{' '}
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
      return (
        formattedNum(val) +
        `<span style="font-size: 12px; margin-left: 4px;">${pairData?.token0?.symbol}/${pairData?.token1?.symbol}<span>`
      )
    }
    if (chartFilter === CHART_VIEW.RATE1) {
      return (
        formattedNum(val) +
        `<span style="font-size: 12px; margin-left: 4px;">${pairData?.token1?.symbol}/${pairData?.token0?.symbol}<span>`
      )
    }
  }

  const aspect = below1080 ? 60 / 32 : 60 / 28

  return (
    <ChartWrapper>
      {below600 ? (
        <RowBetween mb={40}>
          <DropdownSelect options={CHART_VIEW} active={chartFilter} setActive={setChartFilter} color={color} />
          <DropdownSelect options={timeframeOptions} active={timeWindow} setActive={setTimeWindow} color={color} />
        </RowBetween>
      ) : (
        <OptionsRow>
          <AutoRow gap="6px" style={{ flexWrap: 'nowrap' }}>
            <OptionButton
              active={chartFilter === CHART_VIEW.LIQUIDITY}
              onClick={() => setChartFilter(CHART_VIEW.LIQUIDITY)}
            >
              Liquidity
            </OptionButton>
            <OptionButton active={chartFilter === CHART_VIEW.VOLUME} onClick={() => setChartFilter(CHART_VIEW.VOLUME)}>
              Volume
            </OptionButton>
            <OptionButton active={chartFilter === CHART_VIEW.RATE0} onClick={() => setChartFilter(CHART_VIEW.RATE0)}>
              {pairData.token0 ? pairData.token0.symbol + '/' + pairData.token1.symbol : '-'}
            </OptionButton>
            <OptionButton active={chartFilter === CHART_VIEW.RATE1} onClick={() => setChartFilter(CHART_VIEW.RATE1)}>
              {pairData.token0 ? pairData.token1.symbol + '/' + pairData.token0.symbol : '-'}
            </OptionButton>
          </AutoRow>
          <AutoRow justify="flex-end" gap="6px">
            <OptionButton
              active={timeWindow === timeframeOptions.MONTH}
              onClick={() => setTimeWindow(timeframeOptions.MONTH)}
            >
              1M
            </OptionButton>
            <OptionButton
              active={timeWindow === timeframeOptions.WEEK}
              onClick={() => setTimeWindow(timeframeOptions.WEEK)}
            >
              1W
            </OptionButton>
            <OptionButton
              active={timeWindow === timeframeOptions.ALL_TIME}
              onClick={() => setTimeWindow(timeframeOptions.ALL_TIME)}
            >
              All
            </OptionButton>
          </AutoRow>
        </OptionsRow>
      )}
      {chartFilter === CHART_VIEW.LIQUIDITY && (
        <ResponsiveContainer aspect={aspect}>
          <AreaChart margin={{ top: 0, right: 0, bottom: 6, left: 0 }} barCategoryGap={1} data={chartData}>
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
              tickMargin={14}
              minTickGap={80}
              tickFormatter={tick => toNiceDate(tick)}
              dataKey="date"
              tick={{ fill: 'black' }}
              type={'number'}
              domain={domain}
            />
            <YAxis
              type="number"
              orientation="left"
              tickFormatter={tick => '$' + toK(tick)}
              axisLine={false}
              tickLine={false}
              interval="preserveEnd"
              minTickGap={80}
              yAxisId={0}
              tick={{ fill: 'black' }}
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
                color: 'black'
              }}
              wrapperStyle={{ top: -70, left: -10 }}
            />
            <Area
              strokeWidth={2}
              dot={false}
              type="monotone"
              name={' (USD)'}
              dataKey={'reserveUSD'}
              yAxisId={0}
              stroke={darken(0.12, color)}
              fill="url(#colorUv)"
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
      {chartFilter === CHART_VIEW.RATE0 &&
        (hourlyRate0 ? (
          <ResponsiveContainer aspect={aspect} ref={ref}>
            <CandleStickChart data={hourlyRate0} width={400} address={address} valueFormatter={valueFormatter} />
          </ResponsiveContainer>
        ) : (
          <LocalLoader />
        ))}

      {chartFilter === CHART_VIEW.RATE1 &&
        (hourlyRate0 ? (
          <ResponsiveContainer aspect={aspect} ref={ref}>
            <CandleStickChart data={hourlyRate1} width={400} address={address} valueFormatter={valueFormatter} />
          </ResponsiveContainer>
        ) : (
          <LocalLoader />
        ))}

      {chartFilter === CHART_VIEW.VOLUME && (
        <ResponsiveContainer aspect={aspect}>
          <BarChart
            margin={{ top: 0, right: 0, bottom: 6, left: below1080 ? 0 : 10 }}
            barCategoryGap={1}
            data={chartData}
          >
            <XAxis
              tickLine={false}
              axisLine={false}
              interval="preserveEnd"
              minTickGap={80}
              tickMargin={14}
              tickFormatter={tick => toNiceDate(tick)}
              dataKey="date"
              tick={{ fill: 'black' }}
              type={'number'}
              domain={domain}
            />
            <YAxis
              type="number"
              axisLine={false}
              tickMargin={16}
              tickFormatter={tick => '$' + toK(tick)}
              tickLine={false}
              interval="preserveEnd"
              minTickGap={80}
              yAxisId={0}
              tick={{ fill: 'black' }}
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
                color: 'black'
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

export default PairChart
