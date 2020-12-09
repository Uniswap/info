import React, { useState } from 'react'
import 'feather-icons'
import { withRouter } from 'react-router-dom'
import { Text } from 'rebass'
import styled from 'styled-components/macro'
import Link from '../components/Link'
import Panel from '../components/Panel'
import TokenLogo from '../components/TokenLogo'
import PairList from '../components/PairList'
import Loader from '../components/LocalLoader'
import { AutoRow, RowBetween, RowFixed } from '../components/Row'
import Column, { AutoColumn } from '../components/Column'
import { ButtonLight, ButtonDark } from '../components/ButtonStyled'
import TxnList from '../components/TxnList'
import TokenChart from '../components/TokenChart'
import { BasicLink } from '../components/Link'
import Search from '../components/Search'
import { formattedNum, formattedPercent, getPoolLink, getSwapLink, localNumber } from '../utils'
import { useTokenData, useTokenTransactions, useTokenPairs } from '../contexts/TokenData'
import { TYPE } from '../Theme'
import { useColor } from '../hooks'
import CopyHelper from '../components/Copy'
import { useMedia } from 'react-use'
import { useDataForList } from '../contexts/PairData'
import { useEffect } from 'react'
import Warning from '../components/Warning'
import { usePathDismissed, useSavedTokens } from '../contexts/LocalStorage'
import { Hover, PageWrapper, ContentWrapper, StyledIcon } from '../components'
import { PlusCircle, Bookmark } from 'react-feather'
import FormattedName from '../components/FormattedName'
import { useListedTokens } from '../contexts/Application'
import { DashboardWrapper } from '../Theme'
import { useTranslation } from 'react-i18next'

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

const WarningGrouping = styled.div`
  opacity: ${({ disabled }) => disabled && '0.4'};
  pointer-events: ${({ disabled }) => disabled && 'none'};
`

