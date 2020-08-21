import React, { useState, useMemo, useEffect } from 'react'
import styled from 'styled-components'
import { useUserTransactions, useUserPositions } from '../contexts/User'
import TxnList from '../components/TxnList'
import Panel from '../components/Panel'
import { formattedNum } from '../utils'
import Row, { AutoRow, RowFixed, RowBetween } from '../components/Row'
import { Text } from 'rebass'
import { AutoColumn } from '../components/Column'
import UserChart from '../components/UserChart'
import PairReturnsChart from '../components/PairReturnsChart'
import PositionList from '../components/PositionList'
import { TYPE } from '../Theme'
import { ButtonDropdown } from '../components/ButtonStyled'
import { PageWrapper, ContentWrapper } from '../components'
import DoubleTokenLogo from '../components/DoubleLogo'
import { Bookmark, Activity } from 'react-feather'
import Link from '../components/Link'
import { FEE_WARNING_TOKENS } from '../constants'
import { BasicLink } from '../components/Link'
import { useMedia } from 'react-use'
import Search from '../components/Search'

const AccountWrapper = styled.div`
  background-color: rgba(255, 255, 255, 0.2);
  padding: 6px 16px;
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
  border: 1px solid #edeef2;
  border-radius: 12px;
`

const Flyout = styled.div`
  position: absolute;
  top: 32px;
  left: -1px;
  width: 100%;
  background-color: white;
  z-index: 999;
  border-bottom-right-radius: 10px;
  border-bottom-left-radius: 10px;
  padding-top: 26px;
  border: 1px solid #edeef2;
  border-top: none;
`

const MenuRow = styled(Row)`
  width: 100%;
  padding: 12px 0;
  padding-left: 12px;

  :hover {
    cursor: pointer;
    background-color: #f7f8fa;
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
  padding: 1rem;
  font-weight: 600;
  border-radius: 10px;
  margin-bottom: 1rem;
  width: calc(100% - 2rem);
`

