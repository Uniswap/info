import React, { useState } from 'react'
import 'feather-icons'
import { withRouter } from 'react-router-dom'
import { Text } from 'rebass'
import styled from 'styled-components'
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
import { usePathDismissed } from '../contexts/LocalStorage'
import { PageWrapper, ContentWrapper } from '../components'
import FormattedName from '../components/FormattedName'
import { useListedTokens } from '../contexts/Application'

const DashboardWrapper = styled.div`
  width: 100%;

  .mobile_response {
    @media screen and (max-width: 500px) {
      width: 100%;
      > div {
        width: 100%;
        display: flex;
        justify-content: space-between;

        button {
          width: 100%;
          margin: 0;
        }

        a:first-of-type {
          width: 60%;
        }

        a:last-of-type {
          width: 37%;
        }
      }
    }
  }
`

const PanelWrapper = styled.div`
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: max-content;
  gap: 20px;
  display: inline-grid;
  width: 100%;
  align-items: start;
  @media screen and (max-width: 1024px) {
    grid-template-columns: 1fr;
    align-items: stretch;
    gap: 10px;

    > * {
      grid-column: 1 / 4;
    }

    .response {
      grid-column: 1 / 4 !important;
    }

    > * {
      &:first-child {
        width: 100%;
      }
    }
  }
`

const ColumnsWrap = styled.div`
  display: flex;

  > div {
    margin-right: 80px;
  }

  @media screen and (max-width: 700px) {
    justify-content: space-between;
    margin-bottom: 30px;
    > div {
      margin-right: 0;
    }
  }
`

const GlobalWraps = styled.div`
  display: flex;
  @media screen and (max-width: 1100px) {
    margin-bottom: 30px;
  }

  @media screen and (max-width: 700px) {
    flex-direction: column;
    width: 100%;
  }
`

