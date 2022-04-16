import React, { useEffect, useMemo, useState } from 'react'
import { withRouter } from 'react-router-dom'
import 'feather-icons'
import { transparentize } from 'polished'
import styled from 'styled-components'
import { useMedia } from 'react-use'

import { PageWrapper, ContentWrapperLarge, Hover } from '../components'
import RawPanel from '../components/Panel'
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
import { TYPE, ThemedBackground } from '../Theme'
import { usePoolData, usePoolTransactions } from '../contexts/PoolData'
import { useEthPrice } from '../contexts/GlobalData'
import { usePathDismissed, useSavedPools } from '../contexts/LocalStorage'
import { useListedTokens } from '../contexts/Application'
import {
  formattedNum,
  formattedPercent,
  formattedTokenRatio,
  getEtherScanUrls,
  getPoolLink,
  getSwapLink,
  shortenAddress,
} from '../utils'
import bookMark from '../assets/bookmark.svg'
import bookMarkOutline from '../assets/bookmark_outline.svg'
import useTheme from '../hooks/useTheme'
import { Flex } from 'rebass'
import { useNetworksInfo } from '../contexts/NetworkInfo'
import { ChainId } from '../constants/networks'
import NotFound from '../components/404'
import LocalLoader from '../components/LocalLoader'

const DashboardWrapper = styled.div`
  width: 100%;
`

const Panel = styled(RawPanel)`
  padding: 1rem;
`

