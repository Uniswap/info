import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import styled from 'styled-components'
import { useMedia } from 'react-use'
import { Bookmark, Activity } from 'react-feather'

import { FEE_WARNING_TOKENS } from '../constants'
import { PageWrapper, ContentWrapper, StyledIcon } from '../components'
import TxnList from '../components/TxnList'
import Panel from '../components/Panel'
import Row, { AutoRow, RowFixed, RowBetween } from '../components/Row'
import { AutoColumn } from '../components/Column'
import UserChart from '../components/UserChart'
import PairReturnsChart from '../components/PairReturnsChart'
import PositionList from '../components/PositionList'
import { ButtonDropdown, ButtonDark } from '../components/ButtonStyled'
import DoubleTokenLogo from '../components/DoubleLogo'
import Link from '../components/Link'
import { BasicLink } from '../components/Link'
import Search from '../components/Search'
import { TYPE } from '../Theme'
import { useUserTransactions, useUserPositions } from '../contexts/User'
import { useSavedAccounts } from '../contexts/LocalStorage'
import { formattedNum, getEtherScanUrls } from '../utils'
import { useOnClickOutside } from '../hooks'
import useTheme from '../hooks/useTheme'
import { Flex, Text } from 'rebass'
import { useNetworksInfo } from '../contexts/NetworkInfo'

const AccountWrapper = styled.div`
  padding: 6px 16px 6px 0;
  border-radius: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
`

const Header = styled.div``

const DashboardWrapper = styled.div`
  width: 100%;
`

const DropdownWrapper = styled.div`
  position: relative;
  margin-bottom: 1rem;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 8px;
  max-width: 400px;
  width: 100%;
`

const Flyout = styled.div`
  position: absolute;
  top: 38px;
  left: -1px;
  width: 100%;
  background-color: ${({ theme }) => theme.background};
  z-index: 999;
  border-bottom-right-radius: 8px;
  border-bottom-left-radius: 8px;
  padding-top: 4px;
  border: 1px solid ${({ theme }) => theme.border};
  border-top: none;
`

const MenuRow = styled(Row)`
  width: 100%;
  padding: 12px 0;
  padding-left: 12px;

  :hover {
    cursor: pointer;
    background-color: ${({ theme }) => theme.buttonBlack};
  }
`

const PanelWrapper = styled.div`
  grid-template-columns: 1fr;
  grid-template-rows: max-content;
  gap: 6px;
  display: inline-grid;
  width: 100%;
  align-items: start;
`

const Warning = styled.div`
  background-color: ${({ theme }) => theme.bg2};
  color: ${({ theme }) => theme.text1};
  padding: 1rem;
  font-weight: 600;
  border-radius: 10px;
  margin-bottom: 1rem;
  width: calc(100% - 2rem);
`

