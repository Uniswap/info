import React, { useState } from 'react'
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
import { formattedNum } from '../helpers'
import { useGlobalData, useEthPrice } from '../contexts/GlobalData'
import { useAllTokenData } from '../contexts/TokenData'
import { useCurrentCurrency } from '../contexts/Application'
import { useAllPairs } from '../contexts/PairData'
import { Search } from '../components/Search'
import EthLogo from '../assets/eth.png'
import { useMedia } from 'react-use'

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
  min-height: 400px;
  grid-template-columns: 50% 50%;
  column-gap: 6px;
  align-items: start;
`

const TopGroup = styled.div`
  grid-template-columns: 1fr 1fr 1fr 1fr;
  column-gap: 6px;
  display: inline-grid;
  width: 100%;
  align-items: start;
`

const Panel = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  border-radius: 12px;
  background-color: ${({ theme }) => theme.advancedBG};
  padding: 1.25rem;
  box-sizing: border-box;
  box-shadow: 0 1.1px 2.8px -9px rgba(0, 0, 0, 0.008), 0 2.7px 6.7px -9px rgba(0, 0, 0, 0.012),
    0 5px 12.6px -9px rgba(0, 0, 0, 0.015), 0 8.9px 22.6px -9px rgba(0, 0, 0, 0.018),
    0 16.7px 42.2px -9px rgba(0, 0, 0, 0.022), 0 40px 101px -9px rgba(0, 0, 0, 0.03);
`

const ChartWrapper = styled.div`
  height: 100%;
  /* padding: 24px; */
`

const ListGrouping = styled(GridRow)`
  @media screen and (max-width: 1020px) {
    display: inline-grid;
    width: 100%;
    min-height: 400px;
    grid-template-columns: 100%;
    grid-template-rows: 50% 50%;
    column-gap: 6px;
    align-items: start;
  }
`

const EthIcon = styled.img`
  height: 20px;
  width: 20px;
`

