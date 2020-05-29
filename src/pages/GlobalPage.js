import React, { useState, useEffect } from 'react'
import 'feather-icons'
import { Box } from 'rebass'
import styled from 'styled-components'

import { AutoRow, RowBetween } from '../components/Row'
import { AutoColumn } from '../components/Column'
import PairList from '../components/PairList'
import TopTokenList from '../components/TokenList'
import TxnList from '../components/TxnList'
import GlobalChart from '../components/GlobalChart'
import { Hover, TYPE } from '../Theme'
import { formattedNum, formattedPercent } from '../helpers'
import { useGlobalData, useEthPrice, useGlobalTransactions } from '../contexts/GlobalData'
import { useAllPairs, usePairData } from '../contexts/PairData'
import { Search } from '../components/Search'
import { useMedia } from 'react-use'
import TokenLogo from '../components/TokenLogo'
import Panel from '../components/Panel'
import { useAllTokenData } from '../contexts/TokenData'

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-bottom: 100px;
  width: calc(100% - 20px);
  overflow: scroll;
  & > * {
    width: 100%;
    max-width: 1240px;
  }

  @media screen and (max-width: 1080px) {
    width: calc(100% - 40px);
    padding: 0 20px;
  }
`

const ThemedBackground = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 200vh;
  max-width: 100vw;
  z-index: -1;

  transform: translateY(-70vh);
  background: ${({ theme }) => theme.background};
`

const ListOptions = styled(AutoRow)`
  height: 40px;
  width: 100%;
  font-size: 1.25rem;
  font-weight: 600;

  @media screen and (max-width: 640px) {
    font-size: 1rem;
  }
`

const GridRow = styled.div`
  display: inline-grid;
  width: 100%;
  grid-template-columns: 50% 50%;
  column-gap: 6px;
  align-items: start;
  justify-content: center;
`

const TopGroup = styled.div`
  grid-template-columns: 1fr 1fr 1fr 1fr;
  column-gap: 6px;
  display: inline-grid;
  width: 100%;
  align-items: start;
`

const ChartWrapper = styled.div`
  height: 100%;
`

const PriceCard = styled(Panel)`
  position: absolute;
  right: -60px;
  width: fit-content;
  top: -40px;
  z-index: 10;
  background-color: ${({ theme }) => theme.bg4};
`

const LIST_VIEW = {
  TOKENS: 'tokens',
  PAIRS: 'pairs'
}

