import React, { useState } from 'react'
import 'feather-icons'
import { Box, Text } from 'rebass'
import styled from 'styled-components'

import Panel from '../components/Panel'
import TokenLogo from '../components/TokenLogo'
import PairList from '../components/PairList'
import Loader from '../components/Loader'
import { RowFlat, AutoRow, RowBetween } from '../components/Row'
import Column from '../components/Column'
import { ButtonCustom, ButtonLight } from '../components/ButtonStyled'
import TxnList from '../components/TxnList'
import TokenChart from '../components/TokenChart'
import Link from '../components/Link'
import { formattedNum } from '../helpers'
import { Hint } from '../components/.'

import { useTokenData, useTokenTransactions, useTokenChartData } from '../contexts/TokenData'
import { useCurrentCurrency } from '../contexts/Application'
import { Hover } from '../Theme'
import { useColor } from '../hooks'
import CopyHelper from '../components/Copy'

const TopPercent = styled.div`
  align-self: flex-end;
  margin-left: 20px;
`
const PageWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  padding-bottom: 100px;

  @media screen and (min-width: 64em) {
    max-width: 1240px;
  }
`

const DashboardWrapper = styled.div`
  width: 100%;
`

const TokenHeader = styled(Box)`
  color: black;
  font-weight: 600;
  font-size: 20px;
  width: 100%;
  padding: 2rem 0;

  @media screen and (min-width: 64em) {
    display: flex;
    flex-direction: row;
    font-size: 32px;
    align-items: center;
    justify-content: space-between;
    max-width: 1320px;
  }
`

const Row = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`

const TokenName = styled.div`
  margin-right: 10px;
  margin-left: 10px;
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

const ListHeader = styled.div`
  font-size: 24px;
  font-weight: 600;
  width: 100%;
  margin: 5rem 0 2rem 0;
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
const PanelWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  width: 100%;
  margin: 40px 0;
`

const TopPanel = styled(Panel)`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: fit-content;

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

const EmojiWrapper = styled.span`
  width: 10%;
  &:hover {
    cursor: pointer;
  }
`

const ButtonShadow = styled(ButtonCustom)`
  box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.04), 0px 4px 8px rgba(0, 0, 0, 0.04), 0px 16px 24px rgba(0, 0, 0, 0.04),
    0px 24px 32px rgba(0, 0, 0, 0.04);
`

const TokenDetailsLayout = styled.div`
  display: inline-grid;
  width: 100%;
  grid-template-columns: auto auto auto 1fr;
  column-gap: 30px;
  align-items: start;

  &:last-child {
    align-items: center;
    justify-items: end;
  }
`

const ThemedBackground = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1000px;
  max-width: 100vw;
  z-index: -1;
  background: ${({ backgroundColor }) =>
    `linear-gradient(180deg, ${backgroundColor} 0%, rgba(255, 255, 255, 0) 100%);`};
