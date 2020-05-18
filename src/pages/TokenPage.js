import React, { useState } from 'react'
import 'feather-icons'
import { Text } from 'rebass'
import styled from 'styled-components'

import Panel from '../components/Panel'
import TokenLogo from '../components/TokenLogo'
import PairList from '../components/PairList'
import Loader from '../components/Loader'
import { AutoRow, RowBetween, RowFixed } from '../components/Row'
import Column, { AutoColumn } from '../components/Column'
import { ButtonLight, ButtonDark } from '../components/ButtonStyled'
import TxnList from '../components/TxnList'
import TokenChart from '../components/TokenChart'
import Link from '../components/Link'

import { formattedNum, formattedPercent } from '../helpers'

import { useTokenData, useTokenTransactions, useTokenChartData } from '../contexts/TokenData'
import { TYPE, ThemedBackground } from '../Theme'
import { useColor } from '../hooks'
import CopyHelper from '../components/Copy'
import { useMedia } from 'react-use'
import { Search } from 'react-feather'
import { transparentize } from 'polished'

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-bottom: 100px;
  width: calc(100% - 80px);
  padding: 0 40px;

  padding-bottom: 80px;

  @media screen and (max-width: 640px) {
    width: calc(100% - 40px);
    padding: 0 20px;
  }

  & > * {
    max-width: 1240px;
  }
`

const DashboardWrapper = styled.div`
  width: 100%;
`

const AccountSearch = styled.input`
  font-size: 0.85rem;
  border: none;
  outline: none;
  background-color: transparent;
  width: 90%;
  margin-left: 0.5rem;
  &:focus {
    outline: none;
  }
`

const AccountSearchWrapper = styled.div`
  width: 190px;
  background-color: ${({ theme }) => theme.bg2};

  border-radius: 40px;
  height: 40px;
  color: ${({ theme }) => theme.text2};
  padding: 0 0.5em 0 1em;
  display: flex;
  align-items: center;
  justify-content: space-between;

  @media screen and (max-width: 64em) {
    display: none;
  }
