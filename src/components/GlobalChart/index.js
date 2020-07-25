import React, { useState, useMemo, useEffect } from 'react'
import { Area, XAxis, YAxis, ResponsiveContainer, Tooltip, AreaChart, BarChart, Bar } from 'recharts'
import Row, { RowBetween, RowFixed } from '../Row'
import { toK, toNiceDate, toWeeklyDate, toNiceDateYear, formattedNum, formattedPercent } from '../../utils'
import { OptionButton } from '../ButtonStyled'
import { useMedia } from 'react-use'
import { useTimeframe } from '../../contexts/Application'
import DropdownSelect from '../DropdownSelect'
import { timeframeOptions } from '../../constants'
import { TYPE } from '../../Theme'
import { useGlobalChartData, useGlobalData } from '../../contexts/GlobalData'
import dayjs from 'dayjs'
import styled from 'styled-components'
import { ChevronDown as Arrow } from 'react-feather'

const CHART_VIEW = {
  VOLUME: 'Volume',
  LIQUIDITY: 'Liquidity'
}

const VOLUME_WINDOW = {
  WEEKLY: 'WEEKLY',
  DAYS: 'DAYS'
}

const Select = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  width: fit-content;
  height: 24px;
  /* border-radius: 20px; */
  font-weight: 400;
  font-size: 14px;
  color: ${({ theme }) => theme.text3};

  :hover {
    cursor: pointer;
  }

  @media screen and (max-width: 40em) {
    display: none;
  }
`

const ArrowStyled = styled(Arrow)`
  height: 20px;
  width: 20px;
  margin-left: 6px;
`

const Option = styled.div`
  padding: 0.5rem;
  border-radius: 12px;
  background-color: ${({ theme }) => theme.bg2};
  color: ${({ theme }) => theme.textColor};
  position: absolute;
  top: 32px;
  display: grid;
  grid-gap: 8px;
  z-index: 99;