const PanelWrapper = styled.div`
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: max-content;
  gap: 16px;
  display: inline-grid;
  width: 100%;
  align-items: start;
  @media screen and (max-width: 1080px) {
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
  grid-template-columns: auto auto auto auto auto;
  column-gap: 30px;
  justify-content: space-between;

  &:last-child {
    align-items: center;
  }
  @media screen and (max-width: 1150px) {
    grid-template-columns: 1fr;
    align-items: stretch;
    > * {
      grid-column: 1 / 4;
      margin-bottom: 1rem;
    }

    &:last-child {
      align-items: start;
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
    error,
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
  const [[networkInfo]] = useNetworksInfo()

  useEffect(() => {
    document.querySelector('body').scrollTo(0, 0)
  }, [])

  const theme = useTheme()

  const transactions = usePoolTransactions(poolAddress)
  const backgroundColor = theme.primary

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
  const token0USD = token0?.derivedETH && ethPrice ? formattedNum(parseFloat(token0.derivedETH) * parseFloat(ethPrice), true) : ''

  const token1USD = token1?.derivedETH && ethPrice ? formattedNum(parseFloat(token1.derivedETH) * parseFloat(ethPrice), true) : ''

  // rates
  const token0Rate = vReserve0 && vReserve1 ? formattedNum(vReserve1 / vReserve0) : '-'
  const token1Rate = vReserve0 && vReserve1 ? formattedNum(vReserve0 / vReserve1) : '-'

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

  // TODO namgold: Remove this when Cronos has a token list
  const noWarning = networkInfo.chainId === ChainId.CRONOS

  useEffect(() => {
    window.scrollTo({
      behavior: 'smooth',
      top: 0,
    })
  }, [])

  const [savedPools, addPool, removePool] = useSavedPools()

  const listedTokens = useListedTokens()
  const urls = useMemo(() => getEtherScanUrls(networkInfo), [networkInfo])

  return error ? (
    <NotFound type='pool' currentChainName={networkInfo.name} redirectLink={'/' + networkInfo.urlKey + '/pairs'} />
  ) : !token0 ? (
    <LocalLoader />
  ) : (
    <PageWrapper>
      <ThemedBackground backgroundColor={transparentize(0.6, backgroundColor)} />
      <span />
      <Warning
        type={'pool'}
        show={
          !noWarning && !dismissed && listedTokens && !(listedTokens.includes(token0?.id) && listedTokens.includes(token1?.id))
        }
        setShow={markAsDismissed}
        address={poolAddress}
      />
      <ContentWrapperLarge>
        <RowBetween>
          <TYPE.body>
            <AutoRow align='flex-end'>
              <BasicLink to={'/' + networkInfo.urlKey + '/pairs'}>{'Pairs '}</BasicLink>→ {token0?.symbol}-{token1?.symbol} →{' '}
              {shortenAddress(poolAddress, 3)} <CopyHelper toCopy={poolAddress} />
            </AutoRow>
          </TYPE.body>
          {!below600 && <Search small={true} />}
        </RowBetween>
        <WarningGrouping>
          <DashboardWrapper>
            <AutoColumn gap='40px' style={{ marginBottom: '1.5rem' }}>
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
                      <DoubleTokenLogo
                        a0={token0?.id || ''}
                        a1={token1?.id || ''}
                        size={32}
                        margin={true}
                        networkInfo={networkInfo}
                      />
                    )}{' '}
                    <TYPE.main fontSize={below1080 ? '1.5rem' : '2rem'} style={{ margin: '0 1rem' }}>
                      {token0 && token1 ? (
                        <>
                          <BasicLink to={`/${networkInfo.urlKey}/token/${token0?.id}`}>{token0.symbol}</BasicLink>
                          <span>-</span>
                          <BasicLink to={`/${networkInfo.urlKey}/token/${token1?.id}`}>{token1.symbol}</BasicLink> Pool
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
                  {!savedPools[poolAddress] && !below1080 ? (
                    <Hover
                      onClick={() =>
                        addPool(poolAddress, token0.id, token1.id, token0.symbol, token1.symbol, networkInfo.chainId)
                      }
                    >
                      <img src={bookMarkOutline} width={24} height={24} alt='BookMark' style={{ marginRight: '0.5rem' }} />
                    </Hover>
                  ) : !below1080 ? (
                    <Hover onClick={() => removePool(poolAddress)}>
                      <img src={bookMark} width={24} height={24} alt='BookMarked' style={{ marginRight: '0.5rem' }} />
                    </Hover>
                  ) : (
                    <></>
                  )}

                  <Link external href={getPoolLink(token0?.id, networkInfo, token1?.id, false, poolAddress)}>
                    <ButtonOutlined style={{ padding: '11px 22px' }}>+ Add Liquidity</ButtonOutlined>
                  </Link>
                  <Link external href={getSwapLink(token0?.id, networkInfo, token1?.id)}>
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
              gap='6px'
              style={{
                width: 'fit-content',
                marginTop: below900 ? '1rem' : '0',
                marginBottom: below900 ? '0' : '2rem',
                flexWrap: 'wrap',
              }}
            >
              <BasicLink to={`/${networkInfo.urlKey}/token/${token0?.id}`}>
                <FixedPanel>
                  <RowFixed>
                    <TokenLogo address={token0?.id} size={'16px'} networkInfo={networkInfo} />
                    <TYPE.main fontSize={'16px'} lineHeight={1} fontWeight={500} ml={'4px'}>
                      {token0 && token1
                        ? `1 ${formattedSymbol0} = ${token0Rate} ${formattedSymbol1} ${
                            parseFloat(token0?.derivedETH) ? '(' + token0USD + ')' : ''
                          }`
                        : '-'}
                    </TYPE.main>
                  </RowFixed>
                </FixedPanel>
              </BasicLink>
              <BasicLink to={`/${networkInfo.urlKey}/token/${token1?.id}`}>
                <FixedPanel>
                  <RowFixed>
                    <TokenLogo address={token1?.id} size={'16px'} networkInfo={networkInfo} />
                    <TYPE.main fontSize={'16px'} lineHeight={1} fontWeight={500} ml={'4px'}>
                      {token0 && token1
                        ? `1 ${formattedSymbol1} = ${token1Rate} ${formattedSymbol0}  ${
                            parseFloat(token1?.derivedETH) ? '(' + token1USD + ')' : ''
                          }`
                        : '-'}
                    </TYPE.main>
                  </RowFixed>
                </FixedPanel>
              </BasicLink>
            </AutoRow>
            <>
              {!below1080 && <TYPE.main fontSize={'1.125rem'}>Pool Stats</TYPE.main>}
              <PanelWrapper style={{ marginTop: '1.5rem' }}>
                <Panel style={{ height: '100%' }}>
                  <AutoColumn gap='12px'>
                    <RowBetween>
                      <TYPE.main fontSize={12} color={theme.subText}>
                        Total Liquidity {!usingTracked ? '(Untracked)' : ''}
                      </TYPE.main>
                      <div />
                    </RowBetween>
                    <RowBetween align='flex-end'>
                      <TYPE.main fontSize={18} lineHeight={1} fontWeight={500}>
                        {liquidity}
                      </TYPE.main>
                      <TYPE.main>{liquidityChange}</TYPE.main>
                    </RowBetween>
                  </AutoColumn>
                </Panel>
                <Panel style={{ height: '100%' }}>
                  <AutoColumn gap='12px'>
                    <RowBetween>
                      <TYPE.main fontSize={12} color={theme.subText}>
                        Volume (24H) {usingUtVolume && '(Untracked)'}
                      </TYPE.main>
                      <div />
                    </RowBetween>
                    <RowBetween align='flex-end'>
                      <TYPE.main fontSize={18} lineHeight={1} fontWeight={500}>
                        {volume}
                      </TYPE.main>
                      <TYPE.main>{volumeChange}</TYPE.main>
                    </RowBetween>
                  </AutoColumn>
                </Panel>
                <Panel style={{ height: '100%' }}>
                  <AutoColumn gap='12px'>
                    <RowBetween>
                      <TYPE.main fontSize={12} color={theme.subText}>
                        Fees (24H)
                      </TYPE.main>
                      <div />
                    </RowBetween>
                    <RowBetween align='flex-end'>
                      <TYPE.main fontSize={18} lineHeight={1} fontWeight={500}>
                        {fees}
                      </TYPE.main>
                      <TYPE.main>{volumeChange}</TYPE.main>
                    </RowBetween>
                  </AutoColumn>
                </Panel>

                <Panel style={{ height: '100%' }}>
                  <AutoColumn gap='12px'>
                    <RowBetween>
                      <TYPE.main fontSize={12} color={theme.subText}>
                        Pooled Tokens
                      </TYPE.main>
                      <div />
                    </RowBetween>
                    <BasicLink to={`/${networkInfo.urlKey}/token/${token0?.id}`}>
                      <AutoRow gap='4px'>
                        <TokenLogo address={token0?.id} networkInfo={networkInfo} />
                        <TYPE.main fontSize={14} lineHeight={1} fontWeight={500}>
                          <RowFixed>
                            {reserve0 ? formattedNum(reserve0) : ''}{' '}
                            <FormattedName text={token0?.symbol ?? ''} maxCharacters={8} margin={true} />
                          </RowFixed>
                        </TYPE.main>
                      </AutoRow>
                    </BasicLink>
                    <BasicLink to={`/${networkInfo.urlKey}/token/${token1?.id}`}>
                      <AutoRow gap='4px'>
                        <TokenLogo address={token1?.id} networkInfo={networkInfo} />
                        <TYPE.main fontSize={14} lineHeight={1} fontWeight={500}>
                          <RowFixed>
                            {reserve1 ? formattedNum(reserve1) : ''}{' '}
                            <FormattedName text={token1?.symbol ?? ''} maxCharacters={8} margin={true} />
                          </RowFixed>
                        </TYPE.main>
                      </AutoRow>
                    </BasicLink>
                  </AutoColumn>
                </Panel>
                <Panel style={{ height: '100%' }}>
                  <AutoColumn gap='12px'>
                    <RowBetween>
                      <TYPE.main fontSize={12} color={theme.subText}>
                        Ratio
                      </TYPE.main>
                      <div />
                    </RowBetween>
                    <RowFixed>
                      <TYPE.main fontSize={14} lineHeight={1} fontWeight={500}>
                        <RowFixed>
                          {percentToken0 ? formattedTokenRatio(percentToken0) : ''}
                          <FormattedName text={token0?.symbol ?? ''} maxCharacters={8} margin={true} />
                        </RowFixed>
                      </TYPE.main>
                      <div style={{ color: 'white', margin: '0 8px' }}>-</div>
                      <TYPE.main fontSize={14} lineHeight={1} fontWeight={500}>
                        <RowFixed>
                          {percentToken1 ? formattedTokenRatio(percentToken1) : ''}
                          <FormattedName text={token1?.symbol ?? ''} maxCharacters={8} margin={true} />
                        </RowFixed>
                      </TYPE.main>
                    </RowFixed>
                  </AutoColumn>
                </Panel>
                <Panel>
                  <TYPE.main fontSize={12} color={theme.subText} style={{ marginBottom: '12px' }}>
                    Active Price Range
                  </TYPE.main>

                  <Flex sx={{ gap: '12px' }} justifyContent='space-between'>
                    <Flex sx={{ gap: '12px' }} flexDirection='column'>
                      <TYPE.main color={theme.subText}>
                        <FormattedName
                          text={token0?.symbol ?? ''}
                          maxCharacters={8}
                          style={{ display: 'inline-block', color: theme.subText }}
                        />
                        /
                        <FormattedName
                          text={token1?.symbol ?? ''}
                          maxCharacters={8}
                          style={{ display: 'inline-block', color: theme.subText }}
                        />
                      </TYPE.main>

                      <TYPE.main>
                        Max{' '}
                        {token1PriceMax === '0'
                          ? '0.00'
                          : token1PriceMax === '-1'
                          ? '♾️'
                          : parseFloat(token1PriceMax).toPrecision(6)}
                      </TYPE.main>

                      <TYPE.main>
                        Min{' '}
                        {token1PriceMin === '0'
                          ? '0.00'
                          : token1PriceMin === '-1'
                          ? '♾️'
                          : parseFloat(token1PriceMin).toPrecision(6)}
                      </TYPE.main>
                    </Flex>

                    <Flex sx={{ gap: '12px' }} flexDirection='column' alignItems='flex-end'>
                      <TYPE.main color={theme.subText}>
                        <FormattedName
                          text={token1?.symbol ?? ''}
                          maxCharacters={8}
                          style={{ display: 'inline-block', color: theme.subText }}
                        />
                        /
                        <FormattedName
                          text={token0?.symbol ?? ''}
                          maxCharacters={8}
                          style={{ display: 'inline-block', color: theme.subText }}
                        />
                      </TYPE.main>

                      <TYPE.main>
                        Max{' '}
                        {token0PriceMax === '0'
                          ? '0.00'
                          : token0PriceMax === '-1'
                          ? '♾️'
                          : parseFloat(token0PriceMax).toPrecision(6)}
                      </TYPE.main>

                      <TYPE.main>
                        Min{' '}
                        {token0PriceMin === '0'
                          ? '0.00'
                          : token0PriceMin === '-1'
                          ? '‚Äö√¥√¶√î‚àè√®'
                          : parseFloat(token0PriceMin).toPrecision(6)}
                      </TYPE.main>
                    </Flex>
                  </Flex>
                </Panel>
                <Panel
                  style={{
                    gridColumn: below1080 ? '1' : '2/4',
                    gridRow: below1080 ? '' : '1/7',
                  }}
                >
                  <PoolChart
                    address={poolAddress}
                    color={backgroundColor}
                    base0={vReserve0 && vReserve1 ? vReserve1 / vReserve0 : 0}
                    base1={vReserve0 && vReserve1 ? vReserve0 / vReserve1 : 0}
                  />
                </Panel>
              </PanelWrapper>
              <TYPE.main fontSize={'1.125rem'} style={{ marginTop: '3rem' }}>
                Transactions
              </TYPE.main>{' '}
              <Panel
                style={{
                  marginTop: '1.5rem',
                  padding: 0,
                }}
              >
                {transactions ? <TxnList transactions={[transactions]} /> : <Loader />}
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
                    <TYPE.main color={theme.subText} fontSize='12px'>
                      POOL NAME
                    </TYPE.main>
                    <TYPE.main style={{ marginTop: '.75rem' }} fontSize='18px'>
                      <RowFixed>
                        <FormattedName text={token0?.symbol ?? ''} maxCharacters={8} />
                        -
                        <FormattedName text={token1?.symbol ?? ''} maxCharacters={8} />
                      </RowFixed>
                    </TYPE.main>
                  </Column>
                  <Column>
                    <TYPE.main color={theme.subText} fontSize='12px'>
                      POOL ADDRESS
                    </TYPE.main>
                    <AutoRow align='flex-end'>
                      <TYPE.main style={{ marginTop: '.75rem' }} fontSize='18px'>
                        {poolAddress.slice(0, 6) + '...' + poolAddress.slice(38, 42)}
                      </TYPE.main>
                      <CopyHelper toCopy={poolAddress} />
                    </AutoRow>
                  </Column>
                  <Column>
                    <TYPE.main color={theme.subText} fontSize='12px'>
                      <RowFixed>
                        <FormattedName style={{ color: theme.subText }} text={token0?.symbol ?? ''} maxCharacters={8} />{' '}
                        <span style={{ marginLeft: '4px' }}>ADDRESS</span>
                      </RowFixed>
                    </TYPE.main>
                    <AutoRow align='flex-end'>
                      <TYPE.main style={{ marginTop: '.75rem' }} fontSize='18px'>
                        {token0 && token0.id.slice(0, 6) + '...' + token0.id.slice(38, 42)}
                      </TYPE.main>
                      <CopyHelper toCopy={token0?.id} />
                    </AutoRow>
                  </Column>
                  <Column>
                    <TYPE.main color={theme.subText} fontSize='12px'>
                      <RowFixed>
                        <FormattedName style={{ color: theme.subText }} text={token1?.symbol ?? ''} maxCharacters={8} />{' '}
                        <span style={{ marginLeft: '4px' }}>ADDRESS</span>
                      </RowFixed>
                    </TYPE.main>
                    <AutoRow align='flex-end'>
                      <TYPE.main style={{ marginTop: '.5rem' }} fontSize={16}>
                        {token1 && token1.id.slice(0, 6) + '...' + token1.id.slice(38, 42)}
                      </TYPE.main>
                      <CopyHelper toCopy={token1?.id} />
                    </AutoRow>
                  </Column>
                  <Link external href={urls.showAddress(poolAddress)}>
                    <ButtonDark color={backgroundColor} style={{ padding: '11px 22px' }}>
                      View on {networkInfo.etherscanLinkText} ↗
                    </ButtonDark>
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

export default withRouter(PoolPage)
