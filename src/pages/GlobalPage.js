import React from 'react'
import 'feather-icons'
import { Text } from 'rebass'
import styled from 'styled-components'

import { RowBetween } from '../components/Row'
import { AutoColumn } from '../components/Column'

import { TYPE, Link } from '../Theme'
import { formattedNum, formattedPercent } from '../helpers'
import { useGlobalData } from '../contexts/GlobalData'

import { useMedia } from 'react-use'
import { useV1Data } from '../contexts/V1Data'

import PieChart from '../components/PieChart'
import { useFetchProtocolData } from '../contexts/v3Data'

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: calc(100% - 20px);
  padding-top: 40px;

  overflow: scroll;
  & > * {
    width: 100%;
    max-width: 1000px;
  }

  @media screen and (max-width: 1080px) {
    width: calc(100% - 40px);
    padding: 0 20px;
  }
`

const TopGroup = styled.div`
  grid-template-columns: 1fr 1fr 1fr;
  column-gap: 6px;
  display: inline-grid;
  width: 100%;
  align-items: start;

  @media only screen and (max-width: 1080px) {
    column-gap: 6px;
    display: flex;
    flex-direction: column;
    width: 100%;
    grid-template-rows: auto;
    align-items: start;
  }
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

  @media only screen and (max-width: 600px) {
    max-height: 100px;
  }
`

const OverviewGroup = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;

  @media only screen and (max-width: 1080px) {
    flex-direction: column;
    height: 340px;
  }
`

