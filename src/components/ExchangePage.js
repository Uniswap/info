import React, { useState } from 'react'
import 'feather-icons'
import { Box, Flex, Text } from 'rebass'
import styled from 'styled-components'
import Iframe from 'react-iframe'
import FourByFour from './FourByFour'
import Panel from './Panel'
import Dashboard from './Dashboard'
import Select from './Select'
import Footer from './Footer'
import TransactionsList from './TransactionsList'
import Chart from './Chart'
import Loader from './Loader'
import { Divider, Hint } from '.'
import { useMedia } from 'react-use'
import { getTimeFrame } from '../constants'
import Copy from './Copy'
import { formattedNum } from '../helpers'
import intl from 'react-intl-universal'


//const timeframeOptions = [
//  { value: '1week', label: intl.get('oneweek') },
//  { value: '1month', label: '1 month' },
//  { value: '3months', label: '3 months' },
//  { value: 'all', label: 'All time' }
//]

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
  padding-left: 1.5rem;
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
  min-height: 38px;
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

const FrameBorder = styled.div`
  border-radius: 26px;
  margin-bottom: 20px;
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

export const ExchangePage = function({
  exchangeAddress,
  currencyUnit,
  symbol,
  tradeVolume,
  tradeVolumeUSD,
  oneDayTxs,
  logo,
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
  historyDaysToQuery,
  setHistoryDaysToQuery
}) {
  const timeframeOptions = [
  { value: '1week', label: intl.get('oneweek') },
  { value: '1month', label: intl.get('onemonth') },
  { value: '3months', label: intl.get('threemonths') },
  { value: 'all', label: intl.get('alltime') }
  ]	
	
  const [chartOption, setChartOption] = useState('liquidity')

  const [txFilter, setTxFilter] = useState('All')

  const [showModal, ToggleModal] = useState(false)

  const [accountInput, setAccountInput] = useState('')

  const [buyToggle, setBuyToggle] = useState(true)

  const belowMedium = useMedia('(max-width: 440px)')

  const belowLarge = useMedia('(max-width: 64em)')

  function getPercentSign(value) {
    return (
      <Text fontSize={14} lineHeight={1.2} color="white">
        {value < 0 ? value + '% ↓' : value === 0 ? value + '%' : value + '% ↑'}
      </Text>
    )
  }

  function getPercentSignTall(value) {
    return (
      <Text fontSize={14} lineHeight={1.8} color="white">
        {value < 0 ? value + '% ↓' : value === 0 ? value + '%' : value + '% ↑'}
      </Text>
    )
  }

  return (
    <div style={{ marginTop: '0px' }}>
      <ThemedBackground bg="token" />
      <TokenHeader>
        <TokenGroup>
          {logo}
          <TokenName>{tokenName ? tokenName + ' ' : ''} </TokenName>
          <div>{symbol ? '(' + symbol + ')' : ''}</div>
        </TokenGroup>
        <PricePanelMobile rounded bg="token" color="white">
          <FourByFour
            topLeft={<Hint color="textLight">Price</Hint>}
            bottomLeft={
              <Text fontSize={24} lineHeight={1.4} fontWeight={500}>
                {!isNaN(price) && !isNaN(invPrice)
                  ? currencyUnit === 'USD'
                    ? '$' + formattedNum(priceUSD, true)
                    : 'Ξ ' + formattedNum(invPrice) + ' ETH'
                  : ''}
              </Text>
            }
            bottomRight={
              !isNaN(pricePercentChange) && !isNaN(pricePercentChangeETH)
                ? currencyUnit === 'USD'
                  ? getPercentSign(pricePercentChange)
                  : getPercentSign(pricePercentChangeETH)
                : ''
            }
          />
        </PricePanelMobile>
        {!belowLarge ? (
          <TokenGroup>
            <TokenPrice>
              {!isNaN(price) && !isNaN(invPrice)
                ? currencyUnit === 'USD'
                  ? '$' + formattedNum(priceUSD, true, true)
                  : 'Ξ ' + formattedNum(invPrice) + ' ETH'
                : ''}
            </TokenPrice>
            {!isNaN(pricePercentChange) && !isNaN(pricePercentChangeETH) ? (
              <TopPercent>
                {currencyUnit === 'USD'
                  ? getPercentSignTall(pricePercentChange)
                  : getPercentSignTall(pricePercentChangeETH)}
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
              topLeft={<Hint color="textLight">{intl.get('Volume_24hrs')}</Hint>}
              bottomLeft={
                <Text fontSize={24} lineHeight={1} fontWeight={500}>
                  {!isNaN(tradeVolumeUSD) && !isNaN(tradeVolume)
                    ? currencyUnit === 'USD'
                      ? '$' + formattedNum(tradeVolumeUSD, true)
                      : 'Ξ ' + formattedNum(tradeVolume)
                    : '-'}
                  {currencyUnit !== 'USD' ? <SmallText> ETH</SmallText> : ''}
                </Text>
              }
              bottomRight={
                !isNaN(volumePercentChangeUSD) && !isNaN(volumePercentChange) ? (
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
              topLeft={<Hint color="textLight">{intl.get('Total_Liquidity')}</Hint>}
              bottomLeft={
                <Text fontSize={24} lineHeight={1} fontWeight={500}>
                  {!isNaN(ethLiquidity) && !isNaN(price) && !isNaN(priceUSD)
                    ? currencyUnit !== 'USD'
                      ? 'Ξ ' + formattedNum(ethLiquidity * 2)
                      : '$' + formattedNum(parseFloat(ethLiquidity) * price * priceUSD * 2, true)
                    : '-'}
                  {currencyUnit === 'USD' ? '' : <SmallText> ETH</SmallText>}
                </Text>
              }
              bottomRight={
                !isNaN(liquidityPercentChangeUSD) && !isNaN(price) && !isNaN(liquidityPercentChange)
                  ? currencyUnit === 'USD'
                    ? getPercentSign(liquidityPercentChangeUSD)
                    : getPercentSign(liquidityPercentChange)
                  : ''
              }
            />
          </TopPanel>
          <TopPanel rounded bg="token" color="white" style={{ gridArea: 'shares' }} p={24}>
            <FourByFour
              topLeft={<Hint color="textLight">{intl.get('Transactions_24hrs')}</Hint>}
              bottomLeft={
                <Text fontSize={24} lineHeight={1} fontWeight={500}>
                  {!isNaN(oneDayTxs) ? oneDayTxs : '-'}
                </Text>
              }
              bottomRight={!isNaN(txsPercentChange) ? getPercentSign(txsPercentChange) : ''}
            />
          </TopPanel>
          <ChartWrapper
            rounded
            bg="white"
            area="statistics"
            style={{ boxShadow: '0px 4px 20px rgba(239, 162, 250, 0.15)', borderRadius: '10px' }}
          >
            <Box p={24}>
              <Flex height={18} alignItems="center" justifyContent="space-between">
                <Flex alignItems="center" justifyContent="space-between">
                  <TextOption
                    color={chartOption === 'liquidity' ? 'inherit' : 'grey'}
                    onClick={e => {
                      setChartOption('liquidity')
                    }}
                  >
                    {intl.get('Liquidity')}
                  </TextOption>
                  <TextOption
                    style={{ marginLeft: !belowMedium ? '2em' : '0.6em' }}
                    color={chartOption === 'volume' ? 'inherit' : 'grey'}
                    onClick={e => {
                      setChartOption('volume')
                    }}
                  >
                    {intl.get('Volume')}
                  </TextOption>
                  <TextOption
                    style={{ marginLeft: !belowMedium ? '2em' : '0.6em' }}
                    color={chartOption === 'price' ? 'inherit' : 'grey'}
                    onClick={e => {
                      setChartOption('price')
                    }}
                  >
                    {intl.get('Price')}
                  </TextOption>
                </Flex>
                <Box width={144}>
                  <Select
                    placeholder="Timeframe"
                    options={timeframeOptions}
                    defaultValue={getTimeFrame(historyDaysToQuery)}
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
              <FloatRight>UTC±00:00</FloatRight>
            </Box>
          </ChartWrapper>
          <Panel rounded bg="white" area="exchange" style={{ boxShadow: '0px 4px 20px rgba(239, 162, 250, 0.15)' }}>
            <Box p={24}>
              <Flex height={18} alignItems="center" justifyContent="space-between">
                <Flex alignItems="center" justifyContent="space-between" style={{ fontWeight: 500, height: '36px' }}>
                  <div>{intl.get('Exchange')}</div>
                </Flex>
                <AddressLink href={'https://uniswap.exchange/swap/' + tokenAddress} target="_blank">
                  {intl.get('View_Exchange')} ↗
                </AddressLink>
              </Flex>
            </Box>
            <Divider />
            <ExchangeButtons alignItems="center" justifyContent="space-between">
              <BuyButton
                onClick={() => {
                  setBuyToggle(true)
                  ToggleModal(true)
                }}
              >
                {intl.get('Buy')}
              </BuyButton>
              <BuyButton
                bg="token"
                onClick={() => {
                  setBuyToggle(false)
                  ToggleModal(true)
                }}
              >
                {intl.get('Sell')}
              </BuyButton>
            </ExchangeButtons>
            <Divider />
            <Flex p={24} justifyContent="space-between">
              <AddressLink href={'https://www.etherscan.io/token/' + tokenAddress + '/'} target="_blank">
                {intl.get('Token_Address')} ↗
              </AddressLink>
			  <AddressLink href={'https://cn.etherscan.com/token/' + tokenAddress + '/'} target="_blank">
                （中文）
              </AddressLink>
              <Copy toCopy={tokenAddress} />
            </Flex>
            <Flex p={24} justifyContent="space-between">              
			  <AddressLink href={'https://www.etherscan.io/address/' + exchangeAddress + '/'} target="_blank">
                {intl.get('Exchange_Address')} ↗
              </AddressLink>
			  <AddressLink href={'https://cn.etherscan.com/address/' + exchangeAddress + '/'} target="_blank">
                （中文）
              </AddressLink>
              <Copy toCopy={exchangeAddress} />
            </Flex>
          </Panel>
          <ListOptions style={{ gridArea: 'listOptions' }}>
            <OptionsWrappper>
              <Text
                onClick={e => {
                  setTxFilter('All')
                }}
                color={txFilter !== 'All' ? 'textDim' : 'black'}
              >
                {intl.get('All')}
              </Text>
              <Text
                onClick={e => {
                  setTxFilter('Swaps')
                }}
                color={txFilter !== 'Swaps' ? 'textDim' : 'black'}
              >
                {intl.get('Swaps')}
              </Text>
              <Text
                onClick={e => {
                  setTxFilter('Add')
                }}
                color={txFilter !== 'Add' ? 'textDim' : 'black'}
              >
                {intl.get('Add')}
              </Text>
              <Text
                onClick={e => {
                  setTxFilter('Remove')
                }}
                color={txFilter !== 'Remove' ? 'textDim' : 'black'}
              >
                {intl.get('Remove')}
              </Text>
            </OptionsWrappper>
            <AccountSearchWrapper>
              <AccountSearch
                value={accountInput}
                placeholder={intl.get('Filter_by_account')}
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
          <Panel rounded bg="white" area="transactions" style={{ marginTop: belowMedium ? '20px' : '' }}>
            {exchangeAddress ? (
              <TransactionsList
                currencyUnit={currencyUnit}
                price={price}
                accountInput={accountInput}
                priceUSD={priceUSD}
                tokenSymbol={symbol}
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
              height={belowMedium ? '500px' : '660px'}
              width={belowMedium ? '340px' : '400px'}
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
