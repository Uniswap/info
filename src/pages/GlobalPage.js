import React, { useState, useEffect } from 'react'
import 'feather-icons'
import { Text } from 'rebass'
import styled from 'styled-components'

import { RowFlat, AutoRow } from '../components/Row'
import Column from '../components/Column'
import { Hint } from '../components'
import PairList from '../components/PairList'
import TopTokenList from '../components/TopTokenList'
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

const PageWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-bottom: 100px;

  @media screen and (min-width: 64em) {
    & > * {
      width: 100%;
      max-width: 1240px;
    }
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

  @media screen and (max-width: 64em) {
    display: none;
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
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  border-radius: 20px;
  height: 100%;
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
  const formattedEthPrice = formattedNum(ethPrice, true)

  const [, setColor] = useColor()

  const liquidity = currency === 'ETH' ? formattedNum(totalLiquidityETH) : formattedNum(totalLiquidityUSD, true)

  const liquidityChange =
    currency === 'ETH' ? formattedNum(liquidityChangeETH) + '%' : formattedNum(liquidityChangeUSD) + '%'

  const volume = currency === 'ETH' ? formattedNum(oneDayVolumeETH, true) : formattedNum(oneDayVolumeUSD, true)

  const volumeChange = currency === 'ETH' ? formattedNum(volumeChangeETH) + '%' : formattedNum(volumeChangeUSD) + '%'

  useEffect(() => {
    setColor('#FE6DDE')
  }, [setColor])

  return (
    <PageWrapper>
      <ThemedBackground />
      <Search />
      <GridRow style={{ marginTop: '40px' }}>
        <LeftGroup>
          <Panel style={{ position: 'relative' }}>
            <EthIcon src={EthLogo} />
            <PaddedGroup>
              <Column>
                <RowFlat>
                  <Text fontSize={36} lineHeight={1} fontWeight={600}>
                    {formattedEthPrice}
                  </Text>
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
                  <Text marginLeft="10px">{liquidityChange}</Text>
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
                  <Text marginLeft="10px">{txnChange}%</Text>
                </RowFlat>
                <RowFlat style={{ marginTop: '10px' }}>
                  <Hint>Transactions (24hrs)</Hint>
                </RowFlat>
              </Column>
            </SpacedColumn>
          </Panel>
        </LeftGroup>
        <Panel>
          <ChartWrapper area="fill" rounded>
            <GlobalChart chartData={chartData} />
          </ChartWrapper>
        </Panel>
      </GridRow>
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
                Add
              </Text>
            </Hover>
            <Hover>
              <Text
                onClick={() => {
                  setTxFilter('REMOVE')
                }}
                color={txFilter !== 'REMOVE' ? '#aeaeae' : 'black'}
              >
                Remove
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