function GlobalPage() {
  const [txFilter, setTxFilter] = useState('ALL')
  const [tokenFilter, setTokenFilter] = useState('TOKENS')

  const {
    totalLiquidityUSD,
    totalLiquidityETH,
    oneDayVolumeUSD,
    oneDayVolumeETH,
    volumeChangeUSD,
    volumeChangeETH,
    liquidityChangeUSD,
    liquidityChangeETH,
    oneDayTxns,
    txnChange,
    transactions,
    chartData
  } = useGlobalData()

  const allTokenData = useAllTokenData()
  const pairs = useAllPairs()
  const [currency] = useCurrentCurrency()

  const ethPrice = useEthPrice()
  const formattedEthPrice = ethPrice ? formattedNum(ethPrice, true) : '0.00'

  const liquidity =
    currency === 'ETH'
      ? formattedNum(totalLiquidityETH)
      : totalLiquidityUSD
      ? formattedNum(totalLiquidityUSD, true)
      : '0.00'

  const liquidityChange =
    currency === 'ETH'
      ? formattedNum(liquidityChangeETH) + '%'
      : liquidityChangeUSD
      ? formattedNum(liquidityChangeUSD) + '%'
      : '0.00'

  const volume =
    currency === 'ETH'
      ? formattedNum(oneDayVolumeETH, true)
      : oneDayVolumeUSD
      ? formattedNum(oneDayVolumeUSD, true)
      : '0.00'

  const volumeChange =
    currency === 'ETH' ? formattedNum(volumeChangeETH) + '%' : volumeChangeUSD ? volumeChangeUSD + '%' : '0.00'

  const below1080 = useMedia('(max-width: 1080px)')

  return (
    <PageWrapper>
      <ThemedBackground />
      <Search small={false} />
      {below1080 && ( // mobile card
        <Box mb={20}>
          <Box mb={20} mt={30}>
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
                      <TYPE.main>{volumeChange}</TYPE.main>
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
                      <TYPE.main>{liquidityChange && liquidityChange}</TYPE.main>
                    </RowBetween>
                  </AutoColumn>
                  <AutoColumn gap="20px">
                    <RowBetween>
                      <TYPE.main>Transactions (24hrs)</TYPE.main>
                      <div />
                    </RowBetween>
                    <RowBetween align="flex-end">
                      <TYPE.main fontSize={'1.5rem'} lineHeight={1} fontWeight={600}>
                        {oneDayTxns ? oneDayTxns : '0'}
                      </TYPE.main>
                      <TYPE.main>{txnChange && txnChange + '%'}</TYPE.main>
                    </RowBetween>
                  </AutoColumn>
                </AutoColumn>
              </Box>
            </Panel>
          </Box>
          <Box>
            <Panel>
              <ChartWrapper area="fill" rounded>
                <GlobalChart chartData={chartData} />
              </ChartWrapper>
            </Panel>
          </Box>
        </Box>
      )}
      {!below1080 && ( // desktop
        <TopGroup style={{ marginTop: '40px' }}>
          <Panel>
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
                <EthIcon src={EthLogo} />
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
                <TYPE.main>{volumeChange}</TYPE.main>
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
                <TYPE.main>{liquidityChange && liquidityChange}</TYPE.main>
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
                <TYPE.main>{txnChange && txnChange + '%'}</TYPE.main>
              </RowBetween>
            </AutoColumn>
          </Panel>
        </TopGroup>
      )}
      {!below1080 && (
        <GridRow style={{ marginTop: '6px' }}>
          <Panel style={{ height: '100%' }}>
            <ChartWrapper area="fill" rounded>
              <GlobalChart chartData={chartData} display="liquidity" />
            </ChartWrapper>
          </Panel>
          <Panel style={{ height: '100%' }}>
            <ChartWrapper area="fill" rounded>
              <GlobalChart chartData={chartData} display="volume" />
            </ChartWrapper>
          </Panel>
        </GridRow>
      )}
      <ListGrouping>
        <Panel style={{ marginTop: '6px' }}>
          <ListOptions gap="10px">
            <Hover>
              <TYPE.main
                onClick={() => {
                  setTokenFilter('PAIRS')
                }}
                fontSize={'1rem'}
              >
                Top Pairs
              </TYPE.main>
            </Hover>
          </ListOptions>
          <PairList pairs={pairs && Object.keys(pairs).map(key => pairs[key])} />
        </Panel>
        <Panel style={{ marginTop: '6px' }}>
          <Hover>
            <TYPE.main
              onClick={() => {
                setTokenFilter('PAIRS')
              }}
              fontSize={'1rem'}
            >
              Top Tokens
            </TYPE.main>
          </Hover>
          <TopTokenList tokens={allTokenData} />
        </Panel>
      </ListGrouping>
      <Panel style={{ margin: '1rem 0' }}>
        <ListOptions gap="10px">
          <Hover>
            <TYPE.main
              onClick={() => {
                setTxFilter('ALL')
              }}
              fontSize={'1rem'}
              color={txFilter !== 'ALL' ? '#aeaeae' : 'black'}
            >
              All
            </TYPE.main>
          </Hover>
          <Hover>
            <TYPE.main
              onClick={() => {
                setTxFilter('SWAP')
              }}
              fontSize={'1rem'}
              color={txFilter !== 'SWAP' ? '#aeaeae' : 'black'}
            >
              Swaps
            </TYPE.main>
          </Hover>
          <Hover>
            <TYPE.main
              onClick={() => {
                setTxFilter('ADD')
              }}
              fontSize={'1rem'}
              color={txFilter !== 'ADD' ? '#aeaeae' : 'black'}
            >
              Adds
            </TYPE.main>
          </Hover>
          <Hover>
            <TYPE.main
              onClick={() => {
                setTxFilter('REMOVE')
              }}
              fontSize={'1rem'}
              color={txFilter !== 'REMOVE' ? '#aeaeae' : 'black'}
            >
              Removes
            </TYPE.main>
          </Hover>
        </ListOptions>
        <TxnList transactions={transactions} txFilter={txFilter} />
      </Panel>
    </PageWrapper>
  )
}

export default GlobalPage