function TokenPage({ address, history }) {
  const { t } = useTranslation()
  
  const {
    id,
    name,
    symbol,
    priceUSD,
    oneDayVolumeUSD,
    totalLiquidityUSD,
    volumeChangeUSD,
    oneDayVolumeUT,
    volumeChangeUT,
    priceChangeUSD,
    liquidityChangeUSD,
    oneDayTxns,
    txnChange,
  } = useTokenData(address)

  useEffect(() => {
    document.querySelector('body').scrollTo(0, 0)
  }, [])

  // detect color from token
  const backgroundColor = useColor(id, symbol)

  const allPairs = useTokenPairs(address)

  // pairs to show in pair list
  const fetchedPairsList = useDataForList(allPairs)

  // all transactions with this token
  const transactions = useTokenTransactions(address)

  // price
  const price = priceUSD ? formattedNum(priceUSD, true) : ''
  const priceChange = priceChangeUSD ? formattedPercent(priceChangeUSD) : ''

  // volume
  const volume =
    oneDayVolumeUSD || oneDayVolumeUSD === 0
      ? formattedNum(oneDayVolumeUSD === 0 ? oneDayVolumeUT : oneDayVolumeUSD, true)
      : oneDayVolumeUSD === 0
      ? '$0'
      : '-'

  // mark if using untracked volume
  const [usingUtVolume, setUsingUtVolume] = useState(false)
  useEffect(() => {
    setUsingUtVolume(oneDayVolumeUSD === 0 ? true : false)
  }, [oneDayVolumeUSD])

  const volumeChange = formattedPercent(!usingUtVolume ? volumeChangeUSD : volumeChangeUT)

  // liquidity
  const liquidity = totalLiquidityUSD ? formattedNum(totalLiquidityUSD, true) : totalLiquidityUSD === 0 ? '$0' : '-'
  const liquidityChange = formattedPercent(liquidityChangeUSD)

  // transactions
  const txnChangeFormatted = formattedPercent(txnChange)

  const below1080 = useMedia('(max-width: 1080px)')
  const below1024 = useMedia('(max-width: 1024px)')
  const below800 = useMedia('(max-width: 800px)')
  const below600 = useMedia('(max-width: 600px)')
  const below500 = useMedia('(max-width: 500px)')
  const below440 = useMedia('(max-width: 440px)')

  // format for long symbol
  const LENGTH = below1080 ? 10 : 16
  const formattedSymbol = symbol?.length > LENGTH ? symbol.slice(0, LENGTH) + '...' : symbol

  const [dismissed, markAsDismissed] = usePathDismissed(history.location.pathname)
  const [savedTokens, addToken] = useSavedTokens()
  const listedTokens = useListedTokens()

  useEffect(() => {
    window.scrollTo({
      behavior: 'smooth',
      top: 0,
    })
  }, [])

  return (
    <PageWrapper>
      <Warning
        type={'token'}
        show={!dismissed && listedTokens && !listedTokens.includes(address)}
        setShow={markAsDismissed}
        address={address}
      />
      <ContentWrapper>
        <RowBetween style={{ flexWrap: 'wrap', alingItems: 'start' }}>
          <AutoRow align="flex-end" style={{ width: 'fit-content' }}>
            <TYPE.body>
              <BasicLink to="/tokens">{`${t('tokens')} `}</BasicLink>→ {symbol}
              {'  '}
            </TYPE.body>
            <Link
              style={{ width: 'fit-content' }}
              color={backgroundColor}
              external
              href={'https://etherscan.io/address/' + address}
            >
              <Text style={{ marginLeft: '.15rem' }} fontSize={'14px'} fontWeight={400}>
                ({address.slice(0, 8) + '...' + address.slice(36, 42)})
              </Text>
            </Link>
          </AutoRow>
          {!below600 && <Search small={true} />}
        </RowBetween>

        <WarningGrouping disabled={!dismissed && listedTokens && !listedTokens.includes(address)}>
          <DashboardWrapper style={{ marginTop: below1080 ? '0' : '1rem' }}>
            <RowFixed
              style={{
                flexWrap: 'wrap',
                marginBottom: '2rem',
                alignItems: 'flex-start',
              }}
            >
              <RowFixed style={{ flexWrap: 'wrap' }}>
                <RowFixed style={{ alignItems: 'baseline' }}>
                  <TokenLogo address={address} size={below440 ? '22px' : '32px'} style={{ alignSelf: 'center' }} />
                    <TYPE.main fontSize={!below1080 ? '2.5rem' : below440 ? '1.25rem' : '1.5rem'} style={{ margin: '0 1rem' }}>
                    <RowFixed gap="6px">
                      <FormattedName text={name ? name + ' ' : ''} maxCharacters={16} style={{ marginRight: '6px' }} />{' '}
                      {formattedSymbol ? `(${formattedSymbol})` : ''}
                    </RowFixed>
                  </TYPE.main>{' '}
                  {!below1080 && (
                    <>
                      <TYPE.main fontSize={'1.5rem'} fontWeight={500} style={{ marginRight: '1rem' }}>
                        {price}
                      </TYPE.main>
                      {priceChange}
                    </>
                  )}
                </RowFixed>
              </RowFixed>
              <span>
                <RowFixed ml={below500 ? '0' : '2.5rem'} mt={below500 ? '1rem' : '0'}>
                  {!!!savedTokens[address] && !below800 ? (
                    <Hover onClick={() => addToken(address, symbol)}>
                      <StyledIcon>
                        <PlusCircle style={{ marginRight: '0.5rem' }} />
                      </StyledIcon>
                    </Hover>
                  ) : !below1080 ? (
                    <StyledIcon>
                      <Bookmark style={{ marginRight: '0.5rem', opacity: 0.4 }} />
                    </StyledIcon>
                  ) : (
                    <></>
                  )}
                  <Link href={getPoolLink(address)} target="_blank">
                    <ButtonLight color={backgroundColor}>{t('addLiquidity')}</ButtonLight>
                  </Link>
                  <Link href={getSwapLink(address)} target="_blank">
                    <ButtonDark ml={'.5rem'} color={backgroundColor}>
                      {t('trade')}
                    </ButtonDark>
                  </Link>
                </RowFixed>
              </span>
            </RowFixed>

            <PanelWrapper style={{ marginTop: below1080 ? '0' : '1rem' }}>
              {below1080 && price && (
                <Panel>
                  <AutoColumn gap="20px">
                    <RowBetween>
                      <TYPE.main>{t('price')}</TYPE.main>
                      <div />
                    </RowBetween>
                    <RowBetween align="flex-end">
                      {' '}
                      <TYPE.main fontSize={'1.5rem'} lineHeight={1} fontWeight={500}>
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
                    <TYPE.light fontSize={14} fontWeight={500}>{t('totalLiquidity')}</TYPE.light>
                    <div />
                  </RowBetween>
                  <RowBetween align="flex-end">
                    <TYPE.main fontSize={'1.5rem'} lineHeight={1} fontWeight={500}>
                      {liquidity}
                    </TYPE.main>
                    <TYPE.main>{liquidityChange}</TYPE.main>
                  </RowBetween>
                </AutoColumn>
              </Panel>
              <Panel>
                <AutoColumn gap="20px">
                  <RowBetween>
                    <TYPE.light fontSize={14} fontWeight={500}>{t('volume24hrs')} {usingUtVolume && `(${t('untracked')})`}</TYPE.light>
                    <div />
                  </RowBetween>
                  <RowBetween align="flex-end">
                    <TYPE.main fontSize={'1.5rem'} lineHeight={1} fontWeight={500}>
                      {volume}
                    </TYPE.main>
                    <TYPE.main>{volumeChange}</TYPE.main>
                  </RowBetween>
                </AutoColumn>
              </Panel>

              <Panel>
                <AutoColumn gap="20px">
                  <RowBetween>
                    <TYPE.light fontSize={14} fontWeight={500}>{t('transactions')} (24hrs)</TYPE.light>
                    <div />
                  </RowBetween>
                  <RowBetween align="flex-end">
                    <TYPE.main fontSize={'1.5rem'} lineHeight={1} fontWeight={500}>
                      {oneDayTxns ? localNumber(oneDayTxns) : oneDayTxns === 0 ? 0 : '-'}
                    </TYPE.main>
                    <TYPE.main>{txnChangeFormatted}</TYPE.main>
                  </RowBetween>
                </AutoColumn>
              </Panel>
              <Panel
                style={{
                  gridColumn: !below1080 ? '2/4' : below1024 ? '1/4' : '2/-1',
                  gridRow: below1080 ? '' : '1/4',
                }}
              >
                <TokenChart address={address} color={backgroundColor} base={priceUSD} />
              </Panel>
            </PanelWrapper>
          </DashboardWrapper>

          <DashboardWrapper style={{ marginTop: '1.5rem' }}>
            <TYPE.main fontSize={22} fontWeight={500}>
              {t('topPairs')}
            </TYPE.main>
            {address && fetchedPairsList ? (
              <PairList color={backgroundColor} address={address} pairs={fetchedPairsList} />
            ) : (
              <Loader />
            )}
          </DashboardWrapper>

          <DashboardWrapper style={{ marginTop: '1.5rem' }}>
            <TYPE.main fontSize={22} fontWeight={500}>{t('transactions')}</TYPE.main>
            {transactions ? <TxnList color={backgroundColor} transactions={transactions} /> : <Loader />}
          </DashboardWrapper>
          <DashboardWrapper style={{ marginTop: '1.5rem' }}>
            <TYPE.main fontSize={22} fontWeight={500}>Token Information</TYPE.main>
            <Panel
              rounded
              style={{
                marginTop: below440 ? '.75rem' : '1.5rem',
              }}
              p={20}
            >
              <TokenDetailsLayout>
                <Column>
                  <TYPE.light>{t('symbol')}</TYPE.light>
                  <TYPE.main style={{ marginTop: '.5rem' }} fontWeight="500">
                    {symbol}
                  </TYPE.main>
                </Column>
                <Column>
                  <TYPE.light>{t('name')}</TYPE.light>
                  <TYPE.main style={{ marginTop: '.5rem' }} fontWeight="500">
                    {name}
                  </TYPE.main>
                </Column>
                <Column>
                  <TYPE.light>{t('address')}</TYPE.light>
                  <RowBetween style={{ marginTop: '-5px' }}>
                    <TYPE.main style={{ marginTop: '.5rem' }} fontWeight="500">
                      {address.slice(0, 8) + '...' + address.slice(36, 42)}
                    </TYPE.main>
                    <CopyHelper toCopy={address}/>
                  </RowBetween>
                </Column>
                <ButtonLight color={backgroundColor}>
                  <Link color={backgroundColor} external href={'https://etherscan.io/address/' + address}>
                    {t('viewOnEtherscan')} ↗
                  </Link>
                </ButtonLight>
              </TokenDetailsLayout>
            </Panel>
          </DashboardWrapper>
        </WarningGrouping>
      </ContentWrapper>
    </PageWrapper>
  )
}

export default withRouter(TokenPage)