function GlobalPage() {
  const [listView, setListView] = useState(LIST_VIEW.PAIRS)

  const {
    totalLiquidityUSD,
    oneDayVolumeUSD,
    volumeChangeUSD,
    liquidityChangeUSD,
    oneDayTxns,
    txnChange
  } = useGlobalData()

  const transactions = useGlobalTransactions()

  const allPairs = useAllPairs()
  const allTokens = useAllTokenData()

  const ethPrice = useEthPrice()
  const formattedEthPrice = ethPrice ? formattedNum(ethPrice, true) : '-'

  const liquidity = totalLiquidityUSD ? formattedNum(totalLiquidityUSD, true) : '-'

  const liquidityChange = liquidityChangeUSD ? formattedPercent(liquidityChangeUSD) : '-'

  const volume = oneDayVolumeUSD ? formattedNum(oneDayVolumeUSD, true) : '-'

  const volumeChange = volumeChangeUSD ? formattedPercent(volumeChangeUSD) : '-'

  let txnChangeFormatted = txnChange ? formattedPercent(txnChange) : '-'

  const below1080 = useMedia('(max-width: 1080px)')
  const below600 = useMedia('(max-width: 600px)')

  const daiPair = usePairData('0xa478c2975ab1ea89e8196811f51a7b7ade33eb11')
  const usdcPair = usePairData('0xb4e16d0168e52d35cacd2c6185b44281ec28c9dc')

  const [daiPerEth, setDaiPerEth] = useState()
  useEffect(() => {
    if (daiPair) {
      if (daiPair.token0?.id === '"0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"') {
        setDaiPerEth(parseFloat(daiPair.token0Price).toFixed(2))
      } else {
        setDaiPerEth(parseFloat(daiPair.token0Price).toFixed(2))
      }
    }
  }, [daiPair])

  const [usdcPerEth, setUSDCPerEth] = useState()
  useEffect(() => {
    if (usdcPair) {
      if (usdcPair.token0?.id === '"0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"') {
        setUSDCPerEth(parseFloat(usdcPair.token1Price).toFixed(2))
      } else {
        setUSDCPerEth(parseFloat(usdcPair.token0Price).toFixed(2))
      }
    }
  }, [usdcPair])

  const [showPriceCard, setShowPriceCard] = useState(false)

  return (
    <PageWrapper>
      <ThemedBackground />
      <Search small={!!below600} />
      {!below1080 && (
        <TYPE.main fontSize={'1.125rem'} style={{ marginTop: '3rem' }}>
          Overall Stats
        </TYPE.main>
      )}
      {below1080 && ( // mobile card
        <Box mb={20}>
          <Box mb={20} mt={'1.5rem'}>
            <Panel>
              <Box>
                <AutoColumn gap="40px">
                  <AutoColumn gap="20px">
                    <RowBetween>
                      <TYPE.main>Volume (24hrs)</TYPE.main>
                      <div />
                    </RowBetween>
                    <RowBetween align="flex-end">
                      <TYPE.main fontSize={'1.5rem'} lineHeight={1} fontWeight={600}>
                        {volume}
                      </TYPE.main>
                      <TYPE.main fontSize={12}>{volumeChange}</TYPE.main>
                    </RowBetween>
                  </AutoColumn>
                  <AutoColumn gap="20px">
                    <RowBetween>
                      <TYPE.main>Total Liquidity</TYPE.main>
                      <div />
                    </RowBetween>
                    <RowBetween align="flex-end">
                      <TYPE.main fontSize={'1.5rem'} lineHeight={1} fontWeight={600}>
                        {liquidity && liquidity}
                      </TYPE.main>
                      <TYPE.main fontSize={12}>{liquidityChange && liquidityChange}</TYPE.main>
                    </RowBetween>
                  </AutoColumn>
                  <AutoColumn gap="20px">
                    <RowBetween>
                      <TYPE.main>Transactions (24hrs)</TYPE.main>
                      <div />
                    </RowBetween>
                    <RowBetween align="flex-end">
                      <TYPE.main fontSize={'1.5rem'} lineHeight={1} fontWeight={600}>
                        {!!oneDayTxns ? oneDayTxns : '-'}
                      </TYPE.main>
                      <TYPE.main fontSize={12}>{txnChangeFormatted && txnChangeFormatted}</TYPE.main>
                    </RowBetween>
                  </AutoColumn>
                </AutoColumn>
              </Box>
            </Panel>
          </Box>
          <Box>
            <Panel>
              <ChartWrapper area="fill" rounded>
                <GlobalChart />
              </ChartWrapper>
            </Panel>
          </Box>
        </Box>
      )}
      {!below1080 && ( // desktop
        <TopGroup style={{ marginTop: '1.5rem' }}>
          <Panel
            hover={true}
            onMouseEnter={() => {
              setShowPriceCard(true)
            }}
            onMouseLeave={() => {
              setShowPriceCard(false)
            }}
          >
            {showPriceCard && (
              <PriceCard>
                <AutoColumn gap="10px">
                  <AutoRow>
                    <TYPE.main>DAI/ETH: {daiPerEth}</TYPE.main>
                  </AutoRow>
                  <AutoRow>
                    <TYPE.main>USDC/ETH: {usdcPerEth}</TYPE.main>
                  </AutoRow>
                </AutoColumn>
              </PriceCard>
            )}
            <AutoColumn gap="20px">
              <RowBetween>
                <TYPE.main>Uniswap ETH price</TYPE.main>
                <div />
              </RowBetween>
              <RowBetween align="flex-end">
                {formattedEthPrice && (
                  <TYPE.main fontSize={'1.5rem'} lineHeight={1} fontWeight={600}>
                    {formattedEthPrice}
                  </TYPE.main>
                )}
                <TokenLogo address={'0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'} />
              </RowBetween>
            </AutoColumn>
          </Panel>
          <Panel>
            <AutoColumn gap="20px">
              <RowBetween>
                <TYPE.main>Total Liquidity</TYPE.main>
                <div />
              </RowBetween>
              <RowBetween align="flex-end">
                <TYPE.main fontSize={'1.5rem'} lineHeight={1} fontWeight={600}>
                  {liquidity && liquidity}
                </TYPE.main>
                <TYPE.main fontSize={14}>{liquidityChange && liquidityChange}</TYPE.main>
              </RowBetween>
            </AutoColumn>
          </Panel>
          <Panel>
            <AutoColumn gap="20px">
              <RowBetween>
                <TYPE.main>Volume (24hrs)</TYPE.main>
                <div />
              </RowBetween>
              <RowBetween align="flex-end">
                <TYPE.main fontSize={'1.5rem'} lineHeight={1} fontWeight={600}>
                  {volume}
                </TYPE.main>
                <TYPE.main fontSize={14}>{volumeChange}</TYPE.main>
              </RowBetween>
            </AutoColumn>
          </Panel>
          <Panel>
            <AutoColumn gap="20px">
              <RowBetween>
                <TYPE.main>Transactions (24hrs)</TYPE.main>
                <div />
              </RowBetween>
              <RowBetween align="flex-end">
                <TYPE.main fontSize={'1.5rem'} lineHeight={1} fontWeight={600}>
                  {oneDayTxns}
                </TYPE.main>
                <TYPE.main fontSize={14}>{txnChangeFormatted && txnChangeFormatted}</TYPE.main>
              </RowBetween>
            </AutoColumn>
          </Panel>
        </TopGroup>
      )}

      {!below1080 && (
        <GridRow style={{ marginTop: '6px' }}>
          <Panel style={{ height: '100%', minHeight: '300px' }}>
            <ChartWrapper area="fill" rounded>
              <GlobalChart display="liquidity" />
            </ChartWrapper>
          </Panel>
          <Panel style={{ height: '100%' }}>
            <ChartWrapper area="fill" rounded>
              <GlobalChart display="volume" />
            </ChartWrapper>
          </Panel>
        </GridRow>
      )}

      <ListOptions gap="10px" style={{ marginTop: '2rem', marginBottom: '.5rem' }}>
        <Hover>
          <TYPE.main
            onClick={() => {
              setListView(LIST_VIEW.PAIRS)
            }}
            fontSize={'1.125rem'}
            color={listView === LIST_VIEW.TOKENS ? '#aeaeae' : 'black'}
          >
            Pairs
          </TYPE.main>
        </Hover>
        <Hover>
          <TYPE.main
            onClick={() => {
              setListView(LIST_VIEW.TOKENS)
            }}
            fontSize={'1.125rem'}
            color={listView === LIST_VIEW.PAIRS ? '#aeaeae' : 'black'}
          >
            Tokens
          </TYPE.main>
        </Hover>
      </ListOptions>

      <Panel style={{ marginTop: '6px' }}>
        {listView === LIST_VIEW.PAIRS ? <PairList pairs={allPairs} /> : <TopTokenList tokens={allTokens} />}
      </Panel>

      <TYPE.main fontSize={'1.125rem'} style={{ marginTop: '2rem' }}>
        Transactions
      </TYPE.main>
      <Panel style={{ margin: '1rem 0' }}>
        <TxnList transactions={transactions} />
      </Panel>
    </PageWrapper>
  )
}

export default GlobalPage
