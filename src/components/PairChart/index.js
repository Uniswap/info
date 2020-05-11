import React, { useState } from 'react'
import styled from 'styled-components'
import { Area, XAxis, YAxis, ResponsiveContainer, Tooltip, AreaChart, BarChart, Bar } from 'recharts'
import { RowBetween, AutoRow } from '../Row'

import { toK, toNiceDate, toNiceDateYear } from '../../helpers'
import { OptionButton } from '../ButtonStyled'
import { darken } from 'polished'

const ChartWrapper = styled.div`
  padding-top: 40px;
`

const GlobalChart = ({ chartData, color }) => {
  const options = [{ text: 'All Time' }, { text: '3 Months' }, { text: '1 week' }]
  const [chartFilter, setChartFilter] = useState('liq')
  const [timeWindow, setTimeWindow] = useState(options[0])

  return (
    <ChartWrapper>
      <RowBetween mb={40}>
        <AutoRow gap="10px">
          <OptionButton active={chartFilter === 'liq'} onClick={() => setChartFilter('liq')}>
            Liquidity
          </OptionButton>
          <OptionButton active={chartFilter === 'vol'} onClick={() => setChartFilter('vol')}>
            Volume
          </OptionButton>
        </AutoRow>
        <AutoRow justify="flex-end" gap="10px">
          <OptionButton active={timeWindow === 'week'} onClick={() => setTimeWindow('week')}>
            1 Week
          </OptionButton>
          <OptionButton active={timeWindow === 'month'} onClick={() => setTimeWindow('month')}>
            1 Month
          </OptionButton>
          <OptionButton active={timeWindow === 'all'} onClick={() => setTimeWindow('all')}>
            All Time
          </OptionButton>
        </AutoRow>
      </RowBetween>
      {chartFilter === 'liq' && (
        <ResponsiveContainer aspect={60 / 12}>
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
      {chartFilter === 'vol' && (
        <ResponsiveContainer aspect={60 / 12}>
          <BarChart margin={{ top: 0, right: 0, bottom: 6, left: 10 }} barCategoryGap={1} data={chartData}>
            <XAxis
              tickLine={false}
              axisLine={false}
              interval="preserveEnd"
              minTickGap={80}
              tickMargin={14}
              tickFormatter={tick => toNiceDate(tick)}
              dataKey="date"
              tick={{ fill: 'black' }}
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
              tick={{ fill: 'black' }}
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

export default GlobalChart
