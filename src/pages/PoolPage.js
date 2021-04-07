import React, { useEffect, useState } from 'react'
import { withRouter } from 'react-router-dom'
import 'feather-icons'
import { Bookmark } from 'react-feather'
import { transparentize } from 'polished'
import styled from 'styled-components'
import { useMedia } from 'react-use'

import { PageWrapper, ContentWrapperLarge, StyledIcon, Hover } from '../components'
import Panel from '../components/Panel'
import { AutoRow, RowBetween, RowFixed } from '../components/Row'
import Column, { AutoColumn } from '../components/Column'
import { ButtonDark, ButtonOutlined } from '../components/ButtonStyled'
import PoolChart from '../components/PoolChart'
import Link from '../components/Link'
import TxnList from '../components/TxnList'
import Loader from '../components/LocalLoader'
import { BasicLink } from '../components/Link'
import Search from '../components/Search'
import FormattedName from '../components/FormattedName'
import CopyHelper from '../components/Copy'
import Warning from '../components/Warning'
import DoubleTokenLogo from '../components/DoubleLogo'
import TokenLogo from '../components/TokenLogo'
import AddBookmark from '../components/Icons/AddBookmark'
import { TYPE, ThemedBackground } from '../Theme'
import { usePoolData, usePoolTransactions } from '../contexts/PoolData'
import { useEthPrice } from '../contexts/GlobalData'
import { usePathDismissed, useSavedPools } from '../contexts/LocalStorage'
import { useListedTokens } from '../contexts/Application'
import { formattedNum, formattedPercent, formattedTokenRatio, getPoolLink, getSwapLink, shortenAddress } from '../utils'

const DashboardWrapper = styled.div`
  width: 100%;
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
      /* grid-column: 1 / 4; */
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
  grid-template-columns: auto auto auto auto 1fr;
  column-gap: 60px;
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

const FixedPanel = styled(Panel)`
  width: fit-content;
  padding: 8px 12px;
  border-radius: 10px;

  :hover {
    cursor: pointer;
    background-color: ${({ theme }) => theme.bg2};
  }
