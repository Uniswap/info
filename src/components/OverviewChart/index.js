import React, { useState, useEffect } from 'react'
import dayjs from 'dayjs'
import { Area, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Tooltip, AreaChart } from 'recharts'
import styled from 'styled-components'
import { useMedia } from 'react-use'
import { toK, toNiceDate, toNiceDateYear } from '../../helpers'

const ChartWrapper = styled.div`
  padding-top: 1em;
  margin-left: -1em;
`

const OverviewChart = ({ data, chartOption, currencyUnit }) => {
  const [chartData, setChartData] = useState([])

  useEffect(() => {
    setChartData([])

    let filteredData = []
    for (let x = 0; x < data.length - 1; x++) {
      let dayStamp = dayjs.unix(data[x].date).date()
      let dayStamp2 = dayjs.unix(data[x + 1].date).date()
      if (dayStamp !== dayStamp2) {
        filteredData.push(data[x])
      }
    }
    setChartData(filteredData)
  }, [data])

  // useEffect(() => {
  //   setChartData([])
  // }, [exchangeAddress])

  const isNotMobile = useMedia('(max-width: 40em)')
  if (chartOption !== 'volume' && chartData && data) {
    return (
      <ChartWrapper>
        <ResponsiveContainer aspect={isNotMobile ? 60 / 22 : 60 / 12}>
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
              type="monotone"
              name={'Volume' + (currencyUnit === 'USD' ? ' (USD)' : ' (ETH)')}
              dataKey={currencyUnit === 'USD' ? 'dailyUSDVolume' : 'dailyEthVolume'}
              fill="#FE6DDE"
              opacity={'0.4'}
              stroke="#FE6DDE"
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartWrapper>
    )
  }
}

export default OverviewChart
