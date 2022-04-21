import { useEffect, useState } from 'react'
import { useLocation, useParams, Navigate, Link as RouterLink } from 'react-router-dom'
import styled from 'styled-components/macro'
import Panel from 'components/Panel'
import { PageWrapper, ContentWrapperLarge, StyledIcon } from 'components/index'
import { AutoRow, RowBetween, RowFixed } from 'components/Row'
import Column, { AutoColumn } from 'components/Column'
import { ButtonLight, ButtonDark } from 'components/ButtonStyled'
import PairChart from 'components/PairChart'
import Link from 'components/Link'
import TxnList from 'components/TxnList'
import { isAddress } from 'utils'
import Loader from 'components/LocalLoader'
import { PAIR_BLACKLIST } from 'constants/index'
import { BasicLink } from 'components/Link'
import Search from 'components/Search'
import { formattedNum, formattedPercent, getPoolLink, getSwapLink } from 'utils'
import { usePairData, usePairTransactions } from 'state/features/pairs/hooks'
import { DashboardWrapper, TYPE } from 'Theme'
import CopyHelper from 'components/Copy'
import { useMedia } from 'react-use'
import DoubleTokenLogo from 'components/DoubleLogo'
import TokenLogo from 'components/TokenLogo'
import { Hover } from 'components'
import { useEthPrice } from 'state/features/global/hooks'
import Warning from 'components/Warning'
import { usePathDismissed, useSavedPairs } from 'state/features/user/hooks'
import { useFormatPath } from 'hooks'
import { Bookmark, PlusCircle } from 'react-feather'
import FormattedName from 'components/FormattedName'
import { useListedTokens } from 'state/features/application/hooks'
import { useTranslation } from 'react-i18next'
import { useActiveNetworkId } from 'state/features/application/hooks'

const PanelWrapper = styled.div`
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: max-content;
  gap: 14px;
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
      margin-bottom: 1.5rem;
    }

    &:last-child {
      align-items: start;
      justify-items: start;
    }
  }
`

const FixedPanel = styled(Panel)`
  width: fit-content;
  padding: 0;
  border: 0;
  background: unset;
  cursor: pointer;
  box-shadow: unset;
`

const TokenSymbolLink = styled(RouterLink)`
  color: ${({ theme }) => theme.white};

  :hover {
    cursor: pointer;
    opacity: 0.7;
  }
`

const WarningGrouping = styled.div`
  opacity: ${({ disabled }) => disabled && '0.4'};
  pointer-events: ${({ disabled }) => disabled && 'none'};
`

const CustomFormattedName = styled(FormattedName)`
  color: ${({ theme }) => theme.text1};
`

