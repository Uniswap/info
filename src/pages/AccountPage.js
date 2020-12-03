import React, { useState, useMemo, useEffect } from 'react'
import styled from 'styled-components'
import { useUserTransactions, useUserPositions, useMiningPositions } from '../contexts/User'
import TxnList from '../components/TxnList'
import Panel from '../components/Panel'
import { formattedNum } from '../utils'
import Row, { AutoRow, RowFixed, RowBetween } from '../components/Row'
import { AutoColumn } from '../components/Column'
import UserChart from '../components/UserChart'
import PairReturnsChart from '../components/PairReturnsChart'
import PositionList from '../components/PositionList'
import MiningPositionList from '../components/MiningPositionList'
import { TYPE } from '../Theme'
import { ButtonDropdown, ButtonLight } from '../components/ButtonStyled'
import { PageWrapper, ContentWrapper, StyledIcon } from '../components'
import DoubleTokenLogo from '../components/DoubleLogo'
import { Activity } from 'react-feather'
import Link from '../components/Link'
import { FEE_WARNING_TOKENS } from '../constants'
import { BasicLink } from '../components/Link'
import { useMedia } from 'react-use'
import Search from '../components/Search'

const Header = styled.div``

const DashboardWrapper = styled.div`
  width: 100%;
`

const DropdownWrapper = styled.div`
  position: relative;
  border: 1px solid #edeef2;
  border-radius: 12px;
`

const Flyout = styled.div`
  position: absolute;
  top: 38px;
  left: -1px;
  width: 100%;
  background-color: ${({ theme }) => theme.bg1};
  z-index: 999;
  border-bottom-right-radius: 10px;
  border-bottom-left-radius: 10px;
  padding-top: 4px;
  border: 1px solid #edeef2;
  border-top: none;
`

const MenuRow = styled(Row)`
  width: 100%;
  padding: 12px 0;
  padding-left: 12px;

  :hover {
    cursor: pointer;
    background-color: ${({ theme }) => theme.bg2};
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

const FlexWrap = styled.div`
  display: flex;

  > div {
    margin-right: 40px;
  }

  @media screen and (max-width: 600px) {
    flex-wrap: wrap;

    > div {
      margin-bottom: 24px;
    }
  }
