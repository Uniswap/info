import React, { useState, useEffect, useRef } from 'react'
import 'feather-icons'
import { Text, Box } from 'rebass'
import styled from 'styled-components'

import { RowFlat, AutoRow, RowBetween } from '../components/Row'
import Column, { AutoColumn } from '../components/Column'
import { Hint } from '../components'
import PairList from '../components/PairList'
import TopTokenList from '../components/TokenList'
import TxnList from '../components/TxnList'
import GlobalChart from '../components/GlobalChart'

import { Hover } from '../Theme'

import { formattedNum } from '../helpers'
import { useColor } from '../contexts/Application'
import { useGlobalData, useEthPrice } from '../contexts/GlobalData'
import { useAllTokenData } from '../contexts/TokenData'
import { useCurrentCurrency } from '../contexts/Application'
import { useAllPairs } from '../contexts/PairData'
import { Search } from '../components/Search'
import EthLogo from '../assets/eth.png'
import { useMedia } from 'react-use'
import { useOutsideClick } from '../hooks'

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-bottom: 100px;
  width: calc(100% - 80px);
  padding: 0 40px;
  overflow: scroll;
  & > * {
    width: 100%;
    max-width: 1240px;
  }

  @media screen and (max-width: 640px) {
    width: calc(100% - 40px);
    padding: 0 20px;
  }
`

const ThemedBackground = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 900px;
  max-width: 100vw;
  z-index: -1;
  background: ${({ theme }) => theme.background};
`

const ListOptions = styled(AutoRow)`
  height: 40px
  width: 100%;
  font-size: 24px;
  font-weight: 600;

  @media screen and (max-width: 640px) {
    font-size: 16px
  }
`

const GridRow = styled.div`
  display: inline-grid;
  width: 100%;
  min-height: 500px;
  grid-template-columns: 30% 70%;
  column-gap: 6px;
  align-items: start;
`

const LeftGroup = styled.div`
  display: grid;
  grid-template-rows: min-content auto;
  row-gap: 6px;
  height: 100%;
`

const Panel = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  border-radius: 20px;
  background-color: ${({ theme }) => theme.panelColor};
`

const SpacedColumn = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  height: 100%;
  padding: 24px;
`

const ChartWrapper = styled.div`
  height: 100%;
  padding: 24px;
`

const PaddedGroup = styled.div`
  padding: 24px;
  @media screen and (max-width: 640px) {
    padding: 20px;
  }
`

