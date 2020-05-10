import React, { useState } from 'react'
import 'feather-icons'
import { Text } from 'rebass'
import styled from 'styled-components'

import Panel from '../components/Panel'
import TokenLogo from '../components/TokenLogo'
import PairList from '../components/PairList'
import Loader from '../components/Loader'
import { RowFlat, AutoRow, RowBetween, RowFixed } from '../components/Row'
import Column, { AutoColumn } from '../components/Column'
import { ButtonLight, ButtonDark } from '../components/ButtonStyled'
import TxnList from '../components/TxnList'
import TokenChart from '../components/TokenChart'
import { formattedNum } from '../helpers'
import { Hint } from '../components/.'

import { useTokenData, useTokenTransactions, useTokenChartData } from '../contexts/TokenData'
import { useCurrentCurrency } from '../contexts/Application'
import { Hover, ThemedBackground } from '../Theme'
import { useColor } from '../hooks'
import CopyHelper from '../components/Copy'

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-bottom: 100px;
  width: calc(100% - 80px);
  padding: 0 40px;
  overflow: scroll;

  @media screen and (max-width: 640px) {
    width: calc(100% - 40px);
    padding: 0 20px;
  }

  & > * {
    width: 100%;
    max-width: 1240px;
  }
`

const TopPercent = styled.div`
  align-self: flex-end;
  margin-left: 10px;
`

const DashboardWrapper = styled.div`
  width: 100%;
`

const TokenName = styled.div`
  font-size: 36px;
  font-weight: 600;
  line-height: 32px;

  @media screen and (max-width: 1080px) {
    font-size: 24px;
    line-height: normal;
  }
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

const ShadedBox = styled.div`
  background: rgba(255, 255, 255, 0.4);
  border-radius: 20px;
  padding: 20px;
`

const Break = styled.div`
  width: 50px;
  height: 2px;
  background: black;
`

const GroupedOverflow = styled.div`
  display: flex;
  align-items: flex-end;

  min-width: 0;
  max-width: 240px;
  div {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
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
      <RowBetween align="flex-start">
        <ShadedBox style={{ width: '40%' }}>
          <AutoColumn gap="40px">
            <RowBetween>
              <TokenLogo address={'0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'} size="32px" />
              <RowFixed justify="flex-end">
                <ButtonLight color={backgroundColor}>+ Add Liquidity</ButtonLight>
                <ButtonDark ml={10} color={backgroundColor}>
                  Trade
                </ButtonDark>
              </RowFixed>
            </RowBetween>
            <TokenName>{name ? name + ' ' : ''}</TokenName>
            <AutoColumn gap="10px">
              <RowFlat style={{ lineHeight: '22px' }}>
                <Text fontSize={36} fontWeight={600}>
                  {price}
                </Text>
                <TopPercent>{priceChange}</TopPercent>
              </RowFlat>
              <Hint>Price</Hint>
            </AutoColumn>
            <AutoColumn gap="10px">
              <RowFlat style={{ lineHeight: '22px' }}>
                <Text fontSize={24} fontWeight={600}>
                  {volume}
                </Text>
                <TopPercent>{volumeChange}</TopPercent>
              </RowFlat>
              <Hint>24hr Volume</Hint>
            </AutoColumn>
            <AutoColumn gap="10px">
              <RowFlat style={{ lineHeight: '22px' }}>
                <Text fontSize={24} fontWeight={600}>
                  {liquidity}
                </Text>
                <TopPercent>{liquidityChange}</TopPercent>
              </RowFlat>
              <Hint>Total Liquidity</Hint>
            </AutoColumn>
            <AutoColumn gap="10px">
              <RowFlat style={{ lineHeight: '22px' }}>
                <Text fontSize={24} fontWeight={600}>
                  {totalLiquidity && formattedNum(totalLiquidity)}
                </Text>
                <TopPercent>{liquidityChange}</TopPercent>
              </RowFlat>
              <Hint>Total Liquidity Token</Hint>
            </AutoColumn>
            <Break />
            <AutoRow gap="10px">
              <AutoColumn gap="20px">
                <Text fontSize={16} fontWeight="500">
                  {symbol}
                </Text>
                <Text>Symbol</Text>
              </AutoColumn>
              <AutoColumn gap="20px">
                <Text fontSize={16} fontWeight="500">
                  {name}
                </Text>
                <Text>Name</Text>
              </AutoColumn>
              <AutoColumn gap="20px">
                <GroupedOverflow>
                  <Text fontSize={16} fontWeight="500">
                    {address.slice(0, 6) + '...' + address.slice(38, 42)}
                  </Text>
                  <CopyHelper toCopy={address} />
                </GroupedOverflow>
                <Text>Address</Text>
              </AutoColumn>
            </AutoRow>
          </AutoColumn>
        </ShadedBox>
        <ShadedBox style={{ width: '60%' }}>
          <TokenChart chartData={chartData} token={address} color={backgroundColor} />
        </ShadedBox>
      </RowBetween>
      <DashboardWrapper>
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
