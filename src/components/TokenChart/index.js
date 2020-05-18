import React, { useState } from 'react'
import styled from 'styled-components'
import { Area, XAxis, YAxis, ResponsiveContainer, Tooltip, AreaChart, BarChart, Bar } from 'recharts'
import { AutoRow, RowBetween } from '../Row'

import { toK, toNiceDate, toNiceDateYear } from '../../helpers'
import { OptionButton } from '../ButtonStyled'
import { darken } from 'polished'
import { useMedia } from 'react-use'
import { timeframeOptions } from '../../constants'
import dayjs from 'dayjs'
import { useTokenChartData } from '../../contexts/TokenData'

const ChartWrapper = styled.div`
  margin-top: 40px;
  height: 100%;
`

const CHART_VIEW = {
  VOLUME: 'Volume',
  LIQUIDITY: 'Liquidity'
}

const TokenChart = ({ address, color }) => {
  const [chartFilter, setChartFilter] = useState(CHART_VIEW.LIQUIDITY)

  const chartData = useTokenChartData(address)

  const [timeWindow, setTimeWindow] = useState(timeframeOptions.ALL_TIME)

  const below1080 = useMedia('(max-width: 1080px)')

  // find start time based on required time window, update domain
  const utcEndTime = dayjs.utc()
  // based on window, get starttime
  let utcStartTime
  switch (timeWindow) {
    case timeframeOptions.WEEK:
      utcStartTime =
        utcEndTime
          .subtract(1, 'week')
          .startOf('day')
          .unix() - 1
      break
    case timeframeOptions.ALL_TIME:
      utcStartTime = utcEndTime.subtract(1, 'year').unix() - 1
      break
    default:
      utcStartTime =
        utcEndTime
          .subtract(1, 'year')
          .startOf('year')
          .unix() - 1
      break
  }
  const domain = [dataMin => (dataMin > utcStartTime ? dataMin : utcStartTime), 'dataMax']

  return (
    <ChartWrapper>
      <RowBetween mb={40}>
        <AutoRow gap="10px">
          <OptionButton
            active={chartFilter === CHART_VIEW.LIQUIDITY}
            onClick={() => setChartFilter(CHART_VIEW.LIQUIDITY)}
          >
            Liquidity
          </OptionButton>
          <OptionButton active={chartFilter === CHART_VIEW.VOLUME} onClick={() => setChartFilter(CHART_VIEW.VOLUME)}>
            Volume
          </OptionButton>
        </AutoRow>
        <AutoRow justify="flex-end" gap="10px">
          <OptionButton
            active={timeWindow === timeframeOptions.WEEK}
            onClick={() => setTimeWindow(timeframeOptions.WEEK)}
          >
            1 Week
          </OptionButton>
          <OptionButton
            active={timeWindow === timeframeOptions.ALL_TIME}
            onClick={() => setTimeWindow(timeframeOptions.ALL_TIME)}
          >
            All Time
          </OptionButton>
        </AutoRow>
      </RowBetween>
      {chartFilter === CHART_VIEW.LIQUIDITY && chartData && (
        <ResponsiveContainer aspect={below1080 ? 60 / 32 : 60 / 12}>
          <AreaChart margin={{ top: 0, right: 10, bottom: 6, left: -20 }} barCategoryGap={1} data={chartData}>
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
              tickFormatter={tick => toNiceDate(tick)}
              dataKey="date"
              tick={{ fill: 'black' }}
              type={'number'}
              domain={domain}
            />
            <YAxis
              type="number"
              orientation="left"
              tickFormatter={tick => toK(tick)}
              axisLine={false}
              tickLine={false}
              interval="preserveEnd"
              minTickGap={80}
              yAxisId={0}
              tick={{ fill: 'black' }}
            />
            <Tooltip
              cursor={true}
              formatter={val => toK(val, true)}
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
      {chartFilter === CHART_VIEW.VOLUME && (
        <ResponsiveContainer aspect={below1080 ? 60 / 32 : 60 / 12}>
          <BarChart margin={{ top: 0, right: 10, bottom: 6, left: -30 }} barCategoryGap={1} data={chartData}>
            <XAxis
              tickLine={false}
              axisLine={false}
              interval="preserveEnd"
              minTickGap={80}
              tickMargin={14}
              tickFormatter={tick => toNiceDate(tick)}
              dataKey="date"
              type={'number'}
              domain={domain}
            />
            <YAxis
              type="number"
              axisLine={false}
              tickMargin={16}
              tickFormatter={tick => toK(tick)}
              tickLine={false}
              interval="preserveEnd"
              minTickGap={80}
              yAxisId={0}
            />
            <Tooltip
              cursor={{ fill: color, opacity: 0.1 }}
              formatter={val => toK(val, true)}
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

export default TokenChart