function PairPage() {
  const { t } = useTranslation()
  const formatPath = useFormatPath()
  const { pairAddress } = useParams()
  const location = useLocation()
  const activeNetworkId = useActiveNetworkId()

  if (PAIR_BLACKLIST.includes(pairAddress.toLowerCase()) || !isAddress(pairAddress.toLowerCase())) {
    return <Navigate to={formatPath('/')} />
  }

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
    liquidityChangeUSD
  } = usePairData(pairAddress)

  const transactions = usePairTransactions(pairAddress)

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
  const below1024 = useMedia('(max-width: 1024px)')
  const below900 = useMedia('(max-width: 900px)')
  const below600 = useMedia('(max-width: 600px)')
  const below440 = useMedia('(max-width: 440px)')

  const [dismissed, markAsDismissed] = usePathDismissed(location.pathname)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const [savedPairs, addPair] = useSavedPairs()

  const listedTokens = useListedTokens()

  return (
    <PageWrapper>
      <span />
      <Warning
        type={'pair'}
        show={!dismissed && listedTokens && !(listedTokens.includes(token0?.id) && listedTokens.includes(token1?.id))}
        setShow={markAsDismissed}
        address={pairAddress}
      />
      <ContentWrapperLarge>
        <RowBetween>
          <TYPE.body>
            <BasicLink to={formatPath('/pairs')}>{'Pairs '}</BasicLink>→ {token0?.symbol}-{token1?.symbol}
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
                  width: '100%'
                }}
              >
                <RowFixed style={{ flexWrap: 'wrap', minWidth: '100px' }}>
                  <RowFixed>
                    {token0 && token1 && (
                      <DoubleTokenLogo
                        a0={token0?.id || ''}
                        a1={token1?.id || ''}
                        size={below440 ? 22 : 32}
                        margin={true}
                      />
                    )}{' '}
                    <TYPE.main
                      fontSize={!below1080 ? '2.5rem' : below440 ? '1.25rem' : '1.5rem'}
                      style={{ margin: '0 1rem' }}
                    >
                      {token0 && token1 ? (
                        <>
                          <TokenSymbolLink to={formatPath(`/tokens/${token0?.id}`)}>{token0.symbol}</TokenSymbolLink>
                          <span>/</span>
                          <TokenSymbolLink to={formatPath(`/tokens/${token1?.id}`)}>
                            {token1.symbol}
                          </TokenSymbolLink>{' '}
                          {t('pair')}
                        </>
                      ) : null}
                    </TYPE.main>
                  </RowFixed>
                </RowFixed>
                <RowFixed
                  ml={below900 ? '0' : '2.5rem'}
                  mt={below1080 && '1rem'}
                  style={{
                    flexDirection: below1080 ? 'row-reverse' : 'initial'
                  }}
                >
                  {!savedPairs[pairAddress] && !below1080 ? (
                    <Hover onClick={() => addPair(pairAddress, token0.id, token1.id, token0.symbol, token1.symbol)}>
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

                  <Link external href={getPoolLink(activeNetworkId, token0?.id, token1?.id)}>
                    <ButtonLight>{t('addLiquidity')}</ButtonLight>
                  </Link>
                  <Link external href={getSwapLink(activeNetworkId, token0?.id, token1?.id)}>
                    <ButtonDark ml={!below1080 && '.5rem'} mr={below1080 && '.5rem'}>
                      {t('trade')}
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
                flexWrap: 'wrap'
              }}
            >
              <FixedPanel as={RouterLink} to={formatPath(`/tokens/${token0?.id}`)}>
                <RowFixed>
                  <TokenLogo address={token0?.id} size={'1rem'} />
                  <TYPE.light fontSize=".875rem" lineHeight="1rem" fontWeight={700} ml=".25rem" mr="3.75rem">
                    {token0 && token1
                      ? `1 ${formattedSymbol0} = ${token0Rate} ${formattedSymbol1} ${
                          parseFloat(token0?.derivedETH) ? '(' + token0USD + ')' : ''
                        }`
                      : '-'}
                  </TYPE.light>
                </RowFixed>
              </FixedPanel>

              <FixedPanel as={RouterLink} to={formatPath(`/tokens/${token1?.id}`)}>
                <RowFixed>
                  <TokenLogo address={token1?.id} size={'16px'} />
                  <TYPE.light fontSize={'.875rem'} lineHeight={'1rem'} fontWeight={700} ml={'.25rem'}>
                    {token0 && token1
                      ? `1 ${formattedSymbol1} = ${token1Rate} ${formattedSymbol0}  ${
                          parseFloat(token1?.derivedETH) ? '(' + token1USD + ')' : ''
                        }`
                      : '-'}
                  </TYPE.light>
                </RowFixed>
              </FixedPanel>
            </AutoRow>
            <>
              {!below1080 && <TYPE.main fontSize={'1.375rem'}>{t('pairStats')}</TYPE.main>}
              <PanelWrapper style={{ marginTop: '.875rem' }}>
                <Panel style={{ height: '100%' }}>
                  <AutoColumn gap="20px">
                    <RowBetween>
                      <TYPE.light fontSize={14} fontWeight={500}>
                        {t('totalLiquidity')} {!usingTracked ? `(${t('untracked')})` : ''}
                      </TYPE.light>
                      <div />
                    </RowBetween>
                    <RowBetween align="flex-end">
                      <TYPE.main fontSize={'1.5rem'} lineHeight={1} fontWeight={500}>
                        {liquidity}
                      </TYPE.main>
                      <TYPE.main fontSize={12} fontWeight={500}>
                        {liquidityChange}
                      </TYPE.main>
                    </RowBetween>
                  </AutoColumn>
                </Panel>
                <Panel style={{ height: '100%' }}>
                  <AutoColumn gap="20px">
                    <RowBetween>
                      <TYPE.light fontSize={14} fontWeight={500}>
                        {t('volume24hrs')} {usingUtVolume && `(${t('untracked')})`}
                      </TYPE.light>
                      <div />
                    </RowBetween>
                    <RowBetween align="flex-end">
                      <TYPE.main fontSize={'1.5rem'} lineHeight={1} fontWeight={500}>
                        {volume}
                      </TYPE.main>
                      <TYPE.main fontSize={12} fontWeight={500}>
                        {volumeChange}
                      </TYPE.main>
                    </RowBetween>
                  </AutoColumn>
                </Panel>
                <Panel style={{ height: '100%' }}>
                  <AutoColumn gap="20px">
                    <RowBetween>
                      <TYPE.light fontSize={14} fontWeight={500}>
                        {t('fees24hrs')}
                      </TYPE.light>
                      <div />
                    </RowBetween>
                    <RowBetween align="flex-end">
                      <TYPE.main fontSize={'1.5rem'} lineHeight={1} fontWeight={500}>
                        {fees}
                      </TYPE.main>
                      <TYPE.main fontSize={12} fontWeight={500}>
                        {volumeChange}
                      </TYPE.main>
                    </RowBetween>
                  </AutoColumn>
                </Panel>

                <Panel style={{ height: '100%' }}>
                  <AutoColumn gap="20px">
                    <RowBetween>
                      <TYPE.light fontSize={14} fontWeight={500}>
                        {t('pooledTokens')}
                      </TYPE.light>
                      <div />
                    </RowBetween>
                    <Hover as={RouterLink} to={formatPath(`/tokens/${token0?.id}`)} $fade>
                      <AutoRow gap="4px">
                        <TokenLogo address={token0?.id} />
                        <TYPE.main fontSize={20} lineHeight={1} fontWeight={500}>
                          <RowFixed>
                            {reserve0 ? formattedNum(reserve0) : ''}{' '}
                            <FormattedName text={token0?.symbol ?? ''} maxCharacters={8} margin={true} />
                          </RowFixed>
                        </TYPE.main>
                      </AutoRow>
                    </Hover>
                    <Hover as={RouterLink} to={formatPath(`/tokens/${token1?.id}`)} $fade>
                      <AutoRow gap="4px">
                        <TokenLogo address={token1?.id} />
                        <TYPE.main fontSize={20} lineHeight={1} fontWeight={500}>
                          <RowFixed>
                            {reserve1 ? formattedNum(reserve1) : ''}{' '}
                            <FormattedName text={token1?.symbol ?? ''} maxCharacters={8} margin={true} />
                          </RowFixed>
                        </TYPE.main>
                      </AutoRow>
                    </Hover>
                  </AutoColumn>
                </Panel>
                <Panel
                  style={{
                    gridColumn: !below1080 ? '2/4' : below1024 ? '1/4' : '2/-1',
                    gridRow: below1080 ? '' : '1/5',
                    width: '100%'
                  }}
                >
                  <PairChart
                    address={pairAddress}
                    color={'#2E69BB'}
                    base0={reserve1 / reserve0}
                    base1={reserve0 / reserve1}
                  />
                </Panel>
              </PanelWrapper>
            </>
          </DashboardWrapper>
          <DashboardWrapper style={{ marginTop: '1rem' }}>
            <TYPE.main fontSize={22} fontWeight={500}>
              {t('transactions')}
            </TYPE.main>{' '}
            {transactions ? <TxnList transactions={transactions} /> : <Loader />}
          </DashboardWrapper>
          <DashboardWrapper style={{ marginTop: '1rem' }}>
            <RowBetween>
              <TYPE.main fontSize={22} fontWeight={500}>
                {t('pairInformation')}
              </TYPE.main>{' '}
            </RowBetween>
            <Panel
              rounded
              style={{
                marginTop: below440 ? '.75rem' : '1.5rem'
              }}
              p={20}
            >
              <TokenDetailsLayout>
                <Column>
                  <TYPE.light>{t('pairName')}</TYPE.light>
                  <TYPE.main style={{ marginTop: '.5rem' }}>
                    <RowFixed>
                      <CustomFormattedName text={token0?.symbol ?? ''} maxCharacters={8} />
                      -
                      <CustomFormattedName text={token1?.symbol ?? ''} maxCharacters={8} />
                    </RowFixed>
                  </TYPE.main>
                </Column>
                <Column>
                  <TYPE.light>{t('pairAddress')}</TYPE.light>
                  <RowBetween style={{ marginTop: '-5px' }}>
                    <TYPE.main style={{ marginTop: '.5rem' }}>
                      {pairAddress.slice(0, 6) + '...' + pairAddress.slice(38, 42)}
                    </TYPE.main>
                    <CopyHelper toCopy={pairAddress} />
                  </RowBetween>
                </Column>
                <Column>
                  <TYPE.light>
                    <RowFixed>
                      <FormattedName text={token0?.symbol ?? ''} maxCharacters={8} />{' '}
                      <span style={{ marginLeft: '4px' }}>{t('address')}</span>
                    </RowFixed>
                  </TYPE.light>
                  <RowBetween style={{ marginTop: '-5px' }}>
                    <TYPE.main style={{ marginTop: '.5rem' }}>
                      {token0 && token0.id.slice(0, 6) + '...' + token0.id.slice(38, 42)}
                    </TYPE.main>
                    <CopyHelper toCopy={token0?.id} />
                  </RowBetween>
                </Column>
                <Column>
                  <TYPE.light>
                    <RowFixed>
                      <FormattedName text={token1?.symbol ?? ''} maxCharacters={8} />{' '}
                      <span style={{ marginLeft: '4px' }}>{t('address')}</span>
                    </RowFixed>
                  </TYPE.light>
                  <RowBetween style={{ marginTop: '-5px' }}>
                    <TYPE.main style={{ marginTop: '.5rem' }}>
                      {token1 && token1.id.slice(0, 6) + '...' + token1.id.slice(38, 42)}
                    </TYPE.main>
                    <CopyHelper toCopy={token1?.id} />
                  </RowBetween>
                </Column>
                <ButtonLight>
                  <Link external href={'https://etherscan.io/address/' + pairAddress}>
                    {t('viewOnEtherscan')} ↗
                  </Link>
                </ButtonLight>
              </TokenDetailsLayout>
            </Panel>
          </DashboardWrapper>
        </WarningGrouping>
      </ContentWrapperLarge>
    </PageWrapper>
  )
}

export default PairPage