const EthIcon = styled.img`
  height: 26px;
  width: 26px;
  position: absolute;
  top: 24px;
  right: 20px;
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
  const formattedEthPrice = ethPrice ? formattedNum(ethPrice, true) : ''

  const [, setColor] = useColor()

  const liquidity =
    currency === 'ETH'
      ? formattedNum(totalLiquidityETH)
      : totalLiquidityUSD
      ? formattedNum(totalLiquidityUSD, true)
      : ''

  const liquidityChange =
    currency === 'ETH'
      ? formattedNum(liquidityChangeETH) + '%'
      : liquidityChangeUSD
      ? formattedNum(liquidityChangeUSD) + '%'
      : ''

  const volume =
    currency === 'ETH'
      ? formattedNum(oneDayVolumeETH, true)
      : oneDayVolumeUSD
      ? formattedNum(oneDayVolumeUSD, true)
      : ''

  const volumeChange =
    currency === 'ETH' ? formattedNum(volumeChangeETH) + '%' : volumeChangeUSD ? volumeChangeUSD + '%' : ''

  useEffect(() => {
    setColor('#FE6DDE')
  }, [setColor])

  const below1080 = useMedia('(max-width: 1080px)')

  const [outsideMain, setOutsideMain] = useState(false)
  const ref = useRef()

  useOutsideClick(ref, val => {
    setOutsideMain(val)
  })

  return (
    <PageWrapper>
      <ThemedBackground />
      <Search ref={ref} outsideMain={outsideMain} />
      {below1080 && (
        <Box mb={20}>
          <Box mb={20} mt={30}>
            <Panel>
              <Box padding="20px">
                <AutoColumn gap="40px">
                  <AutoColumn gap="20px">
                    <RowBetween>
                      <Text>Volume (24hrs)</Text>
                      <div />
                    </RowBetween>
                    <RowBetween align="flex-end">
                      <Text fontSize={36} lineHeight={1} fontWeight={600}>
                        {volume}
                      </Text>
                      <Text>{volumeChange}</Text>
                    </RowBetween>
                  </AutoColumn>
                  <AutoColumn gap="20px">
                    <RowBetween>
                      <Text>Total Liquidity</Text>
                      <div />
                    </RowBetween>
                    <RowBetween align="flex-end">
                      <Text fontSize={36} lineHeight={1} fontWeight={600}>
                        {liquidity && liquidity}
                      </Text>
                      <Text>{liquidityChange && liquidityChange}</Text>
                    </RowBetween>
                  </AutoColumn>
                  <AutoColumn gap="20px">
                    <RowBetween>
                      <Text>Transactions (24hrs)</Text>
                      <div />
                    </RowBetween>
                    <RowBetween align="flex-end">
                      <Text fontSize={36} lineHeight={1} fontWeight={600}>
                        {oneDayTxns}
                      </Text>
                      <Text>{txnChange}</Text>
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
      {!below1080 && (
        <GridRow style={{ marginTop: '40px' }}>
          <LeftGroup>
            <Panel style={{ position: 'relative' }}>
              <EthIcon src={EthLogo} />
              <PaddedGroup>
                <Column>
                  <RowFlat>
                    {formattedEthPrice && (
                      <Text fontSize={36} lineHeight={1} fontWeight={600}>
                        {formattedEthPrice}
                      </Text>
                    )}
                    {/* <Text marginLeft="10px">{liquidityChange}</Text> */}
                  </RowFlat>
                  <RowFlat style={{ marginTop: '10px' }}>
                    <Hint>ETH Uniprice</Hint>
                  </RowFlat>
                </Column>
              </PaddedGroup>
            </Panel>
            <Panel>
              <SpacedColumn>
                <Column>
                  <RowFlat>
                    <Text fontSize={36} lineHeight={1} fontWeight={600}>
                      {liquidity}
                    </Text>
                    <Text marginLeft="10px">{liquidityChange && liquidityChange}</Text>
                  </RowFlat>
                  <RowFlat style={{ marginTop: '10px' }}>
                    <Hint>Total Liquidity</Hint>
                  </RowFlat>
                </Column>
                <Column>
                  <RowFlat>
                    <Text fontSize={36} lineHeight={1} fontWeight={600}>
                      {volume}
                    </Text>
                    <Text marginLeft="10px">{volumeChange}</Text>
                  </RowFlat>
                  <RowFlat style={{ marginTop: '10px' }}>
                    <Hint>Volume (24hrs)</Hint>
                  </RowFlat>
                </Column>
                <Column>
                  <RowFlat>
                    <Text fontSize={36} lineHeight={1} fontWeight={600}>
                      {oneDayTxns}
                    </Text>
                    <Text marginLeft="10px">{txnChange && txnChange + '%'}</Text>
                  </RowFlat>
                  <RowFlat style={{ marginTop: '10px' }}>
                    <Hint>Transactions (24hrs)</Hint>
                  </RowFlat>
                </Column>
              </SpacedColumn>
            </Panel>
          </LeftGroup>
          <Panel style={{ height: '100%' }}>
            <ChartWrapper area="fill" rounded>
              <GlobalChart chartData={chartData} />
            </ChartWrapper>
          </Panel>
        </GridRow>
      )}
      <Panel style={{ marginTop: '6px' }}>
        <PaddedGroup>
          <ListOptions gap="10px">
            <Hover>
              <Text
                onClick={() => {
                  setTokenFilter('TOKENS')
                }}
                color={tokenFilter === 'TOKENS' ? 'black' : '#aeaeae'}
              >
                Top Tokens
              </Text>
            </Hover>
            <Hover>
              <Text
                onClick={() => {
                  setTokenFilter('PAIRS')
                }}
                color={tokenFilter === 'PAIRS' ? 'black' : '#aeaeae'}
              >
                Top Pairs
              </Text>
            </Hover>
          </ListOptions>
        </PaddedGroup>
        {allTokenData && tokenFilter === 'TOKENS' && <TopTokenList tokens={allTokenData} />}
        {allTokenData && tokenFilter === 'PAIRS' && (
          <PairList pairs={pairs && Object.keys(pairs).map(key => pairs[key])} />
        )}
      </Panel>
      <Panel style={{ marginTop: '6px' }}>
        <PaddedGroup>
          <ListOptions gap="10px">
            <Hover>
              <Text
                onClick={() => {
                  setTxFilter('ALL')
                }}
                color={txFilter !== 'ALL' ? '#aeaeae' : 'black'}
              >
                All
              </Text>
            </Hover>
            <Hover>
              <Text
                onClick={() => {
                  setTxFilter('SWAP')
                }}
                color={txFilter !== 'SWAP' ? '#aeaeae' : 'black'}
              >
                Swaps
              </Text>
            </Hover>
            <Hover>
              <Text
                onClick={() => {
                  setTxFilter('ADD')
                }}
                color={txFilter !== 'ADD' ? '#aeaeae' : 'black'}
              >
                Adds
              </Text>
            </Hover>
            <Hover>
              <Text
                onClick={() => {
                  setTxFilter('REMOVE')
                }}
                color={txFilter !== 'REMOVE' ? '#aeaeae' : 'black'}
              >
                Removes
              </Text>
            </Hover>
          </ListOptions>
        </PaddedGroup>
        <TxnList transactions={transactions} txFilter={txFilter} />
      </Panel>
    </PageWrapper>
  )
}

export default GlobalPage
