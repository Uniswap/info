import { useState, useMemo, useEffect } from 'react'
import { useUserTransactions, useUserPositions } from 'state/features/account/hooks'
import TxnList from 'components/TxnList'
import { useParams, Navigate } from 'react-router-dom'
import Panel from 'components/Panel'
import { formattedNum, isAddress } from 'utils'
import { AutoRow, RowFixed, RowBetween } from 'components/Row'
import { AutoColumn } from 'components/Column'
import UserChart from 'components/UserChart'
import PairReturnsChart from 'components/PairReturnsChart'
import PositionList from 'components/PositionList'
import { useFormatPath } from 'hooks'
import { DashboardWrapper, TYPE } from 'Theme'
import { ButtonDropdown } from 'components/ButtonStyled'
import { PageWrapper, ContentWrapper, StyledIcon } from 'components'
import DoubleTokenLogo from 'components/DoubleLogo'
import { Bookmark, Activity } from 'react-feather'
import Link from 'components/Link'
import { FEE_WARNING_TOKENS } from 'constants/index'
import { BasicLink } from 'components/Link'
import { useMedia } from 'react-use'
import Search from 'components/Search'
import { useTranslation } from 'react-i18next'
import { AccountWrapper, DropdownWrapper, Flyout, Header, MenuRow, Warning } from './styled'