`

function getPercentSign(value) {
  return (
    <Text fontSize={14} lineHeight={1.2}>
      {value !== undefined && (value < 0 ? value + '% ↓' : parseInt(value) === 0 ? value + '%' : value + '% ↑')}
    </Text>
  )
}

function TokenPage({ address }) {
  const [txFilter, setTxFilter] = useState('ALL')

  const [accountInput, setAccountInput] = useState('')

  const {
    id,
    name,
    symbol,
    priceUSD,
    derivedETH,
    allPairs,
    oneDayVolumeUSD,
    oneDayVolumeETH,
    totalLiquidityUSD,
    totalLiquidityETH,
    totalLiquidity,
    volumeChangeUSD,
    volumeChangeETH,
    priceChangeUSD,
    priceChangeETH,
    liquidityChangeUSD,
    liquidityChangeETH
  } = useTokenData(address)

  // global values
  const [currency] = useCurrentCurrency()

  // detect color from token
  const backgroundColor = useColor(id)

  // daily data
  const chartData = useTokenChartData(address)

  // all transactions with this token
  const transactions = useTokenTransactions(address)

  // price
  const price = currency === 'ETH' ? 'Ξ ' + formattedNum(derivedETH) : formattedNum(priceUSD, true)
  const priceChange = currency === 'ETH' ? getPercentSign(priceChangeETH) : getPercentSign(priceChangeUSD)

  // volume
  const volume = currency === 'ETH' ? 'Ξ ' + formattedNum(oneDayVolumeETH) : formattedNum(oneDayVolumeUSD, true)
  const volumeChange = currency === 'ETH' ? getPercentSign(volumeChangeETH) : getPercentSign(volumeChangeUSD)

  // liquidity
  const liquidity = currency === 'ETH' ? 'Ξ ' + formattedNum(totalLiquidityETH) : formattedNum(totalLiquidityUSD, true)
  const liquidityChange = currency === 'ETH' ? getPercentSign(liquidityChangeETH) : getPercentSign(liquidityChangeUSD)

  const Option = ({ onClick, active, children }) => {
    return (
      <Hover>
        <Text onClick={onClick} color={!active ? '#aeaeae' : 'black'} fontWeight={600} fontSize={24}>
          {children}
        </Text>
      </Hover>
    )
  }

  return (
    <PageWrapper>
      <ThemedBackground backgroundColor={backgroundColor} />
      <TokenHeader>
        <Row>
          <TokenGroup>
            <TokenLogo address={'0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'} size="32px" />
            <TokenName>{name ? name + ' ' : ''} </TokenName>
            <div>{symbol ? '(' + symbol + ')' : ''}</div>
          </TokenGroup>
          <TokenGroup>
            <TokenPrice>{price}</TokenPrice>
            <TopPercent>{priceChange}</TopPercent>
          </TokenGroup>
        </Row>
      </TokenHeader>
      <DashboardWrapper>
        <div area="fill" rounded="true" style={{ height: '300px' }}>
          <TokenChart chartData={chartData} token={address} color={backgroundColor} />
        </div>
        <PanelWrapper>
          <TopPanel rounded color="black" p={24}>
            <Column>
              <RowFlat>
                <Text fontSize={24} lineHeight={1} fontWeight={600}>
                  {volume}
                </Text>
                <div style={{ marginLeft: '10px' }}>{volumeChange}</div>
              </RowFlat>
              <RowFlat style={{ marginTop: '10px' }}>
                <Hint>Volume (24hrs)</Hint>
              </RowFlat>
            </Column>
          </TopPanel>
          <TopPanel rounded color="black" p={24}>
            <Column>
              <RowFlat>
                <Text fontSize={24} lineHeight={1} fontWeight={600}>
                  {liquidity}
                </Text>
                <Text marginLeft={'10px'}>{liquidityChange}</Text>
              </RowFlat>
              <RowFlat style={{ marginTop: '10px' }}>
                <Hint>Total Liquidity</Hint>
              </RowFlat>
            </Column>
          </TopPanel>
          <TopPanel rounded color="black" p={24}>
            <Column>
              <RowFlat>
                <Text fontSize={24} lineHeight={1} fontWeight={600}>
                  {totalLiquidity && formattedNum(totalLiquidity)}
                </Text>
              </RowFlat>
              <RowFlat style={{ marginTop: '10px' }}>
                <Hint>Total Liquidity Token</Hint>
              </RowFlat>
            </Column>
          </TopPanel>
        </PanelWrapper>
        <ListHeader>Token Details</ListHeader>
        <Panel
          rounded
          style={{
            border: '1px solid rgba(43, 43, 43, 0.05)'
          }}
          p={20}
        >
          <TokenDetailsLayout>
            <Column>
              <Text color="#888D9B">Symbol</Text>
              <Text style={{ marginTop: '1rem' }} fontSize={24} fontWeight="500">
                {symbol}
              </Text>
            </Column>
            <Column>
              <Text color="#888D9B">Name</Text>
              <Text style={{ marginTop: '1rem' }} fontSize={24} fontWeight="500">
                {name}
              </Text>
            </Column>
            <Column>
              <Text color="#888D9B">Address</Text>
              <AutoRow align="flex-end">
                <Text style={{ marginTop: '1rem' }} fontSize={24} fontWeight="500">
                  {address.slice(0, 8) + '...' + address.slice(36, 42)}
                </Text>
                <CopyHelper toCopy={address} />
              </AutoRow>
            </Column>
            <AutoRow gap="20px" justify="flex-end">
              <ButtonLight color={backgroundColor}>
                <Link external href={'https://etherscan.io/address/' + address}>
                  Trade Token ↗
                </Link>
              </ButtonLight>
              <ButtonLight color={backgroundColor}>
                <Link external href={'https://etherscan.io/address/' + address}>
                  View on Etherscan ↗
                </Link>
              </ButtonLight>
            </AutoRow>
          </TokenDetailsLayout>
        </Panel>
        <ListHeader>Top Pairs</ListHeader>
        <Panel
          rounded
          style={{
            border: '1px solid rgba(43, 43, 43, 0.05)'
          }}
        >
          {address ? <PairList address={address} pairs={allPairs} /> : <Loader />}
        </Panel>
        <RowBetween mt={40} mb={40}>
          <AutoRow gap="10px" pl={4}>
            <Option
              onClick={() => {
                setTxFilter('ALL')
              }}
              active={txFilter === 'ALL'}
            >
              All
            </Option>
            <Option
              onClick={() => {
                setTxFilter('SWAP')
              }}
              active={txFilter === 'SWAP'}
            >
              Swaps
            </Option>
            <Option
              onClick={() => {
                setTxFilter('ADD')
              }}
              active={txFilter === 'ADD'}
            >
              Adds
            </Option>
            <Option
              onClick={() => {
                setTxFilter('REMOVE')
              }}
              active={txFilter === 'REMOVE'}
            >
              Removes
            </Option>
          </AutoRow>
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
        </RowBetween>
        <Panel
          rounded
          style={{
            border: '1px solid rgba(43, 43, 43, 0.05)'
          }}
        >
          {transactions ? <TxnList transactions={transactions} txFilter={txFilter} /> : <Loader />}
        </Panel>
      </DashboardWrapper>
    </PageWrapper>
  )
}

export default TokenPage