function AccountPage({ account }) {
  const [[networkInfo]] = useNetworksInfo()
  // get data for this account
  const transactions = useUserTransactions(account)
  const positions = useUserPositions(account)

  // get data for user stats
  const transactionCount = transactions?.swaps?.length + transactions?.burns?.length + transactions?.mints?.length

  // get derived totals
  let totalSwappedUSD = useMemo(() => {
    return transactions?.swaps
      ? transactions?.swaps.reduce((total, swap) => {
          return total + parseFloat(swap.amountUSD)
        }, 0)
      : 0
  }, [transactions])

  // if any position has token from fee warning list, show warning
  const [showWarning, setShowWarning] = useState(false)
  useEffect(() => {
    if (positions) {
      for (let i = 0; i < positions.length; i++) {
        if (
          FEE_WARNING_TOKENS.includes(positions[i].pair.token0.id) ||
          FEE_WARNING_TOKENS.includes(positions[i].pair.token1.id)
        ) {
          setShowWarning(true)
        }
      }
    }
  }, [positions])

  const theme = useTheme()

  // settings for list view and dropdowns
  const hideLPContent = positions && positions.length === 0
  const [showDropdown, setShowDropdown] = useState(false)
  const node = useRef()
  useOnClickOutside(node, () => setShowDropdown(false))
  const [activePosition, setActivePosition] = useState()

  const dynamicPositions = useMemo(() => (activePosition ? [activePosition] : positions), [activePosition, positions])

  // const aggregateFees = dynamicPositions?.reduce(function (total, position) {
  //   return total + position.fees.sum
  // }, 0)

  const positionValue = useMemo(() => {
    return dynamicPositions
      ? dynamicPositions.reduce((total, position) => {
          return (
            total +
            (parseFloat(position?.liquidityTokenBalance) / parseFloat(position?.pool?.totalSupply)) * position?.pool?.reserveUSD
          )
        }, 0)
      : null
  }, [dynamicPositions])

  useEffect(() => {
    window.scrollTo({
      behavior: 'smooth',
      top: 0,
    })
  }, [])

  const below600 = useMedia('(max-width: 600px)')

  // adding/removing account from saved accounts
  const [savedAccounts, addAccount, removeAccount] = useSavedAccounts()
  const isBookmarked = savedAccounts.some(savedAccount => savedAccount.address === account)
  const handleBookmarkClick = useCallback(() => {
    ;(isBookmarked ? removeAccount : addAccount)(account, networkInfo.chainId)
  }, [isBookmarked, removeAccount, addAccount, account, networkInfo.chainId])
  const urls = useMemo(() => getEtherScanUrls(networkInfo), [networkInfo])

  return (
    <PageWrapper>
      <ContentWrapper>
        <RowBetween>
          <TYPE.body>
            <BasicLink to={'/' + networkInfo.urlKey + '/accounts'}>{'Accounts '}</BasicLink>→{' '}
            <Link lineHeight={'145.23%'} href={urls.showAddress(account)} target='_blank'>
              {account?.slice(0, 42)}
            </Link>
          </TYPE.body>
          {!below600 && <Search small={true} />}
        </RowBetween>
        <Header>
          <Flex
            alignItems={below600 ? 'flex-start' : 'center'}
            flexDirection={below600 ? 'column' : 'row'}
            justifyContent='space-between'
          >
            <span>
              <TYPE.header fontSize={24}>{account?.slice(0, 6) + '...' + account?.slice(38, 42)}</TYPE.header>
            </span>
            <AccountWrapper>
              {!below600 && (
                <StyledIcon>
                  <Bookmark
                    onClick={handleBookmarkClick}
                    style={{ opacity: isBookmarked ? 0.8 : 0.4, cursor: 'pointer', marginRight: '16px' }}
                  />
                </StyledIcon>
              )}
              <Link lineHeight={'145.23%'} href={urls.showAddress(account)} target='_blank'>
                <ButtonDark>
                  <Text fontSize={14}>View on {networkInfo.etherscanLinkText}↗</Text>
                </ButtonDark>
              </Link>
            </AccountWrapper>
          </Flex>
        </Header>
        <DashboardWrapper>
          {showWarning && <Warning>Fees cannot currently be calculated for pairs that include AMPL.</Warning>}
          {!hideLPContent && (
            <DropdownWrapper ref={node}>
              <ButtonDropdown
                width='100%'
                onClick={() => setShowDropdown(!showDropdown)}
                open={showDropdown}
                style={{ borderRadius: '8px', background: theme.background }}
              >
                {!activePosition && (
                  <RowFixed>
                    <StyledIcon>
                      <Activity size={16} />
                    </StyledIcon>
                    <TYPE.body ml={'10px'}>All Positions</TYPE.body>
                  </RowFixed>
                )}
                {activePosition && (
                  <RowFixed>
                    <DoubleTokenLogo
                      a0={activePosition.pair.token0.id}
                      a1={activePosition.pair.token1.id}
                      size={16}
                      networkInfo={networkInfo}
                    />
                    <TYPE.body ml={'16px'}>
                      {activePosition.pair.token0.symbol}-{activePosition.pair.token1.symbol} Position
                    </TYPE.body>
                  </RowFixed>
                )}
              </ButtonDropdown>
              {showDropdown && (
                <Flyout>
                  <AutoColumn gap='0px'>
                    {positions?.map((p, i) => {
                      if (p.pair.token1.symbol === 'WETH') {
                        p.pair.token1.symbol = 'ETH'
                      }
                      if (p.pair.token0.symbol === 'WETH') {
                        p.pair.token0.symbol = 'ETH'
                      }
                      return (
                        p.pair.id !== activePosition?.pair.id && (
                          <MenuRow
                            onClick={() => {
                              setActivePosition(p)
                              setShowDropdown(false)
                            }}
                            key={i}
                          >
                            <DoubleTokenLogo a0={p.pair.token0.id} a1={p.pair.token1.id} size={16} networkInfo={networkInfo} />
                            <TYPE.body ml={'16px'}>
                              {p.pair.token0.symbol}-{p.pair.token1.symbol} Position
                            </TYPE.body>
                          </MenuRow>
                        )
                      )
                    })}
                    {activePosition && (
                      <MenuRow
                        onClick={() => {
                          setActivePosition()
                          setShowDropdown(false)
                        }}
                      >
                        <RowFixed>
                          <StyledIcon>
                            <Activity size={16} />
                          </StyledIcon>
                          <TYPE.body ml={'10px'}>All Positions</TYPE.body>
                        </RowFixed>
                      </MenuRow>
                    )}
                  </AutoColumn>
                </Flyout>
              )}
            </DropdownWrapper>
          )}
          {!hideLPContent && (
            <Panel style={{ height: '100%', marginBottom: '1rem' }}>
              <AutoRow gap='20px'>
                <AutoColumn gap='12px'>
                  <RowBetween>
                    <TYPE.body color={theme.subText}> Liquidity (Including Fees)</TYPE.body>
                    <div />
                  </RowBetween>
                  <RowFixed align='flex-end'>
                    <TYPE.header fontSize={'24px'} lineHeight={1}>
                      {positionValue ? formattedNum(positionValue, true) : positionValue === 0 ? formattedNum(0, true) : '-'}
                    </TYPE.header>
                  </RowFixed>
                </AutoColumn>
                {/* <AutoColumn gap="10px">
                  <RowBetween>
                    <TYPE.body>Fees Earned (Cumulative)</TYPE.body>
                    <div />
                  </RowBetween>
                  <RowFixed align="flex-end">
                    <TYPE.header fontSize={'24px'} lineHeight={1} color={aggregateFees && 'green'}>
                      {aggregateFees ? formattedNum(aggregateFees, true, true) : '-'}
                    </TYPE.header>
                  </RowFixed>
                </AutoColumn> */}
              </AutoRow>
            </Panel>
          )}
          {!hideLPContent && (
            <PanelWrapper>
              <Panel style={{ gridColumn: '1' }}>
                {activePosition ? (
                  <PairReturnsChart account={account} position={activePosition} />
                ) : (
                  <UserChart account={account} position={activePosition} />
                )}
              </Panel>
            </PanelWrapper>
          )}
          <TYPE.main fontSize={'1.125rem'} style={{ marginTop: '3rem' }}>
            Positions
          </TYPE.main>{' '}
          <Panel
            style={{
              marginTop: '1.5rem',
              padding: 0,
            }}
          >
            <PositionList positions={positions} />
          </Panel>
          <TYPE.main fontSize={'1.125rem'} style={{ marginTop: '3rem' }}>
            Latest Transactions
          </TYPE.main>{' '}
          <Panel
            style={{
              marginTop: '1.5rem',
              padding: 0,
            }}
          >
            <TxnList transactions={[transactions]} />
          </Panel>
          <TYPE.main fontSize={'1.125rem'} style={{ marginTop: '3rem' }}>
            Wallet Statistics
          </TYPE.main>{' '}
          <Panel
            style={{
              marginTop: '1.5rem',
            }}
          >
            <AutoRow gap='20px'>
              <AutoColumn gap='12px'>
                <TYPE.main color={theme.subText} fontSize='12px'>
                  TOTAL VALUE SWAPPED
                </TYPE.main>
                <TYPE.header fontSize={18}>{totalSwappedUSD ? formattedNum(totalSwappedUSD, true) : '-'}</TYPE.header>
              </AutoColumn>
              <AutoColumn gap='12px'>
                <TYPE.main color={theme.subText} fontSize='12px'>
                  TOTAL FEES PAID
                </TYPE.main>
                <TYPE.header fontSize={18}>{totalSwappedUSD ? formattedNum(totalSwappedUSD * 0.003, true) : '-'}</TYPE.header>
              </AutoColumn>
              <AutoColumn gap='12px'>
                <TYPE.main color={theme.subText} fontSize='12px'>
                  TOTAL TRANSACTIONS
                </TYPE.main>
                <TYPE.header fontSize={18}>{transactionCount ? transactionCount : '-'}</TYPE.header>
              </AutoColumn>
            </AutoRow>
          </Panel>
        </DashboardWrapper>
      </ContentWrapper>
    </PageWrapper>
  )
}

export default AccountPage