function AccountPage() {
  const { t } = useTranslation()
  const formatPath = useFormatPath()

  const { accountAddress } = useParams()
  if (!isAddress(accountAddress?.toLowerCase())) {
    return <Navigate to={formatPath('/')} />
  }

  const below600 = useMedia('(max-width: 600px)')
  const below440 = useMedia('(max-width: 440px)')

  // get data for this account
  const transactions = useUserTransactions(accountAddress)
  const positions = useUserPositions(accountAddress)

  // get data for user stats
  const transactionCount = transactions?.swaps?.length + transactions?.burns?.length + transactions?.mints?.length

  // get derived totals
  const totalSwappedUSD = useMemo(() => {
    console.log(transactions)
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
      top: 0
    })
  }, [])

  return (
    <PageWrapper>
      <ContentWrapper>
        <RowBetween>
          <TYPE.body>
            <BasicLink to={formatPath('/accounts')}>{`${t('accounts')} `}</BasicLink>→
            <Link lineHeight={'145.23%'} href={'https://etherscan.io/address/' + accountAddress} target="_blank">
              {accountAddress?.slice(0, 42)}
            </Link>
          </TYPE.body>
          {!below600 && <Search small={true} />}
        </RowBetween>
        <Header>
          <RowBetween>
            <span>
              <TYPE.header fontSize={24}>
                {accountAddress?.slice(0, 6) + '...' + accountAddress?.slice(38, 42)}
              </TYPE.header>
              <Link lineHeight={'145.23%'} href={'https://etherscan.io/address/' + accountAddress} target="_blank">
                <TYPE.main fontSize={14}>{t('viewOnEtherscan')}</TYPE.main>
              </Link>
            </span>
            <AccountWrapper>
              <StyledIcon>
                <Bookmark style={{ opacity: 0.4 }} />
              </StyledIcon>
            </AccountWrapper>
          </RowBetween>
        </Header>
        {showWarning && <Warning>{t('feesCantBeCalc')}</Warning>}
        {!hideLPContent && (
          <DropdownWrapper>
            <ButtonDropdown width="100%" onClick={() => setShowDropdown(!showDropdown)} open={showDropdown}>
              {!activePosition && (
                <RowFixed>
                  <StyledIcon>
                    <Activity size={16} />
                  </StyledIcon>
                  <TYPE.body ml={'10px'}>{t('allPositions')}</TYPE.body>
                </RowFixed>
              )}
              {activePosition && (
                <RowFixed>
                  <DoubleTokenLogo a0={activePosition.pair.token0.id} a1={activePosition.pair.token1.id} size={16} />
                  <TYPE.body ml={'16px'}>
                    {activePosition.pair.token0.symbol}-{activePosition.pair.token1.symbol} {t('position')}
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
                            {p.pair.token0.symbol}-{p.pair.token1.symbol} {t('position')}
                          </TYPE.body>
                        </MenuRow>
                      )
                    )
                  })}
                  {activePosition && (
                    <MenuRow
                      onClick={() => {
                        setActivePosition(undefined)
                        setShowDropdown(false)
                      }}
                    >
                      <RowFixed>
                        <StyledIcon>
                          <Activity size={16} />
                        </StyledIcon>
                        <TYPE.body ml={'10px'}>{t('allPositions')}</TYPE.body>
                      </RowFixed>
                    </MenuRow>
                  )}
                </AutoColumn>
              </Flyout>
            )}
          </DropdownWrapper>
        )}
        {!hideLPContent && (
          <DashboardWrapper>
            <AutoRow gap="1.5rem">
              <AutoColumn gap="10px">
                <RowBetween>
                  <TYPE.light fontSize={below440 ? 12 : 14} fontWeight={500}>
                    {t('liquidityIncludingFees')}
                  </TYPE.light>
                  <div />
                </RowBetween>
                <RowFixed>
                  <TYPE.header fontSize={below440 ? 18 : 24} lineHeight={1}>
                    {positionValue
                      ? formattedNum(positionValue, true)
                      : positionValue === 0
                      ? formattedNum(0, true)
                      : '-'}
                  </TYPE.header>
                </RowFixed>
              </AutoColumn>
              <AutoColumn gap="10px">
                <RowBetween>
                  <TYPE.light fontSize={below440 ? 12 : 14} fontWeight={500}>
                    {t('feesEarnedCumulative')}
                  </TYPE.light>
                  <div />
                </RowBetween>
                <RowFixed align="flex-end">
                  <TYPE.header fontSize={below440 ? 18 : 24} lineHeight={1} color={aggregateFees && 'green'}>
                    {aggregateFees ? formattedNum(aggregateFees, true, true) : '-'}
                  </TYPE.header>
                </RowFixed>
              </AutoColumn>
            </AutoRow>
          </DashboardWrapper>
        )}
        {!hideLPContent && (
          <DashboardWrapper>
            {activePosition ? (
              <PairReturnsChart account={accountAddress} position={activePosition} />
            ) : (
              <UserChart account={accountAddress} />
            )}
          </DashboardWrapper>
        )}

        <DashboardWrapper>
          <TYPE.main fontSize={22} fontWeight={500}>
            {t('positions')}
          </TYPE.main>
          <PositionList positions={positions} />
        </DashboardWrapper>

        <DashboardWrapper>
          <TYPE.main fontSize={22} fontWeight={500}>
            {t('transactions')}
          </TYPE.main>
          <TxnList transactions={transactions} />
        </DashboardWrapper>

        <DashboardWrapper>
          <TYPE.main fontSize={22} fontWeight={500}>
            {t('walletStats')}
          </TYPE.main>
          <Panel
            style={{
              marginTop: below440 ? '.75rem' : '1.5rem'
            }}
          >
            {below440 && (
              <AutoColumn gap=".75rem">
                <AutoColumn gap="8px">
                  <TYPE.header fontSize={24}>{totalSwappedUSD ? formattedNum(totalSwappedUSD, true) : '-'}</TYPE.header>
                  <TYPE.main>{t('totalValueSwapped')}</TYPE.main>
                </AutoColumn>
                <AutoColumn gap="8px">
                  <TYPE.header fontSize={24}>
                    {totalSwappedUSD ? formattedNum(totalSwappedUSD * 0.003, true) : '-'}
                  </TYPE.header>
                  <TYPE.main>Total Fees Paid</TYPE.main>
                </AutoColumn>
                <AutoColumn gap="8px">
                  <TYPE.header fontSize={24}>{transactionCount ? transactionCount : '-'}</TYPE.header>
                  <TYPE.main>{t('totalTransactions')}</TYPE.main>
                </AutoColumn>
              </AutoColumn>
            )}
            {!below440 && (
              <AutoRow gap="20px">
                <AutoColumn gap="8px">
                  <TYPE.header fontSize={24}>{totalSwappedUSD ? formattedNum(totalSwappedUSD, true) : '-'}</TYPE.header>
                  <TYPE.main>{t('totalValueSwapped')}</TYPE.main>
                </AutoColumn>
                <AutoColumn gap="8px">
                  <TYPE.header fontSize={24}>
                    {totalSwappedUSD ? formattedNum(totalSwappedUSD * 0.003, true) : '-'}
                  </TYPE.header>
                  <TYPE.main>{t('totalFeesPaid')}</TYPE.main>
                </AutoColumn>
                <AutoColumn gap="8px">
                  <TYPE.header fontSize={24}>{transactionCount ? transactionCount : '-'}</TYPE.header>
                  <TYPE.main>{t('totalTransactions')}</TYPE.main>
                </AutoColumn>
              </AutoRow>
            )}
          </Panel>
        </DashboardWrapper>
      </ContentWrapper>
    </PageWrapper>
  )
}

export default AccountPage
