import React, { useState } from 'react'
import styled from 'styled-components'
import { XAxis, YAxis, ResponsiveContainer, Tooltip, Legend, LineChart, Line, CartesianGrid } from 'recharts'
import { AutoRow, RowBetween, RowFixed } from '../Row'

import { toK, toNiceDate, toNiceDateYear, formattedNum, getTimeframe } from '../../utils'
import { OptionButton } from '../ButtonStyled'
import { useMedia } from 'react-use'
import { timeframeOptions } from '../../constants'
import DropdownSelect from '../DropdownSelect'
import { useUserPositionChart, useUserLiquidityChart } from '../../contexts/User'
import { useTimeframe } from '../../contexts/Application'
import LocalLoader from '../LocalLoader'
import { Text } from 'rebass'
import { useColor } from '../../hooks'

const ChartWrapper = styled.div`
  max-height: 420px;

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

const LegendWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
`

const LegendCircle = styled.div`
  background-color: ${({ color }) => color}
  border-radius: 50%;
  height: 8px;
  width: 8px;
  margin-left: 4px;

`

const CHART_VIEW = {
  VALUE: 'Value',
  FEES: 'Fees'
}

const PairReturnsChart = ({ account, position }) => {
  let feeData = useUserPositionChart(position, account)
  let liquidtyData = useUserLiquidityChart(account)

  const [timeWindow, setTimeWindow] = useTimeframe()

  const below600 = useMedia('(max-width: 600px)')

  const color = useColor(position?.pair.token0.id)

  const [chartView, setChartView] = useState(CHART_VIEW.VALUE)

  // based on window, get starttime
  let utcStartTime = getTimeframe(timeWindow)
  feeData = feeData?.filter(entry => entry.date >= utcStartTime)

  liquidtyData = liquidtyData
    ?.filter(entry => entry.date >= utcStartTime)
    .map(entry => {
      entry.usdValue = parseFloat(entry[position.pair.id])
      return !isNaN(parseFloat(entry[position.pair.id])) && entry
    })

  const aspect = below600 ? 60 / 42 : 60 / 16

  const renderLegend = props => {
    const { payload } = props

    return (
      <LegendWrapper>
        {payload.map((entry, index) => (
          <RowFixed style={{ marginRight: '40px' }} key={index}>
            <Text>{entry.value}</Text>: <LegendCircle color={index === 0 ? color : 'green'} />
          </RowFixed>
        ))}
      </LegendWrapper>
    )
  }

  return (
    <ChartWrapper>
      {below600 ? (
        <RowBetween mb={40}>
          <div />
          <DropdownSelect options={timeframeOptions} active={timeWindow} setActive={setTimeWindow} />
        </RowBetween>
      ) : (
        <OptionsRow>
          <AutoRow gap="6px" style={{ flexWrap: 'nowrap' }}>
            <OptionButton active={chartView === CHART_VIEW.VALUE} onClick={() => setChartView(CHART_VIEW.VALUE)}>
              Liquidity
            </OptionButton>
            <OptionButton active={chartView === CHART_VIEW.FEES} onClick={() => setChartView(CHART_VIEW.FEES)}>
              Fees
            </OptionButton>
          </AutoRow>
          <AutoRow justify="flex-end" gap="6px">
            <OptionButton
              active={timeWindow === timeframeOptions.WEEK}
              onClick={() => setTimeWindow(timeframeOptions.WEEK)}
            >
              1W
            </OptionButton>
            <OptionButton
              active={timeWindow === timeframeOptions.MONTH}
              onClick={() => setTimeWindow(timeframeOptions.MONTH)}
            >
              1M
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
      <ResponsiveContainer aspect={aspect}>
        {data ? (
          <LineChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }} barCategoryGap={1} data={data}>
            <defs>
              <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.35} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              tickLine={false}
              axisLine={false}
              interval="preserveEnd"
              tickMargin={14}
              tickFormatter={tick => toNiceDate(tick)}
              dataKey="date"
              tick={{ fill: 'black' }}
              type={'number'}
              domain={['dataMin', 'dataMax']}
            />
            <YAxis
              type="number"
              orientation="right"
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

            <Line
              type="monotone"
              dataKey={chartView === CHART_VIEW.VALUE ? 'usdValue' : 'fees'}
              stroke={color}
              yAxisId={0}
              name={chartView === CHART_VIEW.VALUE ? 'Liquidity' : 'Fees Earned (Cumulative)'}
            />
            <Legend content={renderLegend} />
          </LineChart>
        ) : (
          <LocalLoader />
        )}
      </ResponsiveContainer>
    </ChartWrapper>
  )
}

export default PairReturnsChart
