import React, { useState, useMemo, useEffect, useRef } from 'react'
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
import CustomChart from '../CustomChartVolume'
import CustomChartArea from '../CustomChartArea'

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
            <div />
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
          {/* <Row>
            <TYPE.main fontSize={'1.5rem'} lineHeight={1} fontWeight={500} mr={2}>
              {chartView === CHART_VIEW.LIQUIDITY ? liquidity : volume}
            </TYPE.main>
            <TYPE.main fontSize={14}>{chartView === CHART_VIEW.LIQUIDITY ? liquidityChange : volumeChange}</TYPE.main>
          </Row> */}
        </>
      )}

      {chartData && chartView === CHART_VIEW.LIQUIDITY && (
        <ResponsiveContainer aspect={below1080 ? 60 / 28 : 60 / 28}>
          <CustomChartArea data={chartDataFiltered} base={totalLiquidityUSD} baseChange={liquidityChangeUSD} />
        </ResponsiveContainer>
      )}
      {chartData && chartView === CHART_VIEW.VOLUME && (
        <ResponsiveContainer aspect={60 / 28}>
          <CustomChart data={chartDataFiltered} base={oneDayVolumeUSD} baseChange={volumeChangeUSD} />
        </ResponsiveContainer>
      )}
    </>
  ) : (
    ''
  )
}

export default GlobalChart
