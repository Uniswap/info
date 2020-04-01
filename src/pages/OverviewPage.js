import React, { useState } from 'react'
import { useMedia } from 'react-use'
import { Box, Flex, Text } from 'rebass'
import styled from 'styled-components'
import FourByFour from '../components/FourByFour'
import Panel from '../components/Panel'
import Select from '../components/Select'
import Footer from '../components/Footer'
import OverviewList from '../components/OverviewList'
import OverviewChart from '../components/OverviewChart'
import Loader from '../components/Loader'
import { formattedNum } from '../helpers'
import { Divider, Hint } from '../components'
import { getTimeFrame, timeframeOptions, windowOptions, getTimeWindow } from '../constants'

const SmallText = styled.span`
  font-size: 0.6em;
`

const ThemedBackground = styled(Box)`
  position: absolute;
  height: 365px;
  z-index: -1;
  top: 0;
  width: 100vw;

  @media screen and (max-width: 64em) {
    height: 559px;
  }

  ${props => !props.last}
`

const TopPanel = styled(Panel)`
  background-color: rgba(255, 255, 255, 0.15);
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  @media screen and (max-width: 64em) {
    width: 100%;
    border-radius: 0

    &:nth-of-type(3) {
      margin-bottom: 20px;
      border-radius: 0 0 1em 1em;
    }

    &:first-of-type {
      border-radius: 1em 1em 0 0;
    }
  }
`

const TextOption = styled(Text)`
  &:hover {
    cursor: pointer;
  }
`

const TokenHeader = styled(Box)`
  color: white;
  font-weight: 600;
  font-size: 32px;
  width: 100%;
  padding: 20px;
  padding-top: 24px;
  padding-bottom: 20px;
  display: flex;
  margin: auto;
  max-width: 1240px;
  flex-direction: column;
  align-items: flex-start;

  @media screen and (min-width: 64em) {
    display: flex;
    flex-direction: row;
    font-size: 32px;
    align-items: flex-end;
    justify-content: flex-start;
    padding-left: 2.5rem;
    padding-right: 24px;
    max-width: 1320px;
  }
`

const ChartWrapper = styled(Panel)`
  boxshadow: 0px 4px 20px rgba(239, 162, 250, 0.15);

  @media screen and (max-width: 64em) {
    margin-bottom: 20px;
    border-radius: 12px;
  }
`

const OverviewDashboard = styled(Box)`
  width: 100%;
  display: grid;
  padding-right: 10px;
  padding-left: 10px;
  grid-template-columns: 100%;
  grid-template-areas:
    'volume'
    'liquidity'
    'shares'
    'statistics'
    'exchange'
    'transactions';

  @media screen and (min-width: 64em) {
    max-width: 1280px;
    grid-gap: 24px;
    padding-right: 20px;
    padding-left: 20px;
    width: 100%;
    grid-template-columns: 1fr 1fr 1fr;
    grid-template-areas:
      'volume  liquidity  shares '
      'statistics  statistics statistics'
      'statistics  statistics statistics'
      'listOptions listOptions listOptions'
      'transactions  transactions transactions';
  }
`

const DashboardWrapper = styled.div`
  width: calc(100% - 40px);
  padding-left: 20px;
  padding-right: 20px;

  @media screen and (max-width: 40em) {
    width: 100%;
    padding: 0;
  }
`

function getPercentSign(value) {
  const parsedValue = parseFloat(value)
  return (
    <Text fontSize={14} lineHeight={1.2} color="white">
      {parsedValue < 0 ? value + '% ↓' : parsedValue === 0 ? value + '%' : value + '% ↑'}
    </Text>
  )
}

const FloatRight = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
  margin-top: 1rem;
  font-size: 10px;
  color: #333333;
  font-weight: 500;
