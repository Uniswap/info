import React, { useState, useEffect } from 'react'
import { Area, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Tooltip, AreaChart } from 'recharts-fork'
import styled from 'styled-components'
import { useMedia } from 'react-use'
import { toK, toNiceDate, toNiceDateYear } from '../../helpers'

const ChartWrapper = styled.div`
  padding-top: 1em;
`

const Chart = ({ data, chartOption, currencyUnit }) => {
  const [chartData, setChartData] = useState([])

  useEffect(() => {
    setChartData([])
    setChartData(data)
  }, [data])

  const isNotMobile = useMedia('(max-width: 40em)')
  if (chartOption !== 'volume') {
    return (
      <ChartWrapper>
        <ResponsiveContainer aspect={60 / 12}>
          <AreaChart margin={{ top: 0, right: 0, bottom: 6, left: 10 }} barCategoryGap={1} data={chartData}>
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
            />
            <Area
              strokeWidth={2}
              dot={false}
              type="monotone"
              name={'Total Liquidity' + (currencyUnit === 'USD' ? ' (USD)' : ' (ETH)')}
              dataKey={currencyUnit === 'USD' ? 'usdLiquidity' : 'ethLiquidity'}
              yAxisId={0}
              fill="var(--c-token)"
              opacity={'0.4'}
              stroke="var(--c-token)"
            />
            <Area
              type="monotone"
              name={'Eth Balance'}
              dataKey={'ethBalance'}
              fill="var(--c-token)"
              opacity={'0'}
              stroke="var(--c-token)"
            />
            <Area
              type="monotone"
              name={'Token Balance'}
              dataKey={'tokenBalance'}
              fill="var(--c-token)"
              yAxisId={1}
              opacity={'0'}
              stroke="var(--c-token)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartWrapper>
    )
  } else {
    return (
      <ChartWrapper>
        <ResponsiveContainer aspect={60 / 12}>
          <AreaChart margin={{ top: 0, right: 0, bottom: 6, left: 10 }} barCategoryGap={1} data={chartData}>
            <CartesianGrid stroke="#f5f5f5" />
            <XAxis
              tickLine={false}
              axisLine={false}
              interval="preserveEnd"
              minTickGap={80}
              tickMargin={14}
              tickFormatter={tick => toNiceDate(tick)}
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
            />
            <Area
              type="monotone"
              name={'Volume' + (currencyUnit === 'USD' ? ' (USD)' : ' (ETH)')}
              dataKey={currencyUnit === 'USD' ? 'usdVolume' : 'ethVolume'}
              fill="var(--c-token)"
              opacity={'0.4'}
              stroke="var(--c-token)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartWrapper>
    )
  }
}

export default Chart