`

const PriceRangePanel = styled(Panel)`
  height: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;

  @media screen and (max-width: 1024px) {
    grid-template-columns: 1fr;

    > * {
      margin-bottom: 1rem;
    }
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
`

function PoolPage({ poolAddress, history }) {
  const {
    token0,
    token1,
    reserve0,
    reserve1,
    vReserve0,
    vReserve1,
    reserveUSD,
    trackedReserveUSD,
    oneDayVolumeUSD,
    oneDayFeeUSD,
    volumeChangeUSD,
    oneDayVolumeUntracked,
    oneDayFeeUntracked,
    volumeChangeUntracked,
    liquidityChangeUSD,
    token0PriceMin,
    token0PriceMax,
    token1PriceMin,
    token1PriceMax,
  } = usePoolData(poolAddress)

  useEffect(() => {
    document.querySelector('body').scrollTo(0, 0)
  }, [])

  const transactions = usePoolTransactions(poolAddress)
  const backgroundColor = '#08a1e7'

  // liquidity
  const liquidity = reserveUSD ? formattedNum(reserveUSD, true) : '-'
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
    oneDayFeeUSD || oneDayFeeUSD === 0
      ? usingUtVolume
        ? formattedNum(oneDayFeeUntracked, true)
        : formattedNum(oneDayFeeUSD, true)
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

  // Ratio of symbols
  const percentToken0 = ((reserve0 / vReserve0) * 100) / (reserve0 / vReserve0 + reserve1 / vReserve1)
  const percentToken1 = 100 - percentToken0

  const below1080 = useMedia('(max-width: 1080px)')
  const below900 = useMedia('(max-width: 900px)')
  const below600 = useMedia('(max-width: 600px)')

  const [dismissed, markAsDismissed] = usePathDismissed(history.location.pathname)

  useEffect(() => {
    window.scrollTo({
      behavior: 'smooth',
      top: 0,
    })
  }, [])

  const [savedPools, addPool] = useSavedPools()

  const listedTokens = useListedTokens()

  return (
    <PageWrapper>
      <ThemedBackground backgroundColor={transparentize(0.6, backgroundColor)} />
      <span />
      <Warning
        type={'pool'}
        show={!dismissed && listedTokens && !(listedTokens.includes(token0?.id) && listedTokens.includes(token1?.id))}
        setShow={markAsDismissed}
        address={poolAddress}
      />
      <ContentWrapperLarge>
        <RowBetween>
          <TYPE.body>
            <AutoRow align="flex-end">
              <BasicLink to="/pairs">{'Pairs '}</BasicLink>→ {token0?.symbol}-{token1?.symbol} →{' '}
              {shortenAddress(poolAddress, 3)} <CopyHelper toCopy={poolAddress} />
            </AutoRow>
          </TYPE.body>
          {!below600 && <Search small={true} />}
        </RowBetween>
        <WarningGrouping
          disabled={
            !dismissed && listedTokens && !(listedTokens.includes(token0?.id) && listedTokens.includes(token1?.id))
          }
        >
          <DashboardWrapper>
            <AutoColumn gap="40px" style={{ marginBottom: '1.5rem' }}>
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
                      <DoubleTokenLogo a0={token0?.id || ''} a1={token1?.id || ''} size={32} margin={true} />
                    )}{' '}
                    <TYPE.main fontSize={below1080 ? '1.5rem' : '2rem'} style={{ margin: '0 1rem' }}>
                      {token0 && token1 ? (
                        <>
                          <HoverSpan onClick={() => history.push(`/token/${token0?.id}`)}>{token0.symbol}</HoverSpan>
                          <span>-</span>
                          <HoverSpan onClick={() => history.push(`/token/${token1?.id}`)}>
                            {token1.symbol}
                          </HoverSpan>{' '}
                          Pool
                        </>
                      ) : (
                        ''
                      )}
                    </TYPE.main>
                  </RowFixed>
                </RowFixed>
                <RowFixed
                  ml={below900 ? '0' : '2.5rem'}
                  mt={below1080 && '1rem'}
                  style={{
                    flexDirection: below1080 ? 'row-reverse' : 'initial',
                  }}
                >
                  {!!!savedPools[poolAddress] && !below1080 ? (
                    <Hover onClick={() => addPool(poolAddress, token0.id, token1.id, token0.symbol, token1.symbol)}>
                      <StyledIcon style={{ marginRight: '0.5rem' }}>
                        <AddBookmark />
                      </StyledIcon>
                    </Hover>
                  ) : !below1080 ? (
                    <StyledIcon>
                      <Bookmark style={{ marginRight: '0.5rem', opacity: 0.4 }} />
                    </StyledIcon>
                  ) : (
                    <></>
                  )}

                  <Link external href={getPoolLink(token0?.id, token1?.id, false, poolAddress)}>
                    <ButtonOutlined color="#08a1e7" borderColor="#08a1e7" style={{ padding: '11px 22px' }}>
                      + Add Liquidity
                    </ButtonOutlined>
                  </Link>
                  <Link external href={getSwapLink(token0?.id, token1?.id)}>
                    <ButtonDark
                      ml={!below1080 && '.5rem'}
                      mr={below1080 && '.5rem'}
                      color={backgroundColor}
                      style={{ padding: '11px 22px' }}
                    >
                      Trade
                    </ButtonDark>
                  </Link>
                </RowFixed>
              </div>
            </AutoColumn>
            <AutoRow
              gap="6px"
              style={{
                width: 'fit-content',
                marginTop: below900 ? '1rem' : '0',
                marginBottom: below900 ? '0' : '2rem',
                flexWrap: 'wrap',
              }}
            >
              <FixedPanel onClick={() => history.push(`/token/${token0?.id}`)}>
                <RowFixed>
                  <TokenLogo address={token0?.id} size={'16px'} />
                  <TYPE.main fontSize={'16px'} lineHeight={1} fontWeight={500} ml={'4px'}>
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
                  <TokenLogo address={token1?.id} size={'16px'} />
                  <TYPE.main fontSize={'16px'} lineHeight={1} fontWeight={500} ml={'4px'}>
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
              {!below1080 && <TYPE.main fontSize={'1.125rem'}>Pool Stats</TYPE.main>}
              <PanelWrapper style={{ marginTop: '1.5rem' }}>
                <Panel style={{ height: '100%' }}>
                  <AutoColumn gap="20px">
                    <RowBetween>
                      <TYPE.main fontSize={12}>Total Liquidity {!usingTracked ? '(Untracked)' : ''}</TYPE.main>
                      <div />
                    </RowBetween>
                    <RowBetween align="flex-end">
                      <TYPE.main fontSize={18} lineHeight={1} fontWeight={500}>
                        {liquidity}
                      </TYPE.main>
                      <TYPE.main>{liquidityChange}</TYPE.main>
                    </RowBetween>
                  </AutoColumn>
                </Panel>
                <Panel style={{ height: '100%' }}>
                  <AutoColumn gap="20px">
                    <RowBetween>
                      <TYPE.main fontSize={12}>Volume (24hrs) {usingUtVolume && '(Untracked)'}</TYPE.main>
                      <div />
                    </RowBetween>
                    <RowBetween align="flex-end">
                      <TYPE.main fontSize={18} lineHeight={1} fontWeight={500}>
                        {volume}
                      </TYPE.main>
                      <TYPE.main>{volumeChange}</TYPE.main>
                    </RowBetween>
                  </AutoColumn>
                </Panel>
                <Panel style={{ height: '100%' }}>
                  <AutoColumn gap="20px">
                    <RowBetween>
                      <TYPE.main fontSize={12}>Fees (24hrs)</TYPE.main>
                      <div />
                    </RowBetween>
                    <RowBetween align="flex-end">
                      <TYPE.main fontSize={18} lineHeight={1} fontWeight={500}>
                        {fees}
                      </TYPE.main>
                      <TYPE.main>{volumeChange}</TYPE.main>
                    </RowBetween>
                  </AutoColumn>
                </Panel>

                <Panel style={{ height: '100%' }}>
                  <AutoColumn gap="20px">
                    <RowBetween>
                      <TYPE.main fontSize={12}>Pooled Tokens</TYPE.main>
                      <div />
                    </RowBetween>
                    <Hover onClick={() => history.push(`/token/${token0?.id}`)} fade={true}>
                      <AutoRow gap="4px">
                        <TokenLogo address={token0?.id} />
                        <TYPE.main fontSize={14} lineHeight={1} fontWeight={500}>
                          <RowFixed>
                            {reserve0 ? formattedNum(reserve0) : ''}{' '}
                            <FormattedName text={token0?.symbol ?? ''} maxCharacters={8} margin={true} />
                          </RowFixed>
                        </TYPE.main>
                      </AutoRow>
                    </Hover>
                    <Hover onClick={() => history.push(`/token/${token1?.id}`)} fade={true}>
                      <AutoRow gap="4px">
                        <TokenLogo address={token1?.id} />
                        <TYPE.main fontSize={14} lineHeight={1} fontWeight={500}>
                          <RowFixed>
                            {reserve1 ? formattedNum(reserve1) : ''}{' '}
                            <FormattedName text={token1?.symbol ?? ''} maxCharacters={8} margin={true} />
                          </RowFixed>
                        </TYPE.main>
                      </AutoRow>
                    </Hover>
                  </AutoColumn>
                </Panel>
                <Panel style={{ height: '100%' }}>
                  <AutoColumn gap="20px">
                    <RowBetween>
                      <TYPE.main fontSize={12}>Ratio</TYPE.main>
                      <div />
                    </RowBetween>
                    <RowFixed>
                      <TokenLogo address={token0?.id} />
                      <TYPE.main fontSize={14} lineHeight={1} fontWeight={500}>
                        <RowFixed>
                          <FormattedName text={token0?.symbol ?? ''} maxCharacters={8} margin={true} />
                          {percentToken0 ? formattedTokenRatio(percentToken0) : ''}
                        </RowFixed>
                      </TYPE.main>
                      <div style={{ color: 'white', margin: '0 8px' }}>•</div>
                      <TokenLogo address={token1?.id} />
                      <TYPE.main fontSize={14} lineHeight={1} fontWeight={500}>
                        <RowFixed>
                          <FormattedName text={token1?.symbol ?? ''} maxCharacters={8} margin={true} />
                          {percentToken1 ? formattedTokenRatio(percentToken1) : ''}
                        </RowFixed>
                      </TYPE.main>
                    </RowFixed>
                  </AutoColumn>
                </Panel>
                <PriceRangePanel>
                  <AutoColumn gap="20px">
                    <RowFixed>
                      <TYPE.main fontSize={12}>
                        Price Range{' '}
                        <FormattedName
                          text={token0?.symbol ?? ''}
                          maxCharacters={8}
                          margin={true}
                          style={{ display: 'inline-block' }}
                        />
                        /
                        <FormattedName
                          text={token1?.symbol ?? ''}
                          maxCharacters={8}
                          style={{ display: 'inline-block' }}
                        />
                      </TYPE.main>
                    </RowFixed>

                    <RowBetween align="flex-end">
                      <TYPE.main fontSize={14} lineHeight={1} fontWeight={500} style={{ display: 'inline-block' }}>
                        {token1PriceMin === '0'
                          ? '0.00'
                          : token1PriceMin === '-1'
                          ? '♾️'
                          : parseFloat(token1PriceMin).toPrecision(6)}{' '}
                        -{' '}
                        {token1PriceMax === '0'
                          ? '0.00'
                          : token1PriceMax === '-1'
                          ? '♾️'
                          : parseFloat(token1PriceMax).toPrecision(6)}
                      </TYPE.main>
                    </RowBetween>
                  </AutoColumn>

                  <AutoColumn gap="20px">
                    <RowFixed>
                      <TYPE.main fontSize={12}>
                        Price Range{' '}
                        <FormattedName
                          text={token1?.symbol ?? ''}
                          maxCharacters={8}
                          margin={true}
                          style={{ display: 'inline-block' }}
                        />
                        /
                        <FormattedName
                          text={token0?.symbol ?? ''}
                          maxCharacters={8}
                          style={{ display: 'inline-block' }}
                        />
                      </TYPE.main>
                    </RowFixed>

                    <RowBetween align="flex-end">
                      <TYPE.main fontSize={14} lineHeight={1} fontWeight={500} style={{ display: 'inline-block' }}>
                        {token0PriceMin === '0'
                          ? '0.00'
                          : token0PriceMin === '-1'
                          ? '♾️'
                          : parseFloat(token0PriceMin).toPrecision(6)}{' '}
                        -{' '}
                        {token0PriceMax === '0'
                          ? '0.00'
                          : token0PriceMax === '-1'
                          ? '♾️'
                          : parseFloat(token0PriceMax).toPrecision(6)}
                      </TYPE.main>
                    </RowBetween>
                  </AutoColumn>
                </PriceRangePanel>
                <Panel
                  style={{
                    gridColumn: below1080 ? '1' : '2/4',
                    gridRow: below1080 ? '' : '1/7',
                  }}
                >
                  <PoolChart
                    address={poolAddress}
                    color={backgroundColor}
                    base0={reserve1 / reserve0}
                    base1={reserve0 / reserve1}
                  />
                </Panel>
              </PanelWrapper>
              <TYPE.main fontSize={'1.125rem'} style={{ marginTop: '3rem' }}>
                Transactions
              </TYPE.main>{' '}
              <Panel
                style={{
                  marginTop: '1.5rem',
                }}
              >
                {transactions ? <TxnList transactions={transactions} /> : <Loader />}
              </Panel>
              <RowBetween style={{ marginTop: '3rem' }}>
                <TYPE.main fontSize={'1.125rem'}>Pool Information</TYPE.main>{' '}
              </RowBetween>
              <Panel
                rounded
                style={{
                  marginTop: '1.5rem',
                }}
                p={20}
              >
                <TokenDetailsLayout>
                  <Column>
                    <TYPE.main>Pool Name</TYPE.main>
                    <TYPE.main style={{ marginTop: '.5rem' }}>
                      <RowFixed>
                        <FormattedName text={token0?.symbol ?? ''} maxCharacters={8} />
                        -
                        <FormattedName text={token1?.symbol ?? ''} maxCharacters={8} />
                      </RowFixed>
                    </TYPE.main>
                  </Column>
                  <Column>
                    <TYPE.main>Pool Address</TYPE.main>
                    <AutoRow align="flex-end">
                      <TYPE.main style={{ marginTop: '.5rem' }}>
                        {poolAddress.slice(0, 6) + '...' + poolAddress.slice(38, 42)}
                      </TYPE.main>
                      <CopyHelper toCopy={poolAddress} />
                    </AutoRow>
                  </Column>
                  <Column>
                    <TYPE.main>
                      <RowFixed>
                        <FormattedName text={token0?.symbol ?? ''} maxCharacters={8} />{' '}
                        <span style={{ marginLeft: '4px' }}>Address</span>
                      </RowFixed>
                    </TYPE.main>
                    <AutoRow align="flex-end">
                      <TYPE.main style={{ marginTop: '.5rem' }}>
                        {token0 && token0.id.slice(0, 6) + '...' + token0.id.slice(38, 42)}
                      </TYPE.main>
                      <CopyHelper toCopy={token0?.id} />
                    </AutoRow>
                  </Column>
                  <Column>
                    <TYPE.main>
                      <RowFixed>
                        <FormattedName text={token1?.symbol ?? ''} maxCharacters={8} />{' '}
                        <span style={{ marginLeft: '4px' }}>Address</span>
                      </RowFixed>
                    </TYPE.main>
                    <AutoRow align="flex-end">
                      <TYPE.main style={{ marginTop: '.5rem' }} fontSize={16}>
                        {token1 && token1.id.slice(0, 6) + '...' + token1.id.slice(38, 42)}
                      </TYPE.main>
                      <CopyHelper toCopy={token1?.id} />
                    </AutoRow>
                  </Column>
                  <ButtonOutlined color="#08a1e7" borderColor="#08a1e7" style={{ padding: '11px 22px' }}>
                    <Link
                      color={backgroundColor}
                      external
                      href={`${process.env.REACT_APP_ETHERSCAN_URL}/address/${poolAddress}`}
                    >
                      View on Etherscan ↗
                    </Link>
                  </ButtonOutlined>
                </TokenDetailsLayout>
              </Panel>
            </>
          </DashboardWrapper>
        </WarningGrouping>
      </ContentWrapperLarge>
    </PageWrapper>
  )
}

export default withRouter(PoolPage)
