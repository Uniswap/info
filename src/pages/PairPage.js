import React, { useEffect, useState } from 'react'
import { withRouter } from 'react-router-dom'
import 'feather-icons'
import styled from 'styled-components'
import Panel from '../components/Panel'
import { PageWrapper, ContentWrapperLarge } from '../components/index'
import { AutoRow, RowBetween, RowFixed } from '../components/Row'
import Column, { AutoColumn } from '../components/Column'
import { ButtonLight, ButtonDark } from '../components/ButtonStyled'
import PairChart from '../components/PairChart'
import Link from '../components/Link'
import TxnList from '../components/TxnList'
import Loader from '../components/LocalLoader'
import { BasicLink } from '../components/Link'
import Search from '../components/Search'
import { formattedNum, formattedPercent, getPoolLink, getSwapLink } from '../utils'
import { useColor } from '../hooks'
import { usePairData, usePairTransactions } from '../contexts/PairData'
import { TYPE } from '../Theme'
import CopyHelper from '../components/Copy'
import { useMedia } from 'react-use'
import DoubleTokenLogo from '../components/DoubleLogo'
import TokenLogo from '../components/TokenLogo'
import { Hover } from '../components'
import { useEthPrice } from '../contexts/GlobalData'
import { usePathDismissed } from '../contexts/LocalStorage'

import FormattedName from '../components/FormattedName'
import { useListedTokens } from '../contexts/Application'

const DashboardWrapper = styled.div`
  width: 100%;

  .mobile_response {
    @media screen and (max-width: 500px) {
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
`

const PanelWrapper = styled.div`
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: max-content;
  gap: 20px;
  display: inline-grid;
  width: 100%;
  align-items: start;

  @media screen and (max-width: 1080px) {
    > div:last-child {
      grid-column: 2 / 4 !important;
    }
  }

  @media screen and (max-width: 1024px) {
    > div:last-child {
      grid-column: 1 / 4 !important;
    }
  }

  @media screen and (max-width: 1024px) {
    grid-template-columns: 1fr;
    align-items: stretch;
    gap: 10px;

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
  grid-template-columns: auto auto auto auto 240px;
  column-gap: 80px;
  align-items: start;

  > div:first-of-type {
    min-width: 72px;
  }

  button {
    width: 100%;
    display: flex;
    justify-content: space-between;
  }

  > a {
    width: 100%;
  }

  &:last-child {
    align-items: center;
  }
  @media screen and (max-width: 1024px) {
    grid-template-columns: 1fr;
    align-items: stretch;
    > * {
      grid-column: 1 / 4;
      margin-bottom: 30px;
    }

    > a {
      width: 240px;
    }

    &:last-child {
      align-items: start;
      justify-items: start;
    }
  }

  @media screen and (max-width: 500px) {
    > a {
      width: 100%;
    }
  }
`

const FixedPanel = styled(Panel)`
  width: fit-content;
  padding: 8px 20px;
  border-radius: 10px;
  box-shadow: 0px 4px 30px rgba(0, 0, 0, 0.04);
  margin-right: 10px !important;
  margin-top: 10px !important;

  @media screen and (max-width: 800px) {
    padding: 8px 20px !important;
  }

  @media screen and (max-width: 500px) {
    width: 100%;
  }

  :hover {
    cursor: pointer;
    background-color: ${({ theme }) => theme.bg2};
  }
`

const HoverSpan = styled.span`
  :hover {
    cursor: pointer;
    opacity: 0.7;
  }
`