`

const GlobalChart = ({ display }) => {
  // chart options
  const [chartView, setChartView] = useState(display === 'volume' ? CHART_VIEW.VOLUME : CHART_VIEW.LIQUIDITY)

  const [volumeWindow, setVolumeWindow] = useState(VOLUME_WINDOW.DAYS)

  // local window used for this chart only, global window for all data detching
  const [globalWindow, setGlobalWindow] = useTimeframe()
  const [localWindow, setLocalWindow] = useState(globalWindow)

  // global historical data
  const [chartData, weeklyData] = useGlobalChartData()
  const { totalLiquidityUSD, oneDayVolumeUSD, volumeChangeUSD, liquidityChangeUSD } = useGlobalData()
  const [showVolDropdown, toggleVolDropdown] = useState(false)
  const [showVolTimeDropdown, toggleVolTimeDropdown] = useState(false)

  const volume = oneDayVolumeUSD ? formattedNum(oneDayVolumeUSD, true) : ''
  const volumeChange = volumeChangeUSD ? formattedPercent(volumeChangeUSD) : ''

  const liquidity = totalLiquidityUSD ? formattedNum(totalLiquidityUSD, true) : '-'
  const liquidityChange = liquidityChangeUSD ? formattedPercent(liquidityChangeUSD) : '-'

  let utcEndTime = dayjs.utc()
  useEffect(() => {
    setGlobalWindow(localWindow)
  }, [localWindow, setGlobalWindow])
  // based on window, get starttime
  let utcStartTime
  switch (localWindow) {
    case timeframeOptions.WEEK:
      utcStartTime =
        utcEndTime
          ?.subtract(1, 'week')
          .startOf('day')
          .unix() - 1
      break
    case timeframeOptions.ALL_TIME:
      utcStartTime = utcEndTime?.subtract(1, 'year').unix() - 1
      break
    default:
      utcStartTime =
        utcEndTime
          ?.subtract(1, 'year')
          .startOf('year')
          .unix() - 1
      break
  }

  const domain = chartData && [dataMin => (parseFloat(dataMin) > utcStartTime ? dataMin : utcStartTime), 'dataMax']

  const below1080 = useMedia('(max-width: 1080px)')
  const below600 = useMedia('(max-width: 600px)')

  const chartDataFiltered = useMemo(() => {
    return (
      chartData &&
      Object.keys(chartData)
        ?.map(key => {
          let item = chartData[key]
          if (item.date > utcStartTime) {
            return item
          } else {
            return
          }
        })
        .filter(item => {
          return !!item
        })
    )
  }, [chartData, utcStartTime])

  return chartData ? (
    <>
      {below600 ? (
        <RowBetween mb={40}>
          <DropdownSelect options={CHART_VIEW} active={chartView} setActive={setChartView} color={'#ff007a'} />
          <DropdownSelect
            options={timeframeOptions}
            active={localWindow}
            setActive={setLocalWindow}
            color={'#ff007a'}
          />
        </RowBetween>
      ) : (
        <>
          <RowBetween marginBottom={'1rem'}>
            <TYPE.light>{chartView}</TYPE.light>
            <RowFixed>
              {chartView === CHART_VIEW.VOLUME && (
                <Select style={{ marginRight: '1rem' }}>
                  <Row onClick={() => toggleVolDropdown(!showVolDropdown)}>
                    {volumeWindow === VOLUME_WINDOW.WEEKLY ? 'Weekly' : 'Daily'} <ArrowStyled />
                  </Row>
                  {showVolDropdown && (
                    <Option
                      onClick={() => {
                        toggleVolDropdown(!showVolDropdown)
                      }}
                    >
                      <OptionButton
                        active={volumeWindow === VOLUME_WINDOW.DAYS}
                        onClick={() => setVolumeWindow(VOLUME_WINDOW.DAYS)}
                      >
                        <TYPE.pink faded={volumeWindow === VOLUME_WINDOW.WEEKLY}>Daily</TYPE.pink>
                      </OptionButton>
                      <OptionButton
                        active={volumeWindow === VOLUME_WINDOW.WEEKLY}
                        onClick={() => setVolumeWindow(VOLUME_WINDOW.WEEKLY)}
                      >
                        <TYPE.pink faded={volumeWindow === VOLUME_WINDOW.DAYS}>Weekly</TYPE.pink>
                      </OptionButton>
                    </Option>
                  )}
                </Select>
              )}
              <Select>
                <Row onClick={() => toggleVolTimeDropdown(!showVolTimeDropdown)}>
                  {localWindow} <ArrowStyled />
                </Row>
                {showVolTimeDropdown && (
                  <Option
                    onClick={() => {
                      toggleVolTimeDropdown(!showVolTimeDropdown)
                    }}
                  >
                    <OptionButton
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
                  </Option>
                )}
              </Select>
            </RowFixed>
          </RowBetween>
          <Row>
            <TYPE.main fontSize={'1.5rem'} lineHeight={1} fontWeight={500} mr={2}>
              {chartView === CHART_VIEW.LIQUIDITY ? liquidity : volume}
            </TYPE.main>
            <TYPE.main fontSize={14}>{chartView === CHART_VIEW.LIQUIDITY ? liquidityChange : volumeChange}</TYPE.main>
          </Row>
        </>
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
              // mirror={true}
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
              // mirror={true}
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
            data={volumeWindow === VOLUME_WINDOW.DAYS ? chartDataFiltered : weeklyData}
            barCategoryGap={0}
          >
            <XAxis
              tickLine={false}
              axisLine={true}
              interval="preserveStartEnd"
              tickMargin={14}
              tickFormatter={tick =>
                volumeWindow === VOLUME_WINDOW.WEEKLY ? toWeeklyDate(tick - 1) : toNiceDate(tick)
              }
              dataKey="date"
              tick={{ fill: 'black' }}
              padding={{ right: 0, bottom: 0 }}
              allowDataOverflow={true}
              minTickGap={80}
            />

            <YAxis
              axisLine={true}
              tickFormatter={tick => '$' + toK(tick, true, true)}
              tickLine={true}
              interval="preserveEnd"
              minTickGap={20}
              padding={{ top: 0, bottom: 0, left: 20 }}
              yAxisId={0}
              tick={{ fill: 'black' }}
              domain={[0, 'dataMax']}
              orientation={'right'}
            />
            <Tooltip
              cursor={{ fill: '#ff007a', opacity: 0.1 }}
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
