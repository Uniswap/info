import React, { useState } from 'react'
import styled from 'styled-components'
import { Area, XAxis, YAxis, ResponsiveContainer, Tooltip, AreaChart, BarChart, Bar } from 'recharts'
import Row, { RowBetween } from '../Row'
import { toK, toNiceDate, toNiceDateYear } from '../../helpers'
import { OptionButton } from '../ButtonStyled'
import { lighten, darken } from 'polished'

const ChartWrapper = styled.div`
  /* margin-left: -1em; */
`

const GlobalChart = ({ chartData }) => {
  const [chartFilter, setChartFilter] = useState('liqRaw')
  const [timeWindow, setTimeWindow] = useState('week')

  return chartData ? (
    <ChartWrapper>
      <RowBetween marginBottom={'10px'}>
        <Row>
          <OptionButton
            style={{ marginRight: '10px' }}
            active={chartFilter === 'liqRaw'}
            onClick={() => setChartFilter('liqRaw')}
          >
            Liquidity
          </OptionButton>
          <OptionButton
            style={{ marginRight: '10px' }}
            active={chartFilter === 'vol'}
            onClick={() => setChartFilter('vol')}
          >
            Volume
          </OptionButton>
        </Row>
        <Row justify="flex-end">
          <OptionButton
            style={{ marginRight: '10px' }}
            active={timeWindow === 'week'}
            onClick={() => setTimeWindow('week')}
          >
            1 Week
          </OptionButton>
          <OptionButton
            style={{ marginRight: '10px' }}
            active={timeWindow === 'month'}
            onClick={() => setTimeWindow('month')}
          >
            1 Month
          </OptionButton>
          <OptionButton active={timeWindow === 'all'} onClick={() => setTimeWindow('all')}>
            All Time
          </OptionButton>
        </Row>
        {/* <DropdownSelect options={options} active={timeline} setActive={setTimeline} /> */}
      </RowBetween>
      {chartFilter === 'liqRaw' && chartData && (
        <ResponsiveContainer aspect={60 / 28}>
          <AreaChart margin={{ top: 20, right: 0, bottom: 6, left: 10 }} barCategoryGap={1} data={chartData}>
            <defs>
              <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ff007a" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#ff007a" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              tickLine={false}
              axisLine={false}
              interval="preserveEnd"
              tickMargin={16}
              minTickGap={20}
              tickFormatter={tick => toNiceDate(tick)}
              dataKey="date"
              tick={{ fill: 'black' }}
            />
            <YAxis
              type="number"
              orientation="left"
              tickFormatter={tick => '$' + toK(tick)}
              axisLine={false}
              tickLine={false}
              interval={0}
              minTickGap={50}
              yAxisId={0}
              padding={{ top: 20, bottom: 20 }}
              tick={{ fill: 'black' }}
            />
            <Tooltip
              cursor={{ stroke: 'white', strokeWidth: 1 }}
              formatter={val => toK(val, true)}
              labelFormatter={label => toNiceDateYear(label)}
              labelStyle={{ paddingTop: 4 }}
              contentStyle={{
                padding: '10px 14px',
                borderRadius: 10,
                borderColor: 'transparent',
                backgroundColor: lighten(0.34, '#ff007a'),
                color: lighten(0.4, '#ff007a')
              }}
              wrapperStyle={{ top: -70, left: -10 }}
            />
            <Area
              key={'other'}
              dataKey={'totalLiquidityUSD'}
              stackId="2"
              strokeWidth={2}
              stroke={'#ff007a'}
              dot={false}
              type="monotone"
              name={'Liquidity'}
              yAxisId={0}
              fill="url(#colorUv)"
            />
          </AreaChart>
        </ResponsiveContainer>
      )}

      {chartFilter === 'vol' && (
        <ResponsiveContainer aspect={60 / 28}>
          <BarChart margin={{ top: 20, right: 0, bottom: 6, left: 10 }} barCategoryGap={1} data={chartData}>
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
              tickFormatter={tick => '$' + toK(tick, true, true)}
              tickLine={false}
              interval="preserveEnd"
              minTickGap={80}
              yAxisId={0}
              tick={{ fill: 'black' }}
              domain={[0, 'dataMax']}
            />
            <Tooltip
              cursor={{ fill: '#ff007a', opacity: 0.1 }}
              formatter={val => toK(val, true)}
              labelFormatter={label => toNiceDateYear(label)}
              labelStyle={{ paddingTop: 4 }}
              contentStyle={{
                padding: '10px 14px',
                borderRadius: 10,
                borderColor: 'red',
                color: 'black'
              }}
              wrapperStyle={{ top: -70, left: -10 }}
            />
            <Bar
              type="monotone"
              name={'Volume'}
              dataKey={'dailyVolumeUSD'}
              fill="#ff007a"
              opacity={'0.4'}
              yAxisId={0}
              stroke="rgba(254, 109, 222, 0.8)"
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartWrapper>
  ) : (
    ''
  )
}

export default GlobalChart