const WarningGrouping = styled.div`
  opacity: ${({ disabled }) => disabled && '0.4'};
  pointer-events: ${({ disabled }) => disabled && 'none'};

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

function PairPage({ pairAddress, history }) {
  const {
    token0,
    token1,
    reserve0,
    reserve1,
    reserveUSD,
    trackedReserveUSD,
    oneDayVolumeUSD,
    volumeChangeUSD,
    oneDayVolumeUntracked,
    volumeChangeUntracked,
    liquidityChangeUSD,
  } = usePairData(pairAddress)

  useEffect(() => {
    document.querySelector('body').scrollTo(0, 0)
  }, [])

  const transactions = usePairTransactions(pairAddress)
  const backgroundColor = useColor(pairAddress)

  // liquidity
  const liquidity = trackedReserveUSD
    ? formattedNum(trackedReserveUSD, true)
    : reserveUSD
    ? formattedNum(reserveUSD, true)
    : '-'
  const liquidityChange = formattedPercent(liquidityChangeUSD)

  // mark if using untracked liquidity
  const [usingTracked, setUsingTracked] = useState(true)
  useEffect(() => {
    setUsingTracked(!trackedReserveUSD ? false : true)
  }, [trackedReserveUSD])

  // volume	  // volume
  const volume =
    oneDayVolumeUSD || oneDayVolumeUSD === 0
      ? formattedNum(oneDayVolumeUSD === 0 ? oneDayVolumeUntracked : oneDayVolumeUSD, true)
      : oneDayVolumeUSD === 0
      ? '$0'
      : '-'

  // mark if using untracked volume
  const [usingUtVolume, setUsingUtVolume] = useState(false)
  useEffect(() => {
    setUsingUtVolume(oneDayVolumeUSD === 0 ? true : false)
  }, [oneDayVolumeUSD])

  const volumeChange = formattedPercent(!usingUtVolume ? volumeChangeUSD : volumeChangeUntracked)

  // get fees	  // get fees
  const fees =
    oneDayVolumeUSD || oneDayVolumeUSD === 0
      ? usingUtVolume
        ? formattedNum(oneDayVolumeUntracked * 0.003, true)
        : formattedNum(oneDayVolumeUSD * 0.003, true)
      : '-'

  // token data for usd
  const [ethPrice] = useEthPrice()
  const token0USD =
    token0?.derivedETH && ethPrice ? formattedNum(parseFloat(token0.derivedETH) * parseFloat(ethPrice), true) : ''

  const token1USD =
    token1?.derivedETH && ethPrice ? formattedNum(parseFloat(token1.derivedETH) * parseFloat(ethPrice), true) : ''

  // rates
  const token0Rate = reserve0 && reserve1 ? formattedNum(reserve1 / reserve0) : '-'
  const token1Rate = reserve0 && reserve1 ? formattedNum(reserve0 / reserve1) : '-'

  // formatted symbols for overflow
  const formattedSymbol0 = token0?.symbol.length > 6 ? token0?.symbol.slice(0, 5) + '...' : token0?.symbol
  const formattedSymbol1 = token1?.symbol.length > 6 ? token1?.symbol.slice(0, 5) + '...' : token1?.symbol

  const below1080 = useMedia('(max-width: 1080px)')
  const below900 = useMedia('(max-width: 900px)')
  const below600 = useMedia('(max-width: 600px)')
  const below700 = useMedia('(max-width: 700px)')
  const below500 = useMedia('(max-width: 500px)')

  const [dismissed, markAsDismissed] = usePathDismissed(history.location.pathname)

  useEffect(() => {
    window.scrollTo({
      behavior: 'smooth',
      top: 0,
    })
  }, [])

  const listedTokens = useListedTokens()

  return (
    <PageWrapper style={{ paddingBottom: 56 }}>
      <ContentWrapperLarge>
        <RowBetween>
          <TYPE.main fontSize={15}>
            <BasicLink to="/pairs">Pairs</BasicLink>→ {token0?.symbol}-{token1?.symbol}
          </TYPE.main>
          {!below600 && <Search small={true} />}
        </RowBetween>
        <WarningGrouping
          disabled={
            !dismissed && listedTokens && !(listedTokens.includes(token0?.id) && listedTokens.includes(token1?.id))
          }
        >
          <DashboardWrapper>
            <AutoColumn gap="40px" style={{ marginBottom: below500 ? 10 : 40 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  width: '100%',
                }}
              >
                <RowFixed style={{ flexWrap: 'wrap', minWidth: '100px' }}>
                  <RowFixed>
                    {token0 && token1 && (
                      <DoubleTokenLogo a0={token0?.id || ''} a1={token1?.id || ''} size={40} margin={true} />
                    )}
                    <TYPE.main fontSize={below1080 ? '20px' : '24px'} style={{ margin: '0 20px' }}>
                      {token0 && token1 ? (
                        <>
                          <HoverSpan onClick={() => history.push(`/token/${token0?.id}`)}>{token0.symbol}</HoverSpan>
                          <span>-</span>
                          <HoverSpan onClick={() => history.push(`/token/${token1?.id}`)}>{token1.symbol}</HoverSpan>
                          Pair
                        </>
                      ) : (
                        ''
                      )}
                    </TYPE.main>
                  </RowFixed>
                </RowFixed>
                <RowFixed className="mobile_response" ml={below700 ? '0' : '2.5rem'} mt={below700 ? '30px' : '0'}>
                  <Link external href={getPoolLink(token0?.id, token1?.id)}>
                    <ButtonDark color={backgroundColor}>+ Add Liquidity</ButtonDark>
                  </Link>
                  <Link external href={getSwapLink(token0?.id, token1?.id)}>
                    <ButtonLight marginLeft={10} color={backgroundColor}>
                      Trade &nbsp; ↗
                    </ButtonLight>
                  </Link>
                </RowFixed>
              </div>
            </AutoColumn>
            <AutoRow
              gap="6px"
              style={{
                width: 'fit-content',
                marginTop: below900 ? '10px' : '0',
                marginBottom: below900 ? '0' : '40px',
                flexWrap: 'wrap',
              }}
            >
              <FixedPanel onClick={() => history.push(`/token/${token0?.id}`)}>
                <RowFixed>
                  <TokenLogo address={token0?.id} size="30px" />
                  <TYPE.main fontSize={below500 ? 16 : 18} lineHeight={below500 ? '19px' : '21px'} ml="10px">
                    {token0 && token1
                      ? `1 ${formattedSymbol0} = ${token0Rate} ${formattedSymbol1} ${
                          parseFloat(token0?.derivedETH) ? '(' + token0USD + ')' : ''
                        }`
                      : '-'}
                  </TYPE.main>
                </RowFixed>
              </FixedPanel>
              <FixedPanel onClick={() => history.push(`/token/${token1?.id}`)}>
                <RowFixed>
                  <TokenLogo address={token1?.id} size="30px" />
                  <TYPE.main fontSize={below500 ? 16 : 18} lineHeight={below500 ? '19px' : '21px'} ml="10px">
                    {token0 && token1
                      ? `1 ${formattedSymbol1} = ${token1Rate} ${formattedSymbol0}  ${
                          parseFloat(token1?.derivedETH) ? '(' + token1USD + ')' : ''
                        }`
                      : '-'}
                  </TYPE.main>
                </RowFixed>
              </FixedPanel>
            </AutoRow>
            <>
              {!below1080 && <TYPE.main fontSize={18}>Pair Stats</TYPE.main>}
              <PanelWrapper style={{ marginTop: '18px' }}>
                <Panel style={{ height: '100%', padding: 20 }}>
                  <AutoColumn gap="20px">
                    <RowBetween>
                      <TYPE.main fontSize={15}>Total Liquidity {!usingTracked ? '(Untracked)' : ''}</TYPE.main>
                      <div />
                    </RowBetween>
                    <RowBetween align="flex-end">
                      <TYPE.main fontSize="24px" lineHeight="28px">
                        {liquidity}
                      </TYPE.main>
                      <TYPE.main>{liquidityChange}</TYPE.main>
                    </RowBetween>
                  </AutoColumn>
                </Panel>
                <Panel style={{ height: '100%', padding: 20 }}>
                  <AutoColumn gap="20px">
                    <RowBetween>
                      <TYPE.main fontSize={15}>Volume (24hrs) {usingUtVolume && '(Untracked)'}</TYPE.main>
                      <div />
                    </RowBetween>
                    <RowBetween align="flex-end">
                      <TYPE.main fontSize="24px" lineHeight="28px">
                        {volume}
                      </TYPE.main>
                      <TYPE.main>{volumeChange}</TYPE.main>
                    </RowBetween>
                  </AutoColumn>
                </Panel>
                <Panel style={{ height: '100%', padding: 20 }}>
                  <AutoColumn gap="20px">
                    <RowBetween>
                      <TYPE.main fontSize={15}>Fees (24hrs)</TYPE.main>
                      <div />
                    </RowBetween>
                    <RowBetween align="flex-end">
                      <TYPE.main fontSize="24px" lineHeight="28px">
                        {fees}
                      </TYPE.main>
                      <TYPE.main>{volumeChange}</TYPE.main>
                    </RowBetween>
                  </AutoColumn>
                </Panel>
                <Panel style={{ height: '100%', padding: 20 }}>
                  <AutoColumn gap="14px">
                    <RowBetween>
                      <TYPE.main fontSize={15}>Pooled Tokens</TYPE.main>
                      <div />
                    </RowBetween>
                    <Hover onClick={() => history.push(`/token/${token0?.id}`)} fade={true}>
                      <AutoRow gap="4px">
                        <TokenLogo size="30px" address={token0?.id} style={{ marginRight: 20 }} />
                        <TYPE.main fontSize="24px" lineHeight="28px">
                          <RowFixed>
                            {reserve0 ? formattedNum(reserve0) : ''}
                            <FormattedName text={token0?.symbol ?? ''} maxCharacters={8} margin={true} />
                          </RowFixed>
                        </TYPE.main>
                      </AutoRow>
                    </Hover>
                    <Hover onClick={() => history.push(`/token/${token1?.id}`)} fade={true}>
                      <AutoRow gap="4px">
                        <TokenLogo size="30px" address={token1?.id} style={{ marginRight: 20 }} />
                        <TYPE.main fontSize="24px" lineHeight="28px" marginleft={20}>
                          <RowFixed>
                            {reserve1 ? formattedNum(reserve1) : ''}
                            <FormattedName text={token1?.symbol ?? ''} maxCharacters={8} margin={true} />
                          </RowFixed>
                        </TYPE.main>
                      </AutoRow>
                    </Hover>
                  </AutoColumn>
                </Panel>
                <Panel
                  style={{
                    gridColumn: below1080 ? '1' : '2/4',
                    gridRow: below1080 ? '' : '1/5',
                    padding: 0,
                  }}
                >
                  <PairChart
                    address={pairAddress}
                    color="rgb(236, 171, 67)"
                    base0={reserve1 / reserve0}
                    base1={reserve0 / reserve1}
                  />
                </Panel>
              </PanelWrapper>
              <TYPE.main fontSize={18} style={{ marginTop: below700 ? 34 : 40 }}>
                Transactions
              </TYPE.main>
              <Panel
                style={{
                  marginTop: 18,
                }}
              >
                {transactions ? <TxnList transactions={transactions} /> : <Loader />}
              </Panel>
              <RowBetween style={{ marginTop: below700 ? 34 : 40 }}>
                <TYPE.main fontSize={18}>Pair Information</TYPE.main>
              </RowBetween>
              <Panel
                rounded
                style={{
                  marginTop: 18,
                }}
                p={below700 ? '20px 20px 30px 20px' : '30px 20px 40px 30px'}
              >
                <TokenDetailsLayout>
                  <Column>
                    <AutoRow align="flex-end">
                      <TYPE.main fontSize={15}>Pair Name</TYPE.main>
                    </AutoRow>
                    <TYPE.main style={{ marginTop: 20 }}>
                      <RowFixed>
                        <FormattedName text={token0?.symbol ?? ''} maxCharacters={8} />
                        -
                        <FormattedName text={token1?.symbol ?? ''} maxCharacters={8} />
                      </RowFixed>
                    </TYPE.main>
                  </Column>
                  <Column>
                    <TYPE.main fontSize={15}>Pair Address</TYPE.main>
                    <AutoRow align="flex-end">
                      <TYPE.main>{pairAddress.slice(0, 6) + '...' + pairAddress.slice(38, 42)}</TYPE.main>
                      <CopyHelper toCopy={pairAddress} />
                    </AutoRow>
                  </Column>
                  <Column>
                    <TYPE.main fontSize={15}>
                      <RowFixed>
                        <FormattedName text={token0?.symbol ?? ''} maxCharacters={8} />{' '}
                        <span style={{ marginLeft: '4px' }}>Address</span>
                      </RowFixed>
                    </TYPE.main>
                    <AutoRow align="flex-end">
                      <TYPE.main>{token0 && token0.id.slice(0, 6) + '...' + token0.id.slice(38, 42)}</TYPE.main>
                      <CopyHelper toCopy={token0?.id} />
                    </AutoRow>
                  </Column>
                  <Column>
                    <TYPE.main fontSize={15}>
                      <RowFixed>
                        <FormattedName text={token1?.symbol ?? ''} maxCharacters={8} />{' '}
                        <span style={{ marginLeft: '4px' }}>Address</span>
                      </RowFixed>
                    </TYPE.main>
                    <AutoRow align="flex-end">
                      <TYPE.main fontSize={16}>
                        {token1 && token1.id.slice(0, 6) + '...' + token1.id.slice(38, 42)}
                      </TYPE.main>
                      <CopyHelper toCopy={token1?.id} />
                    </AutoRow>
                  </Column>

                  <Link external href={'https://etherscan.io/address/' + pairAddress}>
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
      </ContentWrapperLarge>
    </PageWrapper>
  )
}

export default withRouter(PairPage)
