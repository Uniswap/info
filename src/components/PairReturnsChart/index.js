import React, { useState } from 'react'
import styled from 'styled-components'
import { XAxis, Area, YAxis, ResponsiveContainer, Tooltip, AreaChart } from 'recharts'
import { AutoRow, RowBetween } from '../Row'

import { toK, toNiceDate, toNiceDateYear, formattedNum, getTimeframe } from '../../utils'
import { OptionButton } from '../ButtonStyled'
import { useMedia } from 'react-use'
import { timeframeOptions } from '../../constants'
import DropdownSelect from '../DropdownSelect'
import { useUserPositionChart } from '../../contexts/User'
import { useTimeframe } from '../../contexts/Application'
import LocalLoader from '../LocalLoader'
import { darken } from 'polished'
import { useColor } from '../../hooks'

const ChartWrapper = styled.div`
  max-height: 390px;

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

const CHART_VIEW = {
  VALUE: 'Value',
  FEES: 'Fees'
}

const PairReturnsChart = ({ account, position }) => {
  let data = useUserPositionChart(position, account)

  const [chartView, setChartView] = useState(CHART_VIEW.VALUE)

  const [timeWindow, setTimeWindow] = useTimeframe()

  const below600 = useMedia('(max-width: 600px)')

  const color = useColor(position?.pair.token0.id)

  // based on window, get starttime
  let utcStartTime = getTimeframe(timeWindow)
  data = data?.filter(entry => entry.date >= utcStartTime)

  const aspect = below600 ? 60 / 42 : 60 / 16

  return (
    <ChartWrapper>
      {below600 ? (
        <RowBetween mb={40}>
          <DropdownSelect options={CHART_VIEW} active={chartView} setActive={setChartView} />
          <DropdownSelect options={timeframeOptions} active={timeWindow} setActive={setTimeWindow} />
        </RowBetween>
      ) : (
        <OptionsRow>
          <AutoRow gap="6px" style={{ flexWrap: 'nowrap' }}>
            <OptionButton active={chartView === CHART_VIEW.VALUE} onClick={() => setChartView(CHART_VIEW.VALUE)}>
              Liquidity Value
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

      {chartView === CHART_VIEW.VALUE ? (
        <ResponsiveContainer aspect={aspect}>
          {data ? (
            <AreaChart margin={{ top: 0, right: 0, bottom: 6, left: 0 }} barCategoryGap={1} data={data}>
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
                type={'number'}
                domain={['dataMin', 'dataMax']}
              />
              <YAxis
                type="number"
                orientation="left"
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
              <Area
                strokeWidth={2}
                dot={false}
                type="monotone"
                name={'Liquidity Value'}
                dataKey={'usdValue'}
                yAxisId={0}
                stroke={darken(0.12, color)}
                fill="url(#colorUv)"
              />
            </AreaChart>
          ) : (
            <LocalLoader />
          )}
        </ResponsiveContainer>
      ) : (
        <ResponsiveContainer aspect={aspect}>
          {data ? (
            <AreaChart margin={{ top: 0, right: 0, bottom: 6, left: 0 }} barCategoryGap={1} data={data}>
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
                type={'number'}
                domain={['dataMin', 'dataMax']}
              />
              <YAxis
                type="number"
                orientation="left"
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
              <Area
                strokeWidth={2}
                dot={false}
                type="monotone"
                name={'Fees Earned (Cumulative)'}
                dataKey={'fees'}
                yAxisId={0}
                stroke={darken(0.12, color)}
                fill="url(#colorUv)"
              />
            </AreaChart>
          ) : (
            <LocalLoader />
          )}
        </ResponsiveContainer>
      )}
    </ChartWrapper>
  )
}

export default PairReturnsChart
