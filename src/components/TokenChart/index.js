import React, { useState } from 'react'
import styled from 'styled-components'
import { Area, XAxis, YAxis, ResponsiveContainer, Tooltip, AreaChart, BarChart, Bar } from 'recharts'
import { AutoRow, RowBetween } from '../Row'

import { toK, toNiceDate, toNiceDateYear } from '../../helpers'
import { OptionButton } from '../ButtonStyled'
import { darken } from 'polished'
import { useMedia } from 'react-use'

const ChartWrapper = styled.div`
  margin-top: 40px;
  height: 100%;
`

const TokenChart = ({ chartData, color }) => {
  const [chartFilter, setChartFilter] = useState('liq')
  const [timeWindow, setTimeWindow] = useState('week')

  const below1080 = useMedia('(max-width: 1080px)')
  const below680 = useMedia('(max-width: 680px)')

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
        {!below680 && (
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
        )}
      </RowBetween>
      {chartFilter === 'liq' && chartData && (
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
      {chartFilter === 'vol' && (
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
