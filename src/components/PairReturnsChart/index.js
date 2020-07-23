import React, { useState } from 'react'
import styled from 'styled-components'
import { XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, ComposedChart, Line, Bar } from 'recharts'
import { AutoRow, RowBetween } from '../Row'

import { toK, toNiceDate, toNiceDateYear } from '../../utils'
import { OptionButton } from '../ButtonStyled'
import { useMedia } from 'react-use'
import { timeframeOptions } from '../../constants'
import DropdownSelect from '../DropdownSelect'
import { useReturnsPerPairHistory } from '../../contexts/User'
import { useTimeframe } from '../../contexts/Application'
import dayjs from 'dayjs'

const ChartWrapper = styled.div`
  height: 100%;
  min-height: 390px;

  @media screen and (max-width: 600px) {
    min-height: 200px;
  }
`

const CHART_VIEW = {
  LIQUIDITY: 'Liquidity'
}

const PairReturnsChart = ({ account, position }) => {
  const [chartFilter, setChartFilter] = useState(CHART_VIEW.LIQUIDITY)

  const data = useReturnsPerPairHistory(position, account)

  const [timeWindow, setTimeWindow] = useTimeframe()

  const below1080 = useMedia('(max-width: 1080px)')
  const below600 = useMedia('(max-width: 600px)')

  // based on window, get starttime
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
      {below600 ? (
        <RowBetween mb={40}>
          <DropdownSelect options={CHART_VIEW} active={chartFilter} setActive={setChartFilter} color={'#ff007a'} />
          <DropdownSelect options={timeframeOptions} active={timeWindow} setActive={setTimeWindow} color={'#ff007a'} />
        </RowBetween>
      ) : (
        <RowBetween mb={40}>
          <AutoRow gap="10px">
            <OptionButton
              active={chartFilter === CHART_VIEW.LIQUIDITY}
              onClick={() => setChartFilter(CHART_VIEW.LIQUIDITY)}
            >
              Liquidity
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
      )}
      <ResponsiveContainer aspect={below1080 ? 60 / 32 : below600 ? 60 / 42 : 60 / 26}>
        <ComposedChart margin={{ top: 0, right: 10, bottom: 6, left: 0 }} barCategoryGap={1} data={data}>
          <CartesianGrid stroke="#DFE1E9" />
          <XAxis
            tickLine={false}
            axisLine={false}
            interval="preserveEnd"
            tickMargin={16}
            minTickGap={0}
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
            minTickGap={6}
            yAxisId={0}
            tick={{ fill: 'black' }}
          />
          <YAxis
            type="number"
            orientation="right"
            tickFormatter={tick => '$' + toK(tick)}
            axisLine={false}
            tickLine={false}
            interval="preserveEnd"
            minTickGap={6}
            yAxisId={1}
            tick={{ fill: 'black' }}
          />
          <Tooltip
            cursor={true}
            // formatter={val => null}
            labelFormatter={label => toNiceDateYear(label)}
            labelStyle={{ paddingTop: 4 }}
            contentStyle={{
              padding: '10px 14px',
              borderRadius: 10,
              borderColor: '#ff007a',
              color: 'black'
            }}
            // content={val => <Text>{toNiceDateYear(val.label)}</Text>}
            wrapperStyle={{ top: -70, left: -10 }}
          />
          <Bar type="monotone" dataKey="usdValue" fill="rgba(0,0,0,0.05)" yAxisId={1} />
          <Line type="monotone" dataKey="assetReturn" stroke="#82ca9d" />
          <Line type="monotone" dataKey="uniswapReturn" stroke="blue" />
          <Line type="monotone" dataKey="netReturn" stroke="purple" />
          <Line dataKey="fees" stroke="orange" />
          <Line dataKey="impLoss" stroke="black" />
        </ComposedChart>
      </ResponsiveContainer>
    </ChartWrapper>
  )
}

export default PairReturnsChart
