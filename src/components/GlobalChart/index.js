import React, { useState, useEffect } from 'react'
import { Area, XAxis, YAxis, ResponsiveContainer, Tooltip, AreaChart, BarChart, Bar, CartesianGrid } from 'recharts'
import Row, { RowBetween } from '../Row'
import { toK, toNiceDate, toNiceDateYear } from '../../helpers'
import { OptionButton } from '../ButtonStyled'
import { useMedia } from 'react-use'
import { useTimeframe } from '../../contexts/Application'
import DropdownSelect from '../DropdownSelect'
import { timeframeOptions } from '../../constants'
import { TYPE } from '../../Theme'

const CHART_VIEW = {
  VOLUME: 'Volume',
  LIQUIDITY: 'Liquidity'
}

const GlobalChart = ({ chartData, display }) => {
  const [chartView, setChartView] = useState(display === 'volume' ? CHART_VIEW.VOLUME : CHART_VIEW.LIQUIDITY)
  const [activeWindow, setActiveWindow] = useTimeframe()

  const below1080 = useMedia('(max-width: 1080px)')
  const below600 = useMedia('(max-width: 600px)')

  function toggleView() {
    if (chartView === CHART_VIEW.VOLUME) {
      setChartView(CHART_VIEW.LIQUIDITY)
    } else {
      setChartView(CHART_VIEW.VOLUME)
    }
  }

  return chartData ? (
    <>
      {below600 ? (
        <RowBetween mb={40}>
          <DropdownSelect options={CHART_VIEW} active={chartView} setActive={setChartView} />
          <DropdownSelect options={timeframeOptions} active={activeWindow} setActive={setActiveWindow} />
        </RowBetween>
      ) : (
        <RowBetween marginBottom={'10px'}>
          <Row>
            <OptionButton
              style={{ marginRight: '10px' }}
              active={chartView === CHART_VIEW.LIQUIDITY}
              onClick={!display ? toggleView : () => {}}
              disabled={!!display}
            >
              <TYPE.main fontSize={'1rem'}>{chartView}</TYPE.main>
            </OptionButton>
          </Row>
          <Row justify="flex-end">
            <OptionButton
              style={{ marginRight: '10px' }}
              active={activeWindow === timeframeOptions.WEEK}
              onClick={() => setActiveWindow(timeframeOptions.WEEK)}
            >
              1 Week
            </OptionButton>
            <OptionButton
              style={{ marginRight: '10px' }}
              active={activeWindow === timeframeOptions.MONTH}
              onClick={() => setActiveWindow(timeframeOptions.MONTH)}
            >
              1 Month
            </OptionButton>
            <OptionButton
              active={activeWindow === timeframeOptions.ALL_TIME}
              onClick={() => setActiveWindow(timeframeOptions.ALL_TIME)}
            >
              All Time
            </OptionButton>
          </Row>
        </RowBetween>
      )}
      {chartView === CHART_VIEW.LIQUIDITY && (
        <ResponsiveContainer aspect={below1080 ? 60 / 28 : 60 / 28}>
          <AreaChart margin={{ top: 20, right: 0, bottom: 6, left: 0 }} barCategoryGap={1} data={chartData}>
            <defs>
              <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ff007a" stopOpacity={1} />
                <stop offset="95%" stopColor="#ff007a" stopOpacity={0.5} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis
              tickLine={true}
              axisLine={true}
              interval="preserveEnd"
              tickMargin={16}
              minTickGap={50}
              tickFormatter={tick => toNiceDate(tick)}
              dataKey="date"
              mirror={true}
              tick={{ fill: 'black' }}
              padding={{ right: 40, bottom: 0 }}
            />
            <YAxis
              type="number"
              orientation="right"
              tickFormatter={tick => '$' + toK(tick)}
              axisLine={true}
              tickLine={true}
              interval={0}
              minTickGap={50}
              yAxisId={0}
              mirror={true}
              padding={{ top: 0, bottom: 0 }}
              tick={{ fill: 'black' }}
              hide={below600}
              contentStyle={{
                zIndex: '100'
              }}
            />
            <Tooltip
              cursor={{ stroke: 'white', strokeWidth: 1 }}
              formatter={val => '$' + toK(val, true)}
              labelFormatter={label => toNiceDateYear(label)}
              labelStyle={{ paddingTop: 4 }}
              contentStyle={{
                padding: '10px 14px',
                borderRadius: 10,
                borderColor: '#ff007a80',
                color: 'black'
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
      {chartView === CHART_VIEW.VOLUME && (
        <ResponsiveContainer aspect={60 / 28}>
          <BarChart margin={{ top: 20, right: 0, bottom: 6, left: 0 }} barCategoryGap={1} data={chartData}>
            <XAxis
              tickLine={false}
              axisLine={false}
              interval="preserveEnd"
              minTickGap={80}
              tickMargin={14}
              tickFormatter={tick => toNiceDate(tick)}
              dataKey="date"
              tick={{ fill: 'black' }}
              mirror={true}
              padding={{ right: 40, bottom: 0 }}
            />
            <YAxis
              type="number"
              axisLine={true}
              tickMargin={0}
              tickFormatter={tick => '$' + toK(tick, true, true)}
              tickLine={true}
              interval="preserveEnd"
              minTickGap={20}
              padding={{ top: 0, bottom: 0 }}
              mirror={true}
              yAxisId={0}
              tick={{ fill: 'black' }}
              domain={[0, 'dataMax']}
              orientation={'right'}
            />
            <CartesianGrid strokeDasharray="3 3" />

            <Tooltip
              cursor={{ fill: '#ff007a', opacity: 0.1 }}
              formatter={val => '$' + toK(val, true)}
              labelFormatter={label => toNiceDateYear(label)}
              labelStyle={{ paddingTop: 4 }}
              contentStyle={{
                padding: '10px 14px',
                borderRadius: 10,
                borderColor: '#ff007a80',
                color: 'black'
              }}
              wrapperStyle={{ top: -70, left: -10 }}
            />
            <Bar
              type="monotone"
              name={'Volume'}
              dataKey={'dailyVolumeUSD'}
              fill="#ff007a80"
              opacity={'1'}
              yAxisId={0}
              stroke={'#ff007a'}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </>
  ) : (
    ''
  )
}

export default GlobalChart
