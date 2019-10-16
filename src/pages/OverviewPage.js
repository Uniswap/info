import React, { useState, useEffect } from 'react'
import { Box, Flex, Text } from 'rebass'
import styled from 'styled-components'
import FourByFour from '../components/FourByFour'
import Panel from '../components/Panel'
import Select from '../components/Select'
import Footer from '../components/Footer'
import OverviewList from '../components/OverviewList'
import Chart from '../components/Chart'
import Loader from '../components/Loader'
import { Divider, Hint } from '../components'

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
  height: 396px;
  z-index: -1;
  top: 0;
  width: 100vw;

  @media screen and (max-width: 40em) {
    height: 600px;
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
    background-color: #2b2b2b;
    border-radius: 0

    &:nth-of-type(3) {
      height: 110px;
      margin-bottom: -10px;
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

const ListOptions = styled(Flex)`
  flex-direction: row;
  padding-left: 40px;
  height: 40px
  justify-content: space-between;
  align-items; center;
  width: 100%;

  @media screen and (max-width: 64em) {
    display: none;
  }
  
`

const OptionsWrappper = styled(Flex)`
  align-items: center;
  & > * {
    margin-right: 1em;
    &:hover {
      cursor: pointer;
      color: black;
    }
  }
`

const AccountSearch = styled.input`
  font-size: 14px;
  border: none;
  outline: none;
  width: 90%;
  &:focus {
    outline: none;
  }
`

const AccountSearchWrapper = styled.div`
  width: 390px;
  background-color: white;
  border-radius: 40px;
  height: 40px;
  color: #6c7284;
  padding: 0 0.5em 0 1em;
  display: flex;
  align-items: center;
  justify-content: space-between;

  @media screen and (max-width: 64em) {
    display: none;
  }
`

const EmojiWrapper = styled.span`
  width: 10%;
  &:hover {
    cursor: pointer;
  }
`

const ChartWrapper = styled(Panel)`
  @media screen and (max-width: 64em) {
    display: none;
  }
`

const OverviewDashboard = styled(Box)`
  max-width: 100vw;
  display: grid;
  grid-template-columns: 1fr;
  grid-template-areas:
    'volume'
    'liquidity'
    'shares'
    'exchange'
    'transactions';
    'statistics';

  @media screen and (min-width: 64em) {
    max-width: 1280px;
    grid-gap: 24px;
    width: 100%;
    grid-template-columns: 1fr 1fr 1fr;
    grid-template-areas:
      'volume  liquidity  shares '
      'statistics  statistics statistics'
      'listOptions listOptions listOptions'
      'transactions  transactions transactions';
  }
`

function getPercentColor(value) {
  if (value < 0) {
    return (
      <Text fontSize={14} lineHeight={1.4} color="white">
        {value}% ↓
      </Text>
    )
  }
  if (parseFloat(value) === 0) {
    return (
      <Text fontSize={14} lineHeight={1.4} color="white">
        {value}%
      </Text>
    )
  }
  return (
    <Text fontSize={14} lineHeight={1.4} color="white">
      {value}% ↑
    </Text>
  )
}

export const OverviewPage = function({
  exchangeAddress,
  currencyUnit,
  symbol,
  tradeVolume,
  pricePercentChange,
  volumePercentChange,
  liquidityPercentChange,
  tokenName,
  ethLiquidity,
  price,
  invPrice,
  priceUSD,
  chartData,
  tokenAddress,
  updateTimeframe
}) {
  const [chartOption, setChartOption] = useState('liquidity')

  const [txCount, setTxCount] = useState('-')

  const [txFilter, setTxFilter] = useState('All')

  const [accountInput, setAccountInput] = useState('')

  useEffect(() => {
    setTxCount('-')
  }, [exchangeAddress])

  function formattedNum(num, decimals) {
    let number = Number(parseFloat(num).toFixed(decimals)).toLocaleString()
    if (number < 0.0001) {
      return '< 0.0001'
    }
    return number
  }

  return (
    <div style={{ marginTop: '40px' }}>
      <ThemedBackground bg="black" />
      <OverviewDashboard mx="auto" px={[0, 3]}>
        <TopPanel rounded color="white" p={24} style={{ gridArea: 'volume' }}>
          <FourByFour
            topLeft={<Hint color="textLight">Volume (24hrs)</Hint>}
            bottomLeft={
              <Text fontSize={24} lineHeight={1.4} fontWeight={500}>
                {invPrice && price && priceUSD
                  ? currencyUnit === 'USD'
                    ? '$' + formattedNum(tradeVolume * price * priceUSD, 2)
                    : 'Ξ ' + formattedNum(tradeVolume, 4)
                  : '-'}
                {currencyUnit !== 'USD' ? <SmallText> ETH</SmallText> : ''}
              </Text>
            }
            bottomRight={
              volumePercentChange && isFinite(volumePercentChange) ? (
                <div>{getPercentColor(volumePercentChange)}</div>
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
                {ethLiquidity && priceUSD && price && !isNaN(ethLiquidity)
                  ? currencyUnit !== 'USD'
                    ? 'Ξ ' + formattedNum(ethLiquidity * 2, 4)
                    : '$' + formattedNum(parseFloat(ethLiquidity) * price * priceUSD * 2, 2)
                  : '-'}
                {currencyUnit === 'USD' ? '' : <SmallText> ETH</SmallText>}
              </Text>
            }
            bottomRight={
              liquidityPercentChange && isFinite(liquidityPercentChange) ? (
                <div>{getPercentColor(liquidityPercentChange)}</div>
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
                {txCount}
              </Text>
            }
          />
        </TopPanel>
        <ChartWrapper
          rounded
          bg="white"
          area="statistics"
          style={{ boxShadow: '0px 4px 20px rgba(239, 162, 250, 0.15)' }}
        >
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
          <Box p={24}>
            {chartData && chartData.length > 0 ? (
              <Chart
                symbol={symbol}
                exchangeAddress={exchangeAddress}
                data={chartData}
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
            accountInput={accountInput}
            priceUSD={priceUSD}
            tokenSymbol={symbol}
            setTxCount={setTxCount}
            exchangeAddress={exchangeAddress}
            txFilter={txFilter}
          />
        </Panel>
      </OverviewDashboard>
      <Footer />
    </div>
  )
}