`
const PanelWrapper = styled.div`
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: max-content;
  gap: 6px;
  display: inline-grid;
  width: 100%;
  align-items: start;
  @media screen and (max-width: 1024px) {
    grid-template-columns: 1fr;
    align-items: stretch;
    > * {
      grid-column: 1 / 4;
    }

    > * {
      &:first-child {
        width: 100%;
      }
    }
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
  @media screen and (max-width: 1024px) {
    grid-template-columns: 1fr;
    align-items: stretch;
    > * {
      grid-column: 1 / 4;
      margin-bottom: 1rem;
    }

    &:last-child {
      align-items: start;
      justify-items: start;
    }
  }
`

function TokenPage({ address }) {
  const [accountInput, setAccountInput] = useState('')

  const {
    id,
    name,
    symbol,
    priceUSD,
    allPairs,
    oneDayVolumeUSD,
    totalLiquidityUSD,
    totalLiquidity,
    volumeChangeUSD,
    priceChangeUSD,
    liquidityChangeUSD
  } = useTokenData(address)

  // detect color from token
  const backgroundColor = useColor(id, symbol)

  // daily data
  const chartData = useTokenChartData(address)

  // all transactions with this token
  const transactions = useTokenTransactions(address)

  // price
  const price = priceUSD ? formattedNum(priceUSD, true) : '-'
  const priceChange = priceChangeUSD ? formattedPercent(priceChangeUSD) : ''

  // volume
  const volume = oneDayVolumeUSD ? formattedNum(oneDayVolumeUSD, true) : '-'
  const volumeChange = volumeChangeUSD ? formattedPercent(volumeChangeUSD) : ''

  // liquidity
  const liquidity = totalLiquidityUSD ? formattedNum(totalLiquidityUSD, true) : '-'
  const liquidityChange = liquidityChangeUSD ? formattedPercent(liquidityChangeUSD) : ''

  const tokenLiquidityFormatted = totalLiquidity ? formattedNum(totalLiquidity) : '-'

  const below1080 = useMedia('(max-width: 1080px)')

  return (
    <PageWrapper>
      <ThemedBackground backgroundColor={transparentize(0.6, backgroundColor)} />
      <RowBetween mt={20} style={{ flexWrap: 'wrap' }}>
        <RowFixed style={{ flexWrap: 'wrap' }}>
          <RowFixed mb={20} style={{ alignItems: 'baseline' }}>
            <TokenLogo address={address} size="32px" style={{ alignSelf: 'center' }} />
            <Text fontSize={'2rem'} fontWeight={600} style={{ margin: '0 1rem' }}>
              {name ? name + ' ' : ''} {symbol ? '(' + symbol + ')' : ''}
            </Text>{' '}
            {!below1080 && (
              <>
                <Text fontSize={'2rem'} fontWeight={500} style={{ marginRight: '1rem' }}>
                  {price}
                </Text>
                {priceChange}
              </>
            )}
          </RowFixed>
        </RowFixed>
        <span>
          <RowFixed mb={20} ml={'2.5rem'} style={{ flexDirection: below1080 ? 'row-reverse' : 'initial' }}>
            <ButtonLight color={backgroundColor}>+ Add Liquidity</ButtonLight>
            <ButtonDark ml={'.5rem'} mr={below1080 && '.5rem'} color={backgroundColor}>
              Trade
            </ButtonDark>
          </RowFixed>
        </span>
      </RowBetween>
      <DashboardWrapper>
        <>
          {!below1080 && (
            <TYPE.main fontSize={'1.125rem'} style={{ marginTop: '2rem' }}>
              Token Stats
            </TYPE.main>
          )}

          <PanelWrapper style={{ marginTop: '1.5rem' }}>
            {below1080 && (
              <Panel>
                <AutoColumn gap="20px">
                  <RowBetween>
                    <TYPE.main>Price</TYPE.main>
                    <div />
                  </RowBetween>
                  <RowBetween align="flex-end">
                    {' '}
                    <TYPE.main fontSize={'2rem'} lineHeight={1} fontWeight={600}>
                      {price}
                    </TYPE.main>
                    <TYPE.main>{priceChange}</TYPE.main>
                  </RowBetween>
                </AutoColumn>
              </Panel>
            )}
            <Panel>
              <AutoColumn gap="20px">
                <RowBetween>
                  <TYPE.main>Total Liquidity</TYPE.main>
                  <div />
                </RowBetween>
                <RowBetween align="flex-end">
                  <TYPE.main fontSize={'2rem'} lineHeight={1} fontWeight={600}>
                    {liquidity}
                  </TYPE.main>
                  <TYPE.main>{liquidityChange}</TYPE.main>
                </RowBetween>
              </AutoColumn>
            </Panel>
            <Panel>
              <AutoColumn gap="20px">
                <RowBetween>
                  <TYPE.main>Volume (24hrs)</TYPE.main>
                  <div />
                </RowBetween>
                <RowBetween align="flex-end">
                  <TYPE.main fontSize={'2rem'} lineHeight={1} fontWeight={600}>
                    {volume}
                  </TYPE.main>
                  <TYPE.main>{volumeChange}</TYPE.main>
                </RowBetween>
              </AutoColumn>
            </Panel>

            <Panel>
              <AutoColumn gap="20px">
                <RowBetween>
                  <TYPE.main>Total Pooled {symbol}</TYPE.main>
                  <div />
                </RowBetween>
                <RowBetween align="flex-end">
                  <TYPE.main fontSize={'2rem'} lineHeight={1} fontWeight={600}>
                    {tokenLiquidityFormatted}
                  </TYPE.main>
                  {/* <TYPE.main>{volumeChange}</TYPE.main> */}
                </RowBetween>
              </AutoColumn>
            </Panel>
            <Panel style={{ gridColumn: below1080 ? '1' : '2/4', gridRow: below1080 ? '' : '1/4' }}>
              <TokenChart chartData={chartData} token={address} color={backgroundColor} />
            </Panel>
          </PanelWrapper>
        </>
        <TYPE.main fontSize={'1.125rem'} style={{ marginTop: '3rem' }}>
          Top Pairs
        </TYPE.main>{' '}
        <Panel
          rounded
          style={{
            border: '1px solid rgba(43, 43, 43, 0.05)',
            marginTop: '1.5rem'
          }}
          p={20}
        >
          {address ? <PairList color={backgroundColor} address={address} pairs={allPairs} /> : <Loader />}
        </Panel>
        <RowBetween mt={40} mb={'1rem'}>
          <TYPE.main fontSize={'1.125rem'}>Transactions</TYPE.main>{' '}
          <AccountSearchWrapper>
            <Search size={16} />
            <AccountSearch
              value={accountInput}
              placeholder={'Filter by account'}
              onChange={e => {
                setAccountInput(e.target.value)
              }}
            />
          </AccountSearchWrapper>
        </RowBetween>
        <Panel
          rounded
          style={{
            border: '1px solid rgba(43, 43, 43, 0.05)'
          }}
        >
          {transactions ? <TxnList color={backgroundColor} transactions={transactions} /> : <Loader />}
        </Panel>
        <>
          <RowBetween style={{ marginTop: '3rem' }}>
            <TYPE.main fontSize={'1.125rem'}>Token Information</TYPE.main>{' '}
          </RowBetween>
          <Panel
            rounded
            style={{
              border: '1px solid rgba(43, 43, 43, 0.05)',
              marginTop: '1.5rem'
            }}
            p={20}
          >
            <TokenDetailsLayout>
              <Column>
                <TYPE.main>Symbol</TYPE.main>
                <Text style={{ marginTop: '.5rem' }} fontSize={24} fontWeight="500">
                  {symbol}
                </Text>
              </Column>
              <Column>
                <TYPE.main>Name</TYPE.main>
                <Text style={{ marginTop: '.5rem' }} fontSize={24} fontWeight="500">
                  {name}
                </Text>
              </Column>
              <Column>
                <TYPE.main>Address</TYPE.main>
                <AutoRow align="flex-end">
                  <Text style={{ marginTop: '.5rem' }} fontSize={24} fontWeight="500">
                    {address.slice(0, 8) + '...' + address.slice(36, 42)}
                  </Text>
                  <CopyHelper toCopy={address} />
                </AutoRow>
              </Column>
              <ButtonLight color={backgroundColor}>
                <Link color={backgroundColor} external href={'https://etherscan.io/address/' + address}>
                  View on Etherscan ↗
                </Link>
              </ButtonLight>
            </TokenDetailsLayout>
          </Panel>
        </>
      </DashboardWrapper>
    </PageWrapper>
  )
}

export default TokenPage
