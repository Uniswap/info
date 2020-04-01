import React from 'react'
import { Area, XAxis, YAxis, ResponsiveContainer, BarChart, Bar, CartesianGrid, Tooltip, AreaChart } from 'recharts'
import styled from 'styled-components'
import { useMedia } from 'react-use'
import {
  toK,
  toNiceDate,
  toNiceDateYear,
  toMonthlyDate,
  toMonthlyYear,
  toWeeklyDate,
  toWeeklyYear
} from '../../helpers'

const ChartWrapper = styled.div`
  padding-top: 1em;
  margin-left: -1em;
`

const OverviewChart = ({ data, chartOption, currencyUnit, monthlyHistory, weeklyHistory, timeWindow }) => {
  const isNotMobile = useMedia('(max-width: 40em)')

  const isMonthly = timeWindow === 'monthly'

  const isWeekly = timeWindow === 'weekly'

  if (chartOption !== 'volume' && data) {
    return (
      <ChartWrapper>
        <ResponsiveContainer aspect={isNotMobile ? 60 / 22 : 60 / 12}>
          <AreaChart margin={{ top: 0, right: 0, bottom: 6, left: 10 }} barCategoryGap={1} data={data}>
            <CartesianGrid stroke="#f5f5f5" />
            <XAxis
              tickLine={false}
              axisLine={false}
              interval="preserveEnd"
              tickMargin={14}
              minTickGap={80}
              tickFormatter={tick => toNiceDate(tick)}
              dataKey="dayString"
            />
            <YAxis
              hide={isNotMobile}
              type="number"
              tickMargin={16}
              orientation="left"
              tickFormatter={tick => toK(tick)}
              axisLine={false}
              tickLine={false}
              interval="preserveEnd"
              minTickGap={80}
              yAxisId={0}
            />
            <YAxis
              hide={true}
              type="number"
              tickMargin={16}
              orientation="right"
              tickFormatter={tick => toK(tick)}
              axisLine={false}
              tickLine={false}
              interval="preserveEnd"
              minTickGap={80}
              yAxisId={1}
            />
            <Tooltip
              cursor={true}
              formatter={val => toK(val, true)}
              labelFormatter={label => toNiceDateYear(label)}
              labelStyle={{ paddingTop: 4 }}
              contentStyle={{
                padding: '10px 14px',
                borderRadius: 10,
                borderColor: 'var(--c-zircon)'
              }}
              wrapperStyle={{ top: -70, left: -10 }}
            />
            <Area
              strokeWidth={2}
              dot={false}
              type="monotone"
              name={'Total Liquidity' + (currencyUnit === 'USD' ? ' (USD)' : ' (ETH)')}
              dataKey={currencyUnit === 'USD' ? 'usdLiquidity' : 'ethLiquidity'}
              yAxisId={0}
              fill="#FE6DDE"
              opacity={'0.4'}
              stroke="#FE6DDE"
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartWrapper>
    )
  } else {
    // volume
    return (
      <ChartWrapper>
        <ResponsiveContainer aspect={isNotMobile ? 60 / 22 : 60 / 12}>
          <BarChart
            margin={{ top: 0, right: 0, bottom: 6, left: 10 }}
            barCategoryGap={1}
            data={isWeekly ? weeklyHistory : isMonthly ? monthlyHistory : data}
          >
            <CartesianGrid stroke="#f5f5f5" />
            <XAxis
              tickLine={false}
              axisLine={false}
              interval="preserveEnd"
              minTickGap={80}
              tickMargin={14}
              tickFormatter={tick =>
                isWeekly ? toWeeklyDate(tick) : isMonthly ? toMonthlyDate(tick) : toNiceDate(tick)
              }
              dataKey="dayString"
            />
            <YAxis
              hide={isNotMobile}
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
              cursor={true}
              formatter={val => toK(val, true)}
              labelFormatter={label =>
                isWeekly ? toWeeklyYear(label) : isMonthly ? toMonthlyYear(label) : toNiceDateYear(label)
              }
              labelStyle={{ paddingTop: 4 }}
              contentStyle={{
                padding: '10px 14px',
                borderRadius: 10,
                borderColor: 'var(--c-zircon)'
              }}
              wrapperStyle={{ top: -70, left: -10 }}
            />
            <Bar
              type="monotone"
              name={'Volume' + (currencyUnit === 'USD' ? ' (USD)' : ' (ETH)')}
              dataKey={
                currencyUnit === 'USD'
                  ? isMonthly
                    ? 'monthlyVolumeUSD'
                    : isWeekly
                    ? 'weeklyVolumeUSD'
                    : 'dailyUSDVolume'
                  : isMonthly
                  ? 'monthlyVolumeETH'
                  : isWeekly
                  ? 'weeklyVolumeETH'
                  : 'dailyEthVolume'
              }
              fill="#FE6DDE"
              opacity={'0.4'}
              stroke="#FE6DDE"
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartWrapper>
    )
  }
}

export default OverviewChart