function AccountPage({ account }) {
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

  // settings for list view and dropdowns
  const hideLPContent = positions && positions.length === 0
  const [showDropdown, setShowDropdown] = useState(false)
  const [activePosition, setActivePosition] = useState()

  const dynamicPositions = activePosition ? [activePosition] : positions

  const aggregateFees = dynamicPositions?.reduce(function(total, position) {
    return total + position.fees.sum
  }, 0)

  const positionValue = useMemo(() => {
    return dynamicPositions
      ? dynamicPositions.reduce((total, position) => {
          return (
            total +
            (parseFloat(position?.liquidityTokenBalance) / parseFloat(position?.pair?.totalSupply)) *
              position?.pair?.reserveUSD
          )
        }, 0)
      : null
  }, [dynamicPositions])

  useEffect(() => {
    window.scrollTo({
      behavior: 'smooth',
      top: 0
    })
  }, [])

  const below600 = useMedia('(max-width: 600px)')

  return (
    <PageWrapper>
      <ContentWrapper>
        <RowBetween>
          <Text>
            <BasicLink to="/accounts">{'Accounts '}</BasicLink>→{' '}
            <Link lineHeight={'145.23%'} href={'https://etherscan.io/address/' + account} target="_blank">
              {' '}
              {account?.slice(0, 42)}{' '}
            </Link>
          </Text>
          {!below600 && <Search small={true} />}
        </RowBetween>
        <Header>
          <RowBetween>
            <span>
              <Text fontSize={24} fontWeight={600}>
                {account?.slice(0, 6) + '...' + account?.slice(38, 42)}
              </Text>

              <Link lineHeight={'145.23%'} href={'https://etherscan.io/address/' + account} target="_blank">
                <Text fontSize={14} fontWeight={500}>
                  View on Etherscan
                </Text>
              </Link>
            </span>
            <AccountWrapper>
              <Bookmark style={{ opacity: 0.4 }} />
            </AccountWrapper>
          </RowBetween>
        </Header>
        <DashboardWrapper>
          {showWarning && <Warning>Fees cannot currently be calculated for pairs that include AMPL.</Warning>}
          {!hideLPContent && (
            <DropdownWrapper>
              <ButtonDropdown
                width="100%"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.4)' }}
                onClick={() => setShowDropdown(!showDropdown)}
                open={showDropdown}
              >
                {!activePosition && (
                  <RowFixed>
                    <Activity stroke="black" size={16} />
                    <Text fontSize="16px" color="black" fontWeight={400} ml={'10px'}>
                      All Positions
                    </Text>
                  </RowFixed>
                )}
                {activePosition && (
                  <RowFixed>
                    <DoubleTokenLogo a0={activePosition.pair.token0.id} a1={activePosition.pair.token1.id} size={16} />
                    <Text fontWeight={400} color="black" ml={'16px'} fontSize="16px">
                      {activePosition.pair.token0.symbol}-{activePosition.pair.token1.symbol} Position
                    </Text>
                  </RowFixed>
                )}
              </ButtonDropdown>
              {showDropdown && (
                <Flyout>
                  <AutoColumn gap="0px">
                    {positions?.map((p, i) => {
                      return (
                        p.pair.id !== activePosition?.pair.id && (
                          <MenuRow
                            onClick={() => {
                              setActivePosition(p)
                              setShowDropdown(false)
                            }}
                            key={i}
                          >
                            <DoubleTokenLogo a0={p.pair.token0.id} a1={p.pair.token1.id} size={16} />
                            <Text fontWeight={400} color="black" ml={'16px'} fontSize="16px">
                              {p.pair.token0.symbol}-{p.pair.token1.symbol} Position
                            </Text>
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
                          <Activity stroke="black" size={16} />
                          <Text fontSize="16px" color="black" fontWeight={400} ml={'10px'}>
                            All Positions
                          </Text>
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
              <AutoRow gap="20px">
                <AutoColumn gap="10px">
                  <RowBetween>
                    <TYPE.main fontSize={'16px'} fontWeight={400} color="#888D9B">
                      Liquidity (Including Fees)
                    </TYPE.main>
                    <div />
                  </RowBetween>
                  <RowFixed align="flex-end">
                    <TYPE.main fontSize={'24px'} lineHeight={1} fontWeight={600}>
                      {positionValue
                        ? formattedNum(positionValue, true)
                        : positionValue === 0
                        ? formattedNum(0, true)
                        : '-'}
                    </TYPE.main>
                  </RowFixed>
                </AutoColumn>
                <AutoColumn gap="10px">
                  <RowBetween>
                    <TYPE.main fontSize={'16px'} fontWeight={400} color="#888D9B">
                      Fees Earned (Cumulative)
                    </TYPE.main>
                    <div />
                  </RowBetween>
                  <RowFixed align="flex-end">
                    <TYPE.main
                      fontSize={'24px'}
                      lineHeight={1}
                      fontWeight={600}
                      color={aggregateFees ? 'green' : 'black'}
                    >
                      {aggregateFees ? formattedNum(aggregateFees, true, true) : '-'}
                    </TYPE.main>
                  </RowFixed>
                </AutoColumn>
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
              border: '1px solid rgba(43, 43, 43, 0.05)',
              marginTop: '1.5rem'
            }}
          >
            <PositionList positions={positions} />
          </Panel>
          <TYPE.main fontSize={'1.125rem'} style={{ marginTop: '3rem' }}>
            Transactions
          </TYPE.main>{' '}
          <Panel
            style={{
              border: '1px solid rgba(43, 43, 43, 0.05)',
              marginTop: '1.5rem'
            }}
          >
            <TxnList transactions={transactions} />
          </Panel>
          <TYPE.main fontSize={'1.125rem'} style={{ marginTop: '3rem' }}>
            Wallet Stats
          </TYPE.main>{' '}
          <Panel
            style={{
              border: '1px solid rgba(43, 43, 43, 0.05)',
              marginTop: '1.5rem'
            }}
          >
            <AutoRow gap="20px">
              <AutoColumn gap="8px">
                <Text fontSize={24} fontWeight={600}>
                  {totalSwappedUSD ? formattedNum(totalSwappedUSD, true) : '-'}
                </Text>
                <Text fontSize={16}>Total Value Swapped</Text>
              </AutoColumn>
              <AutoColumn gap="8px">
                <Text fontSize={24} fontWeight={600}>
                  {totalSwappedUSD ? formattedNum(totalSwappedUSD * 0.003, true) : '-'}
                </Text>
                <Text fontSize={16}>Total Fees Paid</Text>
              </AutoColumn>
              <AutoColumn gap="8px">
                <Text fontSize={24} fontWeight={600}>
                  {transactionCount ? transactionCount : '-'}
                </Text>
                <Text fontSize={16}>Total Transactions</Text>
              </AutoColumn>
            </AutoRow>
          </Panel>
        </DashboardWrapper>
      </ContentWrapper>
    </PageWrapper>
  )
}

export default AccountPage
