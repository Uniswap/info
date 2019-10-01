import React, { useState, useEffect } from 'react'
import { Box, Flex, Text } from 'rebass'
import styled from 'styled-components'

import FourByFour from '../components/FourByFour'
import Panel from '../components/Panel'
import Dashboard from '../components/Dashboard'
import Select from '../components/Select'
import Footer from '../components/Footer'
import TransactionsList from '../components/TransactionsList'
import Chart from '../components/Chart'
import Loader from '../components/Loader'
import TokenLogo from '../components/TokenLogo'
import { Divider, Hint, Address } from '../components'

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

const StyledTokenLogo = styled(TokenLogo)`
  margin-left: 0;
  margin-right: 1rem;
  height: 32px;
  width: 32px;
  fill-color: white;
  display: flex;
  align-itmes: center;
  justify-content: center;
`

const TokenHeader = styled(Box)`
  color: white;
  font-weight: 600;
  font-size: 20px;
  max-width: 1280px;
  padding: 24px;
  height: 100px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;

  @media screen and (min-width: 40em) {
    font-size: 32px;
    display: grid;
    grid-gap: 16px;
    grid-template-rows: 1fr;
    justify-content: flex-start;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
  }

  @media screen and (min-width: 64em) {
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 0 0 24px 24px;
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

const PercentWrapper = styled(Text)`
  border-radius: 30px;
  padding: 8px 8px;
  display: flex;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.6);
`

const TokenName = styled.div`
  margin-right: 10px;
  @media screen and (max-width: 40em) {
    display: none;
  }
`

const TokenPrice = styled.div`
  margin-left: 1em;
`

const TokenGroup = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`

function getPercentColor(value) {
  if (value < 0) {
    return (
      <Text fontSize={14} lineHeight={1.4} color="red">
        {value}% ↓
      </Text>
    )
  }
  if (parseFloat(value) === 0) {
    return (
      <Text fontSize={14} lineHeight={1.4} color="black">
        {value}%
      </Text>
    )
  }
  return (
    <Text fontSize={14} lineHeight={1.4} color="green">
      {value}% ↑
    </Text>
  )
}

export const MainPage = function({
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
    <>
      <ThemedBackground bg="token" />
      <TokenHeader mx="auto" px={[0, 3]}>
        <TokenGroup>
          <StyledTokenLogo address={tokenAddress ? tokenAddress : ''} />
          <TokenName>{tokenName + ' '}</TokenName>
          <div>({symbol})</div>
        </TokenGroup>
        <TokenGroup>
          <TokenPrice>
            {invPrice && priceUSD
              ? currencyUnit === 'USD'
                ? '$' + formattedNum(priceUSD, 2)
                : 'Ξ ' + formattedNum(invPrice, 4) + ' ETH'
              : ''}
          </TokenPrice>
          {pricePercentChange && isFinite(pricePercentChange) ? (
            <PercentWrapper fontSize={20} lineHeight={1.4} style={{ marginLeft: '1em', fontWeight: '400' }}>
              {getPercentColor(pricePercentChange)}
            </PercentWrapper>
          ) : (
            ''
          )}
        </TokenGroup>
      </TokenHeader>
      <Dashboard mx="auto" px={[0, 3]}>
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
                <PercentWrapper fontSize={20} lineHeight={1.4} style={{ marginLeft: '1em' }}>
                  {getPercentColor(volumePercentChange)}
                </PercentWrapper>
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
                <PercentWrapper fontSize={20} lineHeight={1.4}>
                  {getPercentColor(liquidityPercentChange)}
                </PercentWrapper>
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
              <Chart symbol={symbol} data={chartData} currencyUnit={currencyUnit} chartOption={chartOption} />
            ) : (
              <Loader />
            )}
          </Box>
        </ChartWrapper>
        <Panel rounded bg="white" area="exchange" style={{ boxShadow: '0px 4px 20px rgba(239, 162, 250, 0.15)' }}>
          <Box style={{ padding: '34px 24px' }}>
            <Flex alignItems="center" justifyContent="space-between">
              <Text>Contract Info</Text>
            </Flex>
          </Box>
          <Divider />
          <Box p={24}>
            <Hint color="textSubtext" mb={3}>
              Token Address
            </Hint>
            <Address address={tokenAddress} />
          </Box>
          <Box p={24}>
            <Hint color="textSubtext" mb={3}>
              Exchange Address
            </Hint>
            <Address address={exchangeAddress} />
          </Box>
          {/* <Iframe
            url={'https://uniswap.exchange/swap?inputCurrency=0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2'}
            height="400px"
            width="100%"
            id="myId"
            frameBorder="0"
            style={{ border: 'none', outline: 'none' }}
            display="initial"
            position="relative"
          /> */}
        </Panel>
        <ListOptions style={{ gridArea: 'listOptions' }}>
          <OptionsWrappper>
            <Text
              onClick={e => {
                setTxFilter('All')
              }}
              color={txFilter !== 'All' ? 'textDim' : 'black'}
            >
              All
            </Text>
            <Text
              onClick={e => {
                setTxFilter('Swaps')
              }}
              color={txFilter !== 'Swaps' ? 'textDim' : 'black'}
            >
              Swaps
            </Text>
            <Text
              onClick={e => {
                setTxFilter('Add')
              }}
              color={txFilter !== 'Add' ? 'textDim' : 'black'}
            >
              Add
            </Text>
            <Text
              onClick={e => {
                setTxFilter('Remove')
              }}
              color={txFilter !== 'Remove' ? 'textDim' : 'black'}
            >
              Remove
            </Text>
          </OptionsWrappper>
          <AccountSearchWrapper>
            <AccountSearch
              value={accountInput}
              placeholder={'Filter by account'}
              onChange={e => {
                setAccountInput(e.target.value)
              }}
            />
            <EmojiWrapper>
              <span role="img" aria-label="magnify">
                🔍
              </span>
            </EmojiWrapper>
          </AccountSearchWrapper>
        </ListOptions>
        <Panel rounded bg="white" area="transactions">
          {exchangeAddress ? (
            <TransactionsList
              currencyUnit={currencyUnit}
              price={price}
              accountInput={accountInput}
              priceUSD={priceUSD}
              tokenSymbol={symbol}
              setTxCount={setTxCount}
              exchangeAddress={exchangeAddress}
              txFilter={txFilter}
            />
          ) : (
            <Loader />
          )}
        </Panel>
      </Dashboard>
      <Footer />
    </>
  )
}
