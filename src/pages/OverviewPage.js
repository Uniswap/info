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
import { Divider, Hint } from '../components'

import { Parallax } from 'react-scroll-parallax'

const timeframeOptions = [
  { value: '1week', label: '1 week' },
  { value: '1month', label: '1 month' },
  { value: '3months', label: '3 months' },
  { value: 'all', label: 'All time' }
]

const SmallText = styled.span`
  font-size: 0.6em;
`

const ThemedBackground = styled(Box)`
  position: absolute;
  height: 387px;
  z-index: -1;
  top: 0;
  width: 100vw;

  @media screen and (max-width: 64em) {
    height: 489px;
  }

  ${props => !props.last}
`

const TopPanel = styled(Panel)`
  background-color: rgba(255, 255, 255, 0.15);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100px;

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
  width: calc(100% - 20px);
  padding-left: 10px;
  padding-right: 10px;

  @media screen and (max-width: 40em) {
    width: 100%;
    padding: 0;
  }
`

function getPercentSign(value) {
  return (
    <Text fontSize={14} lineHeight={1.4} color="white">
      {value < 0 ? value + ' ↓' : value === 0 ? value : value + ' ↑'}
    </Text>
  )
}

export const OverviewPage = function({
  exchangeAddress,
  currencyUnit,
  globalData,
  symbol,
  price,
  invPrice,
  switchActiveExchange,
  priceUSD,
  uniswapHistory,
  updateTimeframe
}) {
  const [chartOption, setChartOption] = useState('liquidity')

  function formattedNum(num, usd = false) {
    if (num === 0) {
      return 0
    }
    if (num < 0.0001) {
      return '< 0.0001'
    }
    if (usd && num >= 0.01) {
      return Number(parseFloat(num).toFixed(2)).toLocaleString()
    }
    return Number(parseFloat(num).toFixed(4)).toLocaleString()
  }

  const belowMedium = useMedia('(max-width: 64em)')

  const belowSmall = useMedia('(max-width: 40em)')

  return (
    <div style={{ marginTop: '40px' }}>
      <ThemedBackground bg="black" />
      {globalData ? (
        // <Parallax y={belowMedium ? [0, 0] : ['400px', '-400px']}>
        <DashboardWrapper>
          <OverviewDashboard mx="auto" px={[0, 3]}>
            <TopPanel rounded color="white" p={24} style={{ gridArea: 'volume' }}>
              <FourByFour
                topLeft={<Hint color="textLight">Volume (24hrs)</Hint>}
                bottomLeft={
                  <Text fontSize={24} lineHeight={1.4} fontWeight={500}>
                    {invPrice && price && priceUSD
                      ? currencyUnit === 'USD'
                        ? '$' + formattedNum(parseFloat(globalData.dailyVolumeUSD).toFixed(0), true)
                        : 'Ξ ' + formattedNum(parseFloat(globalData.dailyVolumeETH).toFixed(0))
                      : '-'}
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
                  <Text fontSize={24} lineHeight={1.4} fontWeight={500}>
                    {globalData.liquidityEth
                      ? currencyUnit !== 'USD'
                        ? 'Ξ ' + formattedNum(parseFloat(globalData.liquidityEth).toFixed(0))
                        : '$' + formattedNum(parseFloat(globalData.liquidityUsd).toFixed(0), true)
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
                  <Text fontSize={24} lineHeight={1.4} fontWeight={500}>
                    {formattedNum(globalData.txCount)}
                  </Text>
                }
                bottomRight={globalData.txPercentChange ? <div>{getPercentSign(globalData.txPercentChange)}</div> : ''}
              />
            </TopPanel>
            <ChartWrapper rounded bg="white" area="statistics">
              <Box p={24}>
                <Flex alignItems="center" justifyContent="space-between">
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
                  <Box width={144}>
                    <Select
                      placeholder="Timeframe"
                      options={timeframeOptions}
                      defaultValue={timeframeOptions[3]}
                      onChange={select => {
                        updateTimeframe(select.value)
                      }}
                      customStyles={{ backgroundColor: 'white' }}
                    />
                  </Box>
                </Flex>
              </Box>
              <Divider />
              <Box p={24} style={{ boxShadow: '0px 4px 20px rgba(239, 162, 250, 0.15)' }}>
                {uniswapHistory && uniswapHistory.length > 0 ? (
                  <OverviewChart
                    symbol={symbol}
                    exchangeAddress={exchangeAddress}
                    data={uniswapHistory}
                    currencyUnit={currencyUnit}
                    chartOption={chartOption}
                  />
                ) : (
                  <Loader />
                )}
              </Box>
            </ChartWrapper>
            <Panel rounded bg="white" area="transactions">
              <OverviewList
                currencyUnit={currencyUnit}
                price={price}
                switchActiveExchange={switchActiveExchange}
                priceUSD={priceUSD}
                tokenSymbol={symbol}
                exchangeAddress={exchangeAddress}
              />
            </Panel>
          </OverviewDashboard>
        </DashboardWrapper>
      ) : (
        // </Parallax>
        ''
      )}
      <Footer />
    </div>
  )
}
