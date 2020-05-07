import React, { useState } from 'react'
import styled from 'styled-components'
import { Area, XAxis, YAxis, ResponsiveContainer, Tooltip, AreaChart, BarChart, Bar } from 'recharts'
import { RowBetween, AutoRow } from '../Row'

import { toK, toNiceDate, toNiceDateYear } from '../../helpers'
import { OptionButton } from '../ButtonStyled'

const ChartWrapper = styled.div`
  padding-top: 40px;
`

const GlobalChart = ({ chartData }) => {
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
          <AreaChart margin={{ top: 0, right: 0, bottom: 6, left: 10 }} barCategoryGap={1} data={chartData}>
            <XAxis
              tickLine={false}
              axisLine={false}
              interval="preserveEnd"
              tickMargin={14}
              minTickGap={80}
              tickFormatter={tick => toNiceDate(tick)}
              dataKey="date"
            />
            <YAxis
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
              name={' (USD)'}
              dataKey={'reserveUSD'}
              yAxisId={0}
              fill="rgba(235, 243, 255, 0.3)"
              stroke="rgba(254, 109, 222, 0.6)"
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
            <Bar
              type="monotone"
              name={'Volume'}
              dataKey={'dailyVolumeUSD'}
              fill="rgba(254, 109, 222, 0.6)"
              opacity={'0.4'}
              yAxisId={0}
              stroke="rgba(254, 109, 222, 0.8)"
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartWrapper>
  )
}

export default GlobalChart