`

function AccountPage({ account }) {
  // get data for this account
  const transactions = useUserTransactions(account)
  const positions = useUserPositions(account)
  const miningPositions = useMiningPositions(account)

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

  const aggregateFees = dynamicPositions?.reduce(function (total, position) {
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
      top: 0,
    })
  }, [])

  const below600 = useMedia('(max-width: 600px)')

  return (
    <PageWrapper style={{ paddingBottom: 56 }}>
      <ContentWrapper>
        <RowBetween>
          <TYPE.main fontSize={15}>
            <BasicLink to="/accounts" style={{ marginRight: 4 }}>
              Accounts
            </BasicLink>
            →
            <Link
              color="#000000"
              lineHeight={'145.23%'}
              href={'https://etherscan.io/address/' + account}
              target="_blank"
              style={{ marginLeft: 4 }}
            >
              {account?.slice(0, 42)}
            </Link>
          </TYPE.main>
          {!below600 && <Search small={true} />}
        </RowBetween>
        <Header>
          <RowBetween>
            <span>
              <TYPE.header fontSize={24}>{account?.slice(0, 6) + '...' + account?.slice(38, 42)}</TYPE.header>
              <Link lineHeight={'145.23%'} href={'https://etherscan.io/address/' + account} target="_blank">
                <TYPE.main fontSize={15}>View on Etherscan</TYPE.main>
              </Link>
            </span>
          </RowBetween>
        </Header>
        <DashboardWrapper>
          {showWarning && <Warning>Fees cannot currently be calculated for pairs that include AMPL.</Warning>}
          {!hideLPContent && (
            <DropdownWrapper>
              <ButtonDropdown width="100%" onClick={() => setShowDropdown(!showDropdown)} open={showDropdown}>
                {!activePosition && (
                  <RowFixed>
                    <StyledIcon>
                      <Activity size={14} />
                    </StyledIcon>
                    <TYPE.body ml={'10px'}>All Positions</TYPE.body>
                  </RowFixed>
                )}
                {activePosition && (
                  <RowFixed>
                    <DoubleTokenLogo a0={activePosition.pair.token0.id} a1={activePosition.pair.token1.id} size={20} />
                    <TYPE.body ml={'10px'}>
                      {activePosition.pair.token0.symbol}-{activePosition.pair.token1.symbol} Position
                    </TYPE.body>
                  </RowFixed>
                )}
              </ButtonDropdown>
              {showDropdown && (
                <Flyout>
                  <AutoColumn gap="0px">
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
                            <DoubleTokenLogo a0={p.pair.token0.id} a1={p.pair.token1.id} size={16} />
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
            <Panel style={{ height: '100%', padding: below600 ? '30px 30px 0 30px' : 30 }}>
              <FlexWrap>
                <AutoColumn gap="14px">
                  <RowBetween>
                    <TYPE.main fontSize={15}>Liquidity (Including Fees)</TYPE.main>
                    <div />
                  </RowBetween>
                  <RowFixed align="flex-end">
                    <TYPE.header fontSize={'24px'} lineHeight={1}>
                      {positionValue
                        ? formattedNum(positionValue, true)
                        : positionValue === 0
                        ? formattedNum(0, true)
                        : '-'}
                    </TYPE.header>
                  </RowFixed>
                </AutoColumn>
                <AutoColumn gap="14px">
                  <RowBetween>
                    <TYPE.main fontSize={15}>Fees Earned (Cumulative)</TYPE.main>
                    <div />
                  </RowBetween>
                  <RowFixed align="flex-end">
                    <TYPE.header fontSize={'24px'} lineHeight={1} color={aggregateFees && '#2CB48A'}>
                      {aggregateFees ? formattedNum(aggregateFees, true, true) : '-'}
                    </TYPE.header>
                  </RowFixed>
                </AutoColumn>
              </FlexWrap>
            </Panel>
          )}
          {!hideLPContent && (
            <PanelWrapper>
              <Panel style={{ gridColumn: '1', padding: 20 }}>
                {activePosition ? (
                  <PairReturnsChart account={account} position={activePosition} />
                ) : (
                  <UserChart account={account} position={activePosition} />
                )}
              </Panel>
            </PanelWrapper>
          )}
          <TYPE.main fontSize={18} style={{ marginTop: below600 ? 34 : 40 }}>
            Positions
          </TYPE.main>
          <Panel
            style={{
              marginTop: 18,
            }}
          >
            <PositionList positions={positions} />
          </Panel>
          <TYPE.main fontSize={18} style={{ marginTop: below600 ? 34 : 40 }}>
            Liquidity Mining Pools
          </TYPE.main>
          <Panel
            style={{
              marginTop: 18,
              padding: 30,
            }}
          >
            {miningPositions && <MiningPositionList miningPositions={miningPositions} />}
            {!miningPositions && (
              <AutoColumn gap="14px" justify="flex-start">
                <TYPE.main>No Staked Liquidity.</TYPE.main>
                <AutoRow gap="14px" justify="flex-start">
                  <ButtonLight style={{ padding: '4px 6px', borderRadius: '4px' }}>Learn More</ButtonLight>{' '}
                </AutoRow>
              </AutoColumn>
            )}
          </Panel>
          <TYPE.main fontSize={18} style={{ marginTop: below600 ? 34 : 40 }}>
            Transactions
          </TYPE.main>
          <Panel
            style={{
              marginTop: 18,
            }}
          >
            <TxnList transactions={transactions} />
          </Panel>
          <TYPE.main fontSize={18} style={{ marginTop: below600 ? 34 : 40 }}>
            Wallet Stats
          </TYPE.main>
          <Panel
            style={{
              marginTop: 18,
              padding: below600 ? 20 : 30,
            }}
          >
            <FlexWrap>
              <AutoColumn gap="14px">
                <TYPE.header fontSize={24}>{totalSwappedUSD ? formattedNum(totalSwappedUSD, true) : '-'}</TYPE.header>
                <TYPE.main fontSize={15}>Total Value Swapped</TYPE.main>
              </AutoColumn>
              <AutoColumn gap="14px">
                <TYPE.header fontSize={24}>
                  {totalSwappedUSD ? formattedNum(totalSwappedUSD * 0.003, true) : '-'}
                </TYPE.header>
                <TYPE.main fontSize={15}>Total Fees Paid</TYPE.main>
              </AutoColumn>
              <AutoColumn gap="14px">
                <TYPE.header fontSize={24}>{transactionCount ? transactionCount : '-'}</TYPE.header>
                <TYPE.main fontSize={15}>Total Transactions</TYPE.main>
              </AutoColumn>
            </FlexWrap>
          </Panel>
        </DashboardWrapper>
      </ContentWrapper>
    </PageWrapper>
  )
}

export default AccountPage