`

export const OverviewPage = function({
  exchangeAddress,
  uniswapHistory,
  currencyUnit,
  globalData,
  updateTimeframe,
  historyDaysToQuery,
  monthlyHistory,
  weeklyHistory,
  timeWindow,
  setTimeWindow
}) {
  const [chartOption, setChartOption] = useState('liquidity')

  const belowSmall = useMedia('(max-width: 40em)')

  return (
    <div style={{ marginTop: '0px' }}>
      <ThemedBackground bg="black" />
      {globalData ? (
        <DashboardWrapper>
          <TokenHeader>
            <div>Uniswap Overview</div>
          </TokenHeader>
          <OverviewDashboard mx="auto" px={[0, 3]}>
            <TopPanel rounded color="white" p={24} style={{ gridArea: 'volume' }}>
              <FourByFour
                topLeft={<Hint color="textLight">Volume (24hrs)</Hint>}
                bottomLeft={
                  <Text fontSize={24} lineHeight={1} fontWeight={500}>
                    {currencyUnit === 'USD'
                      ? '$' + formattedNum(parseFloat(globalData.dailyVolumeUSD), true)
                      : 'Ξ ' + formattedNum(parseFloat(globalData.dailyVolumeETH))}
                    {currencyUnit !== 'USD' ? <SmallText> ETH</SmallText> : ''}
                  </Text>
                }
                bottomRight={
                  globalData.volumePercentChange && isFinite(globalData.volumePercentChange) ? (
                    <div>
                      {currencyUnit === 'USD'
                        ? getPercentSign(globalData.volumePercentChangeUSD)
                        : getPercentSign(globalData.volumePercentChange)}
                    </div>
                  ) : (
                    ''
                  )
                }
              />
            </TopPanel>
            <TopPanel rounded color="white" p={24} style={{ gridArea: 'liquidity' }}>
              <FourByFour
                topLeft={<Hint color="textLight">Total Liquidity</Hint>}
                bottomLeft={
                  <Text fontSize={24} lineHeight={1} fontWeight={500}>
                    {globalData.liquidityEth
                      ? currencyUnit !== 'USD'
                        ? 'Ξ ' + formattedNum(parseFloat(globalData.liquidityEth))
                        : '$' + formattedNum(parseFloat(globalData.liquidityUsd), true)
                      : '-'}
                    {currencyUnit === 'USD' ? '' : <SmallText> ETH</SmallText>}
                  </Text>
                }
                bottomRight={
                  globalData.liquidityPercentChange ? (
                    <div>
                      {currencyUnit === 'USD'
                        ? getPercentSign(globalData.liquidityPercentChangeUSD)
                        : getPercentSign(globalData.liquidityPercentChange)}
                    </div>
                  ) : (
                    ''
                  )
                }
              />
            </TopPanel>
            <TopPanel rounded bg="white" color="white" style={{ gridArea: 'shares' }} p={24}>
              <FourByFour
                topLeft={<Hint color="textLight">Transactions (24hrs)</Hint>}
                bottomLeft={
                  <Text fontSize={24} lineHeight={1} fontWeight={500}>
                    {formattedNum(globalData.txCount)}
                  </Text>
                }
                bottomRight={
                  globalData.txCountPercentChange ? <div>{getPercentSign(globalData.txCountPercentChange)}</div> : ''
                }
              />
            </TopPanel>
            <ChartWrapper rounded bg="white" area="statistics">
              <Box p={24}>
                <Flex height={18} alignItems="center" justifyContent="space-between">
                  <Flex alignItems="center" justifyContent="space-between">
                    <TextOption
                      color={chartOption === 'liquidity' ? 'inherit' : 'grey'}
                      onClick={e => {
                        setChartOption('liquidity')
                      }}
                    >
                      Liquidity
                    </TextOption>
                    <TextOption
                      style={{ marginLeft: '2em' }}
                      color={chartOption === 'volume' ? 'inherit' : 'grey'}
                      onClick={e => {
                        setChartOption('volume')
                      }}
                    >
                      Volume
                    </TextOption>
                  </Flex>
                  <Flex>
                    {chartOption === 'volume' && !belowSmall && (
                      <Box width={144}>
                        <Select
                          placeholder="Window"
                          options={windowOptions}
                          defaultValue={getTimeWindow(timeWindow)}
                          onChange={select => {
                            setTimeWindow(select.value)
                          }}
                          customStyles={{ backgroundColor: 'white' }}
                        />
                      </Box>
                    )}
                    <Box width={144}>
                      <Select
                        placeholder="Timeframe"
                        options={timeframeOptions}
                        defaultValue={getTimeFrame(historyDaysToQuery)}
                        onChange={select => {
                          updateTimeframe(select.value)
                        }}
                        customStyles={{ backgroundColor: 'white' }}
                      />
                    </Box>
                  </Flex>
                </Flex>
              </Box>
              <Divider />
              <Box p={24} style={{ boxShadow: '0px 4px 20px rgba(239, 162, 250, 0.15)', borderRadius: '10px' }}>
                {uniswapHistory && uniswapHistory.length > 0 ? (
                  <OverviewChart
                    data={uniswapHistory}
                    currencyUnit={currencyUnit}
                    chartOption={chartOption}
                    monthlyHistory={monthlyHistory}
                    weeklyHistory={weeklyHistory}
                    timeWindow={timeWindow}
                  />
                ) : (
                  <Loader />
                )}
                <FloatRight>UTC±00:00</FloatRight>
              </Box>
            </ChartWrapper>
            <Panel rounded bg="white" area="transactions">
              <OverviewList currencyUnit={currencyUnit} />
            </Panel>
          </OverviewDashboard>
        </DashboardWrapper>
      ) : (
        ''
      )}
      <Footer />
    </div>
  )
}
