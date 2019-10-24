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
import { Divider, Hint } from '../components'
import { useMedia } from 'react-use'

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
  height: 378px;
  z-index: -1;
  top: 0;
  width: 100vw;

  @media screen and (max-width: 64em) {
    height: 679px;
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
    padding-left: 48px;
    padding-right: 24px;
    max-width: 1320px;
  }
`

const TextOption = styled(Text)`
  font-weight: 500;
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
    margin-bottom: 20px;
    border-radius: 12px;
  }
`
const TokenName = styled.div`
  margin-right: 10px;
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
  height: 50px;
  font-size: 16px;
  color: white;
  background-color: #2f80ed;
  border-radius: 32px;
  font-weight: 600;
  width: 46%;
`

const ExchangeButtons = styled(Flex)`
  padding: 20px 20px;
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

const PricePanelMobile = styled(Panel)`
  padding: 24px;
  width: 100%;
  background-color: rgba(255, 255, 255, 0.15);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border-radius: 20px;
  margin-top: 20px;

  @media screen and (min-width: 64em) {
    display: none;
  }
`

const AddressLink = styled.a`
  font-weight: 500;
  color: #2f80ed;
  text-decoration: none;
`

const DashboardWrapper = styled.div`
  width: calc(100% -40px);
  padding-left: 20px;
  padding-right: 20px;

  @media screen and (max-width: 40em) {
    width: 100%;
    padding: 0;
  }
`

