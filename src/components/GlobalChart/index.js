import React, { useState, useEffect } from 'react'
import { Area, XAxis, YAxis, ResponsiveContainer, Tooltip, AreaChart, BarChart, Bar } from 'recharts'
import Row, { RowBetween } from '../Row'
import { toK, toNiceDate, toWeeklyDate, toNiceDateYear } from '../../helpers'
import { OptionButton } from '../ButtonStyled'
import { useMedia } from 'react-use'
import { useTimeframe } from '../../contexts/Application'
import DropdownSelect from '../DropdownSelect'
import { timeframeOptions } from '../../constants'
import { TYPE } from '../../Theme'
import { useGlobalChartData } from '../../contexts/GlobalData'
import dayjs from 'dayjs'

const CHART_VIEW = {
  VOLUME: 'Volume',
  LIQUIDITY: 'Liquidity'
}

const VOLUME_WINDOW = {
  WEEKLY: 'WEEKLY',
  DAYS: 'DAYS'
}

const GlobalChart = ({ display }) => {
  // chart options
  const [chartView, setChartView] = useState(display === 'volume' ? CHART_VIEW.VOLUME : CHART_VIEW.LIQUIDITY)

  const [volumeWindow, setVolumeWindow] = useState(VOLUME_WINDOW.DAYS)

  // local window used for this chart only, global window for all data detching
  const [globalWindow, setGlobalWindow] = useTimeframe()
  const [localWindow, setLocalWindow] = useState(globalWindow)

  // global historical data
  const [chartData, weeklyData] = useGlobalChartData()

  // switch between voluem and liquidity on larger screens
  function toggleView() {
    if (chartView === CHART_VIEW.VOLUME) {
      setChartView(CHART_VIEW.LIQUIDITY)
    } else {
      setChartView(CHART_VIEW.VOLUME)
    }
  }

  // update the app time window so it can fetch more points if needed
  useEffect(() => {
    setGlobalWindow(localWindow)
  }, [localWindow, setGlobalWindow])

  // find start time based on required time window, update domain
  const utcEndTime = dayjs.utc()
  // based on window, get starttime
  let utcStartTime
  switch (localWindow) {
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

  const domain = chartData && [dataMin => (dataMin > utcStartTime ? dataMin : utcStartTime), 'dataMax']

  const below1080 = useMedia('(max-width: 1080px)')
  const below600 = useMedia('(max-width: 600px)')

  return chartData ? (
    <>
      {below600 ? (
        <RowBetween mb={40}>
          <DropdownSelect options={CHART_VIEW} active={chartView} setActive={setChartView} />
          <DropdownSelect options={timeframeOptions} active={localWindow} setActive={setLocalWindow} />
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
            {chartView === CHART_VIEW.VOLUME && (
              <OptionButton
                style={{ marginRight: '0px' }}
                active={volumeWindow === VOLUME_WINDOW.DAYS}
                onClick={() => setVolumeWindow(VOLUME_WINDOW.DAYS)}
              >
                <TYPE.pink faded={volumeWindow === VOLUME_WINDOW.WEEKLY}>Daily</TYPE.pink>
              </OptionButton>
            )}
            {chartView === CHART_VIEW.VOLUME && (
              <OptionButton
                active={volumeWindow === VOLUME_WINDOW.WEEKLY}
                onClick={() => setVolumeWindow(VOLUME_WINDOW.WEEKLY)}
              >
                <TYPE.pink faded={volumeWindow === VOLUME_WINDOW.DAYS}>Weekly</TYPE.pink>
              </OptionButton>
            )}
            <OptionButton
              style={{ marginRight: '0px', marginLeft: '20px' }}
              active={localWindow === timeframeOptions.WEEK}
              onClick={() => setLocalWindow(timeframeOptions.WEEK)}
            >
              1 Week
            </OptionButton>
            <OptionButton
              active={localWindow === timeframeOptions.ALL_TIME}
              onClick={() => setLocalWindow(timeframeOptions.ALL_TIME)}
            >
              All Time
            </OptionButton>
          </Row>
        </RowBetween>
      )}
      {chartData && chartView === CHART_VIEW.LIQUIDITY && (
        <ResponsiveContainer aspect={below1080 ? 60 / 28 : 60 / 28}>
          <AreaChart margin={{ top: 20, right: 0, bottom: 6, left: 0 }} barCategoryGap={1} data={chartData}>
            <Area
              key={'other'}
              dataKey={'totalLiquidityUSD'}
              stackId="2"
              strokeWidth={1}
              stroke={'#ff007a'}
              dot={false}
              type="monotone"
              name={'Liquidity'}
              yAxisId={0}
              opacity={'1'}
              isAnimationActive={false}
              fill="#ff007a80"
            />
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
              padding={{ right: 0, bottom: 0 }}
              type={'number'}
              domain={domain}
            />
            <YAxis
              type="number"
              orientation="right"
              tickFormatter={tick => '$' + toK(tick)}
              axisLine={true}
              tickLine={true}
              interval="preserveEnd"
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
          </AreaChart>
        </ResponsiveContainer>
      )}
      {chartData && chartView === CHART_VIEW.VOLUME && (
        <ResponsiveContainer aspect={60 / 28}>
          <BarChart
            margin={{ top: 20, right: 0, bottom: 6, left: 0 }}
            data={volumeWindow === VOLUME_WINDOW.DAYS ? chartData : weeklyData}
            barCategoryGap={0}
          >
            <XAxis
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
              tickMargin={14}
              tickFormatter={tick =>
                volumeWindow === VOLUME_WINDOW.WEEKLY ? toWeeklyDate(tick - 1) : toNiceDate(tick)
              }
              dataKey="date"
              tick={{ fill: 'black' }}
              mirror={true}
              padding={{ right: 0, bottom: 0 }}
              type={'number'}
              domain={domain}
              minTickGap={80}
            />

            <YAxis
              axisLine={true}
              tickMargin={16}
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
            <Tooltip
              cursor={{ fill: '#ff007a', opacity: 0.4 }}
              formatter={val => '$' + toK(val, true)}
              labelFormatter={label =>
                volumeWindow === VOLUME_WINDOW.WEEKLY ? toWeeklyDate(label - 1) : toNiceDateYear(label)
              }
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
              dataKey={volumeWindow === VOLUME_WINDOW.DAYS ? 'dailyVolumeUSD' : 'weeklyVolumeUSD'}
              fill="#ff007a"
              opacity={'0.5'}
              yAxisId={0}
              strokeWidth={2}
              stroke={'#ff007a'}
              isAnimationActive={false}
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
