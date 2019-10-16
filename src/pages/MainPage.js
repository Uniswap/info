import React, { useState, useEffect } from 'react'
import { Box, Flex, Text } from 'rebass'
import styled from 'styled-components'
import Iframe from 'react-iframe'
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

const TopPercent = styled.div`
  align-self: flex-end;
  margin-left: 20px;
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
  height: 34px;
  width: 34px;
  border-radius: 50%;
  border: 2px solid white;
  background-color: white;
  display: flex;
  align-itmes: center;
  justify-content: center;
`

const TokenHeader = styled(Box)`
  color: white;
  font-weight: 600;
  font-size: 20px;
  width: 100%;
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
  boxshadow: 0px 4px 20px rgba(239, 162, 250, 0.15);

  @media screen and (max-width: 64em) {
    display: none;
  }
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

const FrameWrapper = styled.div`
  min-width: 100vw;
  height: 100vh;
  left: 0;
  top: 0;
  z-index: 9999;
  background-color: rgba(0, 0, 0, 0.7);
  position: fixed;
  display: flex;
  justify-content: center;
  align-items: center;

  &:hover {
    cursor: pointer;
  }

  @media screen and (max-width: 440px) {
    padding-top: 20px;
  }
`

const BuyButton = styled(Box)`
  &:hover {
    background-color: #2f80edab;
    cursor: pointer;
  }

  display: flex;
  justify-content: center;
  align-items: center;
  height: 40px;
  font-size: 16px;
  color: white;
  background-color: #2f80ed;
  width: 180px;
  border-radius: 20px;
  margin-left: 24px;
  font-weight: 600;
  width: 130px;
`

const FrameBorder = styled.div`
  border-radius: 26px;
  margin-bottom: 10px;
  overflow: hidden;
`

const CloseIcon = styled.div`
  position: absolute;
  color: white;
  font-size: 30px;
  top: 20px;
  right: 20px;
`

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
  setHistoryDaysToQuery
}) {
  const [chartOption, setChartOption] = useState('liquidity')

  const [txCount, setTxCount] = useState('-')

  const [txFilter, setTxFilter] = useState('All')

  const [showModal, ToggleModal] = useState(false)

  const [accountInput, setAccountInput] = useState('')

  const [buyToggle, setBuyToggle] = useState(true)

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

  function getFrameWidth() {
    if (window.screen.width <= 440) {
      return '300px'
    }
    return '400px'
  }

  return (
    <>
      <ThemedBackground bg="token" />
      <TokenHeader mx="auto" px={[0, 3]}>
        <TokenGroup>
          <StyledTokenLogo address={tokenAddress ? tokenAddress : ''} />
          <TokenName>{tokenName ? tokenName + ' ' : '-'}</TokenName>
          <div>{symbol ? '(' + symbol + ')' : ''}</div>
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
            <TopPercent>
              <Text fontSize={14} lineHeight={1.4} color="white">
                {pricePercentChange > 0
                  ? pricePercentChange + '% ↑'
                  : pricePercentChange < 0
                  ? pricePercentChange + '% ↓'
                  : pricePercentChange + '%'}
              </Text>
            </TopPercent>
          ) : (
            ''
          )}
        </TokenGroup>
        {showModal && tokenAddress ? (
          <FrameWrapper
            onClick={() => {
              ToggleModal(false)
            }}
          >
            <CloseIcon>✕</CloseIcon>
            <FrameBorder>
              <Iframe
                url={
                  buyToggle
                    ? 'https://uniswap.exchange/swap?outputCurrency=' + tokenAddress.toString()
                    : 'https://uniswap.exchange/swap?inputCurrency=' + tokenAddress.toString()
                }
                height="680px"
                width={getFrameWidth()}
                id="myId"
                frameBorder="0"
                style={{ border: 'none', outline: 'none' }}
                display="initial"
                position="relative"
              />
            </FrameBorder>
          </FrameWrapper>
        ) : (
          ''
        )}
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
                <div>
                  <Text fontSize={14} lineHeight={1.4} color="white">
                    {volumePercentChange > 0
                      ? volumePercentChange + '% ↑'
                      : volumePercentChange < 0
                      ? volumePercentChange + '% ↓'
                      : volumePercentChange + '%'}
                  </Text>
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
                <div>
                  <Text fontSize={14} lineHeight={1.4} color="white">
                    {liquidityPercentChange > 0
                      ? liquidityPercentChange + '% ↑'
                      : liquidityPercentChange < 0
                      ? liquidityPercentChange + '% ↓'
                      : liquidityPercentChange + '%'}
                  </Text>
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
                {txCount}
              </Text>
            }
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
                    setHistoryDaysToQuery(select.value)
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
        <Panel rounded bg="white" area="exchange" style={{ boxShadow: '0px 4px 20px rgba(239, 162, 250, 0.15)' }}>
          <Box style={{ padding: '34px 0px' }}>
            <Hint color="textSubtext" mb={3} style={{ paddingLeft: '24px', paddingBottom: '6px' }}>
              Exchange
            </Hint>
            <Flex alignItems="center" justifyContent="flex-start">
              <BuyButton
                // bg="token"
                onClick={() => {
                  setBuyToggle(true)
                  ToggleModal(true)
                }}
              >
                {'Buy ' + symbol}
              </BuyButton>
              <BuyButton
                bg="token"
                onClick={() => {
                  setBuyToggle(false)
                  ToggleModal(true)
                }}
              >
                {'Sell ' + symbol}
              </BuyButton>
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