export const MainPage = function({
  exchangeAddress,
  currencyUnit,
  symbol,
  tradeVolume,
  tradeVolumeUSD,
  pricePercentChange,
  pricePercentChangeETH,
  volumePercentChange,
  volumePercentChangeUSD,
  liquidityPercentChange,
  liquidityPercentChangeUSD,
  txsPercentChange,
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

  const belowMedium = useMedia('(max-width: 440px)')

  const belowLarge = useMedia('(max-width: 64em)')

  function getPercentSign(value) {
    return (
      <Text fontSize={14} lineHeight={1.4} color="white">
        {value < 0 ? value + ' ↓' : value === 0 ? value : value + ' ↑'}
      </Text>
    )
  }

  return (
    <div style={{ width: '100%' }}>
      <ThemedBackground bg="token" />
      <TokenHeader>
        <TokenGroup>
          <StyledTokenLogo address={tokenAddress ? tokenAddress : ''} header={true} size={30} />
          <TokenName>{tokenName ? tokenName + ' ' : '-'}</TokenName>
          <div>{'(' + symbol + ')'}</div>
        </TokenGroup>
        <PricePanelMobile rounded bg="token" color="white">
          <FourByFour
            topLeft={<Hint color="textLight">Price</Hint>}
            bottomLeft={
              <Text fontSize={24} lineHeight={1.4} fontWeight={500}>
                {invPrice && priceUSD
                  ? currencyUnit === 'USD'
                    ? '$' + formattedNum(priceUSD, true)
                    : 'Ξ ' + formattedNum(invPrice) + ' ETH'
                  : ''}
              </Text>
            }
            bottomRight={
              currencyUnit === 'USD' ? getPercentSign(pricePercentChange) : getPercentSign(pricePercentChangeETH)
            }
          />
        </PricePanelMobile>
        {!belowLarge ? (
          <TokenGroup>
            <TokenPrice>
              {invPrice && priceUSD
                ? currencyUnit === 'USD'
                  ? '$' + formattedNum(priceUSD, true)
                  : 'Ξ ' + formattedNum(invPrice) + ' ETH'
                : ''}
            </TokenPrice>
            {pricePercentChange && isFinite(pricePercentChange) ? (
              <TopPercent>
                {currencyUnit === 'USD' ? getPercentSign(pricePercentChange) : getPercentSign(pricePercentChangeETH)}
              </TopPercent>
            ) : (
              ''
            )}
          </TokenGroup>
        ) : (
          ''
        )}
      </TokenHeader>
      <DashboardWrapper>
        <Dashboard mx="auto" px={[0, 0]}>
          <TopPanel rounded bg="token" color="white" p={24} style={{ gridArea: 'volume' }}>
            <FourByFour
              topLeft={<Hint color="textLight">Volume (24hrs)</Hint>}
              bottomLeft={
                <Text fontSize={24} lineHeight={1.4} fontWeight={500}>
                  {invPrice && price && priceUSD
                    ? currencyUnit === 'USD'
                      ? '$' + formattedNum(tradeVolumeUSD, true)
                      : 'Ξ ' + formattedNum(tradeVolume)
                    : '-'}
                  {currencyUnit !== 'USD' ? <SmallText> ETH</SmallText> : ''}
                </Text>
              }
              bottomRight={
                volumePercentChange && isFinite(volumePercentChange) ? (
                  <div>
                    {currencyUnit === 'USD'
                      ? getPercentSign(volumePercentChangeUSD)
                      : getPercentSign(volumePercentChange)}
                  </div>
                ) : (
                  ''
                )
              }
            />
          </TopPanel>
          <TopPanel rounded bg="token" color="white" p={24} style={{ gridArea: 'liquidity' }}>
            <FourByFour
              topLeft={<Hint color="textLight">Total Liquidity</Hint>}
              bottomLeft={
                <Text fontSize={24} lineHeight={1.4} fontWeight={500}>
                  {ethLiquidity && priceUSD && price && !isNaN(ethLiquidity)
                    ? currencyUnit !== 'USD'
                      ? 'Ξ ' + formattedNum(ethLiquidity * 2)
                      : '$' + formattedNum(parseFloat(ethLiquidity) * price * priceUSD * 2, true)
                    : '-'}
                  {currencyUnit === 'USD' ? '' : <SmallText> ETH</SmallText>}
                </Text>
              }
              bottomRight={
                liquidityPercentChange && isFinite(liquidityPercentChange)
                  ? currencyUnit === 'USD'
                    ? getPercentSign(liquidityPercentChangeUSD)
                    : getPercentSign(liquidityPercentChange)
                  : ''
              }
            />
          </TopPanel>
          <TopPanel rounded bg="token" color="white" style={{ gridArea: 'shares' }} p={24}>
            <FourByFour
              topLeft={<Hint color="textLight">Transactions (24hrs)</Hint>}
              bottomLeft={
                <Text fontSize={24} lineHeight={1.4} fontWeight={500}>
                  {txCount}
                </Text>
              }
              bottomRight={txsPercentChange ? getPercentSign(txsPercentChange) : ''}
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
                    style={{ marginLeft: !belowMedium ? '2em' : '0.6em' }}
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
            <Box p={24}>
              <Flex alignItems="center" justifyContent="space-between">
                <Flex alignItems="center" justifyContent="space-between" style={{ fontWeight: 500, height: '36px' }}>
                  <div>Exchange</div>
                </Flex>
                <AddressLink href={'https://www.etherscan.io/address/' + exchangeAddress + '/'} target="_blank">
                  View Exchange ↗
                </AddressLink>
              </Flex>
            </Box>
            <Divider />
            <ExchangeButtons alignItems="center" justifyContent="space-between">
              <BuyButton
                // bg="token"
                onClick={() => {
                  setBuyToggle(true)
                  ToggleModal(true)
                }}
              >
                {'Buy'}
              </BuyButton>
              <BuyButton
                bg="token"
                onClick={() => {
                  setBuyToggle(false)
                  ToggleModal(true)
                }}
              >
                {'Sell'}
              </BuyButton>
            </ExchangeButtons>
            <Divider />
            <Box p={24}>
              <AddressLink href={'https://www.etherscan.io/token/' + tokenAddress + '/'} target="_blank">
                Token Address ↗
              </AddressLink>
            </Box>
            <Box p={24}>
              <AddressLink href={'https://www.etherscan.io/address/' + exchangeAddress + '/'} target="_blank">
                Exchange Address ↗
              </AddressLink>
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
          <Panel rounded bg="white" area="transactions" style={{ marginTop: '20px' }}>
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
      </DashboardWrapper>
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
              width={belowMedium ? '300px' : '400px'}
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
      <Footer />
    </div>
  )
}