const TokenDetailsLayout = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;

  .divider_button {
    width: 240px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  @media screen and (max-width: 1100px) {
    flex-direction: column;
    align-items: flex-start;
  }

  @media screen and (max-width: 500px) {
    button,
    a {
      width: 100% !important;
    }
  }
`

const WarningGrouping = styled.div`
  // opacity: ${({ disabled }) => disabled && '0.4'};
  // pointer-events: ${({ disabled }) => disabled && 'none'};

  .name_wrapper {
    display: flex;
    align-items: center;

    @media screen and (max-width: 400px) {
      margin-left: 20px;
    }
  }

  .flexy_wrap {
    display: flex;
    align-items: center;
    @media screen and (max-width: 400px) {
      flex-direction: column;
      align-items: flex-start;
    }
  }
`

function TokenPage({ address, history }) {
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
  const below800 = useMedia('(max-width: 800px)')
  const below700 = useMedia('(max-width: 700px)')
  const below600 = useMedia('(max-width: 600px)')
  const below500 = useMedia('(max-width: 500px)')

  // format for long symbol
  const LENGTH = below1080 ? 10 : 16
  const formattedSymbol = symbol?.length > LENGTH ? symbol.slice(0, LENGTH) + '...' : symbol

  const [dismissed, markAsDismissed] = usePathDismissed(history.location.pathname)
  const listedTokens = useListedTokens()

  useEffect(() => {
    window.scrollTo({
      behavior: 'smooth',
      top: 0,
    })
  }, [])

  return (
    <PageWrapper style={{ paddingBottom: 56 }}>
      {/*<Warning*/}
      {/*  type={'token'}*/}
      {/*  show={!dismissed && listedTokens && !listedTokens.includes(address)}*/}
      {/*  setShow={markAsDismissed}*/}
      {/*  address={address}*/}
      {/*/>*/}
      <ContentWrapper>
        <RowBetween style={{ flexWrap: 'wrap', alignItems: 'baseline' }}>
          <AutoRow align="flex-end" style={{ width: 'fit-content' }}>
            <TYPE.main fontSize={15}>
              <BasicLink to="/tokens">Tokens</BasicLink>→ {symbol}
            </TYPE.main>
            <Link
              style={{ width: 'fit-content' }}
              color="black"
              external
              href={'https://etherscan.io/address/' + address}
            >
              <Text style={{ marginLeft: 10 }} fontSize="15px" fontFamily="Gilroy-Medium">
                ({address.slice(0, 8) + '...' + address.slice(36, 42)})
              </Text>
            </Link>
          </AutoRow>
          {!below600 && <Search small={true} />}
        </RowBetween>

        <WarningGrouping disabled={!dismissed && listedTokens && !listedTokens.includes(address)}>
          <DashboardWrapper style={{ marginTop: below1080 ? '0' : '1rem' }}>
            <RowBetween
              style={{
                flexWrap: 'wrap',
                marginBottom: '2rem',
                alignItems: 'flex-start',
              }}
            >
              <RowFixed style={{ flexWrap: 'wrap' }}>
                <RowFixed style={{ alignItems: 'center' }}>
                  <TokenLogo address={address} size="40px" style={{ alignSelf: 'center' }} />
                  <div className="flexy_wrap">
                    <TYPE.main fontSize={below1080 ? '20px' : '24px'} style={{ margin: '0 20px' }}>
                      <RowFixed gap="6px">
                        <FormattedName text={name ? name + ' ' : ''} maxCharacters={16} />
                        {formattedSymbol ? `(${formattedSymbol})` : ''}
                      </RowFixed>
                    </TYPE.main>
                    <div className="name_wrapper">
                      <TYPE.main fontSize={below500 ? 16 : 20} style={{ marginRight: '20px' }}>
                        {price}
                      </TYPE.main>
                      {priceChange}
                    </div>
                  </div>
                </RowFixed>
              </RowFixed>
              <span className="mobile_response">
                <RowFixed ml={below700 ? '0' : '2.5rem'} mt={below700 ? '30px' : '0'}>
                  <Link href={getPoolLink(address)} target="_blank">
                    <ButtonDark color={backgroundColor}>+ Add Liquidity</ButtonDark>
                  </Link>
                  <Link href={getSwapLink(address)} target="_blank">
                    <ButtonLight marginLeft={10} color={backgroundColor}>
                      Trade &nbsp; ↗
                    </ButtonLight>
                  </Link>
                </RowFixed>
              </span>
            </RowBetween>

            <>
              <PanelWrapper>
                {below1080 && price && (
                  <Panel style={{ padding: 20 }}>
                    <AutoColumn gap="20px">
                      <RowBetween>
                        <TYPE.main fontSize={15}>Price</TYPE.main>
                        <div />
                      </RowBetween>
                      <RowBetween align="flex-end">
                        <TYPE.main fontSize="24px" lineHeight="28px">
                          {price}
                        </TYPE.main>
                        <TYPE.main>{priceChange}</TYPE.main>
                      </RowBetween>
                    </AutoColumn>
                  </Panel>
                )}
                <Panel style={{ padding: 20 }}>
                  <AutoColumn gap="14px">
                    <RowBetween>
                      <TYPE.main fontSize={15}>Total Liquidity</TYPE.main>
                      <div />
                    </RowBetween>
                    <RowBetween align="flex-end">
                      <TYPE.main fontSize="24px" lineHeight="28px" fontWeight={500}>
                        {liquidity}
                      </TYPE.main>
                      <TYPE.main fontSize={15}>{liquidityChange}</TYPE.main>
                    </RowBetween>
                  </AutoColumn>
                </Panel>
                <Panel style={{ padding: 20 }}>
                  <AutoColumn gap="14px">
                    <RowBetween>
                      <TYPE.main fontSize={15}>Volume (24hrs) {usingUtVolume && '(Untracked)'}</TYPE.main>
                      <div />
                    </RowBetween>
                    <RowBetween align="flex-end">
                      <TYPE.main fontSize="24px" lineHeight="28px" fontWeight={500}>
                        {volume}
                      </TYPE.main>
                      <TYPE.main fontSize={15}>{volumeChange}</TYPE.main>
                    </RowBetween>
                  </AutoColumn>
                </Panel>
                <Panel style={{ padding: 20 }}>
                  <AutoColumn gap="14px">
                    <RowBetween>
                      <TYPE.main fontSize={15}>Transactions (24hrs)</TYPE.main>
                      <div />
                    </RowBetween>
                    <RowBetween align="flex-end">
                      <TYPE.main fontSize="24px" lineHeight="28px" fontWeight={500}>
                        {oneDayTxns ? localNumber(oneDayTxns) : oneDayTxns === 0 ? 0 : '-'}
                      </TYPE.main>
                      <TYPE.main fontSize={15}>{txnChangeFormatted}</TYPE.main>
                    </RowBetween>
                  </AutoColumn>
                </Panel>
                <Panel
                  className="response"
                  style={{
                    gridColumn: below1080 ? '0' : '2/4',
                    gridRow: below1080 ? '' : '1/4',
                    padding: 0,
                  }}
                >
                  <TokenChart address={address} color="rgb(236, 171, 67)" base={priceUSD} />
                </Panel>
              </PanelWrapper>
            </>

            <span>
              <TYPE.main fontSize={18} style={{ marginTop: 40 }}>
                Top Pairs
              </TYPE.main>
            </span>
            <Panel
              rounded
              style={{
                marginTop: '1.5rem',
                padding: '1.125rem 0 ',
              }}
            >
              {address && fetchedPairsList ? (
                <PairList color={backgroundColor} address={address} pairs={fetchedPairsList} />
              ) : (
                <Loader />
              )}
            </Panel>
            <RowBetween mt={40} mb={'1rem'}>
              <TYPE.main fontSize={'1.125rem'}>Transactions</TYPE.main> <div />
            </RowBetween>
            <Panel rounded>
              {transactions ? <TxnList color={backgroundColor} transactions={transactions} /> : <Loader />}
            </Panel>
            <>
              <RowBetween style={{ marginTop: '3rem' }}>
                <TYPE.main fontSize={18}>Token Information</TYPE.main>
              </RowBetween>
              <Panel
                rounded
                style={{
                  marginTop: '16px',
                }}
                p={below800 ? '20px 20px 30px 20px' : '30px 20px 30px 30px'}
              >
                <TokenDetailsLayout>
                  <GlobalWraps>
                    <ColumnsWrap>
                      <Column>
                        <TYPE.main fontSize={15}>Symbol</TYPE.main>
                        <TYPE.main style={{ marginTop: 14 }} fontSize={below500 ? 18 : 24}>
                          <FormattedName text={symbol} maxCharacters={12} />
                        </TYPE.main>
                      </Column>
                      <Column>
                        <TYPE.main fontSize={15}>Name</TYPE.main>
                        <TYPE.main style={{ marginTop: 14 }} fontSize={below500 ? 18 : 24}>
                          <FormattedName text={name} maxCharacters={16} />
                        </TYPE.main>
                      </Column>
                    </ColumnsWrap>
                    <Column>
                      <TYPE.main fontSize={15}>Address</TYPE.main>
                      <AutoRow align="flex-end">
                        <TYPE.main style={{ marginTop: 14 }} fontSize={below500 ? 18 : 24}>
                          {address.slice(0, 8) + '...' + address.slice(36, 42)}
                        </TYPE.main>
                        <CopyHelper toCopy={address} />
                      </AutoRow>
                    </Column>
                  </GlobalWraps>
                  <Link external href={'https://etherscan.io/address/' + address}>
                    <ButtonLight className="divider_button">
                      <p>View on Etherscan</p>
                      <span>↗</span>
                    </ButtonLight>
                  </Link>
                </TokenDetailsLayout>
              </Panel>
            </>
          </DashboardWrapper>
        </WarningGrouping>
      </ContentWrapper>
    </PageWrapper>
  )
}

export default withRouter(TokenPage)