function GlobalPage() {
  const {
    totalLiquidityUSD,
    oneDayVolumeUSD,
    volumeChangeUSD,
    liquidityChangeUSD,
    oneDayTxns,
    txnChange
  } = useGlobalData()

  const liquidity = totalLiquidityUSD ? formattedNum(totalLiquidityUSD, true) : '-'

  const liquidityChange = liquidityChangeUSD ? formattedPercent(liquidityChangeUSD) : ''

  const volume = oneDayVolumeUSD ? formattedNum(oneDayVolumeUSD, true) : '-'

  const volumeChange = volumeChangeUSD ? formattedPercent(volumeChangeUSD) : ''

  let txnChangeFormatted = txnChange ? formattedPercent(txnChange) : ''

  const below1080 = useMedia('(max-width: 1080px)')

  const v1Data = useV1Data()

  const { data: v3Data } = useFetchProtocolData()

  return (
    <PageWrapper>
      <AutoColumn gap="60px">
        <AutoColumn gap="20px">
          <Text fontSize={24} fontWeight={600}>
            Combined Protocol Stats
          </Text>
          <OverviewGroup>
            <AutoColumn gap="20px" style={{ width: below1080 ? '100%' : '40%' }}>
              <Panel>
                <AutoColumn gap="20px">
                  <RowBetween>
                    <TYPE.main>Total Liquidity</TYPE.main>
                    <div />
                  </RowBetween>
                  <RowBetween align="flex-end">
                    <TYPE.main fontSize={'1.5rem'} lineHeight={1} fontWeight={600}>
                      {totalLiquidityUSD && v1Data?.liquidityUsd && v3Data
                        ? formattedNum(
                            parseFloat(totalLiquidityUSD) + parseFloat(v1Data.liquidityUsd) + parseFloat(v3Data.tvlUSD),
                            true
                          )
                        : '-'}
                    </TYPE.main>
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
                      {oneDayVolumeUSD && v1Data?.dailyVolumeUSD && v3Data
                        ? formattedNum(
                            parseFloat(oneDayVolumeUSD) +
                              parseFloat(v1Data.dailyVolumeUSD) +
                              parseFloat(v3Data.volumeUSD),
                            true
                          )
                        : '-'}
                    </TYPE.main>
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
                      {oneDayTxns && v1Data?.txCount && v3Data
                        ? formattedNum(parseFloat(oneDayTxns) + parseFloat(v1Data.txCount) + parseFloat(v3Data.txCount))
                        : '-'}
                    </TYPE.main>
                  </RowBetween>
                </AutoColumn>
              </Panel>
            </AutoColumn>
            {!below1080 && (
              <Panel style={{ width: below1080 ? '100%' : '50%', marginTop: below1080 ? '40px' : 0 }}>
                <PieChart
                  v1={v1Data && parseFloat(v1Data.liquidityUsd)}
                  v2={parseFloat(totalLiquidityUSD)}
                  v3={v3Data?.tvlUSD ?? 0}
                />
              </Panel>
            )}
          </OverviewGroup>
        </AutoColumn>
        <AutoColumn gap="20px">
          <RowBetween>
            <Text fontSize={24} fontWeight={600}>
              24H Volume / TVL
            </Text>
          </RowBetween>
          <TopGroup>
            <Panel style={{ marginBottom: below1080 ? '20px' : 0 }}>
              <AutoColumn gap="20px">
                <RowBetween>
                  <TYPE.main>V3</TYPE.main>
                  <div />
                </RowBetween>
                <RowBetween align="flex-end">
                  <TYPE.main fontSize={'1.5rem'} lineHeight={1} fontWeight={600}>
                    {v3Data ? formattedPercent((v3Data.volumeUSD / v3Data.tvlUSD) * 100) : '-'}
                  </TYPE.main>
                </RowBetween>
              </AutoColumn>
            </Panel>
            <Panel style={{ marginBottom: below1080 ? '20px' : 0 }}>
              <AutoColumn gap="20px">
                <RowBetween>
                  <TYPE.main>V2</TYPE.main>
                  <div />
                </RowBetween>
                <RowBetween align="flex-end">
                  <TYPE.main fontSize={'1.5rem'} lineHeight={1} fontWeight={600}>
                    {totalLiquidityUSD && oneDayVolumeUSD
                      ? formattedPercent((oneDayVolumeUSD / totalLiquidityUSD) * 100)
                      : '-'}
                  </TYPE.main>
                </RowBetween>
              </AutoColumn>
            </Panel>
            <Panel style={{ marginBottom: below1080 ? '20px' : 0 }}>
              <AutoColumn gap="20px">
                <RowBetween>
                  <TYPE.main>V1</TYPE.main>
                  <div />
                </RowBetween>
                <RowBetween align="flex-end">
                  <TYPE.main fontSize={'1.5rem'} lineHeight={1} fontWeight={600}>
                    {v1Data ? formattedPercent((v1Data.dailyVolumeUSD / v1Data.liquidityUsd) * 100) : '-'}
                  </TYPE.main>
                </RowBetween>
              </AutoColumn>
            </Panel>
          </TopGroup>
        </AutoColumn>
        <AutoColumn gap="20px">
          <RowBetween>
            <Text fontSize={24} fontWeight={600}>
              V3
            </Text>
            <Link href="https://www.uniswap.info">
              <TYPE.pink fontSize={20} fontWeight={500}>
                View More
              </TYPE.pink>
            </Link>
          </RowBetween>
          <TopGroup>
            <Panel style={{ marginBottom: below1080 ? '20px' : 0 }}>
              <AutoColumn gap="20px">
                <RowBetween>
                  <TYPE.main>Total Value Locked</TYPE.main>
                  <div />
                </RowBetween>
                <RowBetween align="flex-end">
                  <TYPE.main fontSize={'1.5rem'} lineHeight={1} fontWeight={600}>
                    {v3Data?.tvlUSD ? formattedNum(v3Data.tvlUSD, true) : '-'}
                  </TYPE.main>
                  <TYPE.main> {v3Data?.tvlUSDChange ? formattedPercent(v3Data?.tvlUSDChange) : '-'}</TYPE.main>
                </RowBetween>
              </AutoColumn>
            </Panel>
            <Panel style={{ marginBottom: below1080 ? '20px' : 0 }}>
              <AutoColumn gap="20px">
                <RowBetween>
                  <TYPE.main>Volume (24hrs)</TYPE.main>
                  <div />
                </RowBetween>
                <RowBetween align="flex-end">
                  <TYPE.main fontSize={'1.5rem'} lineHeight={1} fontWeight={600}>
                    {v3Data?.volumeUSD ? formattedNum(v3Data.volumeUSD, true) : '-'}
                  </TYPE.main>
                  <TYPE.main>{v3Data?.volumeUSDChange ? formattedPercent(v3Data?.volumeUSDChange) : '-'}</TYPE.main>
                </RowBetween>
              </AutoColumn>
            </Panel>
            <Panel style={{ marginBottom: below1080 ? '20px' : 0 }}>
              <AutoColumn gap="20px">
                <RowBetween>
                  <TYPE.main>Transactions (24hrs)</TYPE.main>
                  <div />
                </RowBetween>
                <RowBetween align="flex-end">
                  <TYPE.main fontSize={'1.5rem'} lineHeight={1} fontWeight={600}>
                    {v3Data?.txCount ? formattedNum(v3Data.txCount) : '-'}
                  </TYPE.main>
                  <TYPE.main>{v3Data?.txCountChange ? formattedPercent(v3Data?.txCountChange) : '-'}</TYPE.main>
                </RowBetween>
              </AutoColumn>
            </Panel>
          </TopGroup>
        </AutoColumn>
        <AutoColumn gap="20px">
          <RowBetween>
            <Text fontSize={24} fontWeight={600}>
              V2
            </Text>
            <Link href="https://www.uniswap.info">
              <TYPE.pink fontSize={20} fontWeight={500}>
                View More
              </TYPE.pink>
            </Link>
          </RowBetween>
          <TopGroup>
            <Panel style={{ marginBottom: below1080 ? '20px' : 0 }}>
              <AutoColumn gap="20px">
                <RowBetween>
                  <TYPE.main>Total Value Locked</TYPE.main>
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
            <Panel style={{ marginBottom: below1080 ? '20px' : 0 }}>
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
            <Panel style={{ marginBottom: below1080 ? '20px' : 0 }}>
              <AutoColumn gap="20px">
                <RowBetween>
                  <TYPE.main>Transactions (24hrs)</TYPE.main>
                  <div />
                </RowBetween>
                <RowBetween align="flex-end">
                  <TYPE.main fontSize={'1.5rem'} lineHeight={1} fontWeight={600}>
                    {formattedNum(oneDayTxns)}
                  </TYPE.main>
                  <TYPE.main>{txnChangeFormatted && txnChangeFormatted}</TYPE.main>
                </RowBetween>
              </AutoColumn>
            </Panel>
          </TopGroup>
        </AutoColumn>
        <AutoColumn gap="20px">
          <RowBetween>
            <Text fontSize={24} fontWeight={600}>
              V1
            </Text>
            <Link href="https://www.v1.uniswap.info">
              <TYPE.pink fontSize={20} fontWeight={500}>
                View More
              </TYPE.pink>
            </Link>
          </RowBetween>
          <TopGroup>
            <Panel style={{ marginBottom: below1080 ? '20px' : 0 }}>
              <AutoColumn gap="20px">
                <RowBetween>
                  <TYPE.main>Total Value Locked</TYPE.main>
                  <div />
                </RowBetween>
                <RowBetween align="flex-end">
                  <TYPE.main fontSize={'1.5rem'} lineHeight={1} fontWeight={600}>
                    {v1Data?.liquidityUsd && formattedNum(v1Data.liquidityUsd, true)}
                  </TYPE.main>
                  <TYPE.main>
                    {v1Data?.liquidityPercentChangeUSD && formattedPercent(v1Data.liquidityPercentChangeUSD)}
                  </TYPE.main>
                </RowBetween>
              </AutoColumn>
            </Panel>
            <Panel style={{ marginBottom: below1080 ? '20px' : 0 }}>
              <AutoColumn gap="20px">
                <RowBetween>
                  <TYPE.main>Volume (24hrs)</TYPE.main>
                  <div />
                </RowBetween>
                <RowBetween align="flex-end">
                  <TYPE.main fontSize={'1.5rem'} lineHeight={1} fontWeight={600}>
                    {v1Data?.dailyVolumeUSD && formattedNum(v1Data.dailyVolumeUSD, true)}
                  </TYPE.main>
                  <TYPE.main>
                    {v1Data?.volumePercentChangeUSD && formattedPercent(v1Data.volumePercentChangeUSD)}
                  </TYPE.main>
                </RowBetween>
              </AutoColumn>
            </Panel>
            <Panel style={{ marginBottom: below1080 ? '20px' : 0 }}>
              <AutoColumn gap="20px">
                <RowBetween>
                  <TYPE.main>Transactions (24hrs)</TYPE.main>
                  <div />
                </RowBetween>
                <RowBetween align="flex-end">
                  <TYPE.main fontSize={'1.5rem'} lineHeight={1} fontWeight={600}>
                    {v1Data?.txCount && formattedNum(v1Data.txCount)}
                  </TYPE.main>
                  <TYPE.main>{v1Data?.txCountPercentChange && formattedPercent(v1Data.txCountPercentChange)}</TYPE.main>
                </RowBetween>
              </AutoColumn>
            </Panel>
          </TopGroup>
        </AutoColumn>
      </AutoColumn>
    </PageWrapper>
  )
}

export default GlobalPage
