import React from 'react'
import 'feather-icons'
import { Text } from 'rebass'
import styled from 'styled-components'

import { RowBetween } from '../components/Row'
import { AutoColumn } from '../components/Column'

import { TYPE } from '../Theme'
import { formattedNum, formattedPercent } from '../helpers'
import { useGlobalData } from '../contexts/GlobalData'

import { useMedia } from 'react-use'
import { useV1Data } from '../contexts/V1Data'

import PieChart from '../components/PieChart'

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

const TopGroup = styled.div`
  grid-template-columns: 1fr 1fr 1fr;
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

  return (
    <PageWrapper>
      <ThemedBackground />
      {!below1080 && ( // desktop
        <AutoColumn gap="60px">
          <AutoColumn gap="20px">
            <Text fontSize={24} fontWeight={600}>
              Combined Protocol Stats
            </Text>
            <RowBetween>
              <AutoColumn gap="20px" style={{ width: '40%' }}>
                <Panel>
                  <AutoColumn gap="20px">
                    <RowBetween>
                      <TYPE.main>Total Liquidity</TYPE.main>
                      <div />
                    </RowBetween>
                    <RowBetween align="flex-end">
                      <TYPE.main fontSize={'1.5rem'} lineHeight={1} fontWeight={600}>
                        {totalLiquidityUSD &&
                          v1Data?.liquidityUsd &&
                          formattedNum(parseFloat(totalLiquidityUSD) + parseFloat(v1Data.liquidityUsd), true)}
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
                        {oneDayVolumeUSD &&
                          v1Data?.dailyVolumeUSD &&
                          formattedNum(parseFloat(oneDayVolumeUSD) + parseFloat(v1Data.dailyVolumeUSD), true)}
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
                        {oneDayTxns &&
                          v1Data?.txCount &&
                          formattedNum(parseFloat(oneDayTxns) + parseFloat(v1Data.txCount))}
                      </TYPE.main>
                    </RowBetween>
                  </AutoColumn>
                </Panel>
              </AutoColumn>
              <Panel style={{ width: '50%' }}>
                <PieChart v1={v1Data && parseFloat(v1Data.liquidityUsd)} v2={parseFloat(totalLiquidityUSD)} />
              </Panel>
            </RowBetween>
          </AutoColumn>
          <AutoColumn gap="20px">
            <Text fontSize={24} fontWeight={600}>
              V2 Stats
            </Text>
            <TopGroup>
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
                    <TYPE.main>Transactions (24hrs)</TYPE.main>
                    <div />
                  </RowBetween>
                  <RowBetween align="flex-end">
                    <TYPE.main fontSize={'1.5rem'} lineHeight={1} fontWeight={600}>
                      {oneDayTxns}
                    </TYPE.main>
                    <TYPE.main>{txnChangeFormatted && txnChangeFormatted}</TYPE.main>
                  </RowBetween>
                </AutoColumn>
              </Panel>
            </TopGroup>
          </AutoColumn>
          <AutoColumn gap="20px">
            <Text fontSize={24} fontWeight={600}>
              V1 Stats
            </Text>
            <TopGroup>
              <Panel>
                <AutoColumn gap="20px">
                  <RowBetween>
                    <TYPE.main>Total Liquidity</TYPE.main>
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
              <Panel>
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
              <Panel>
                <AutoColumn gap="20px">
                  <RowBetween>
                    <TYPE.main>Transactions (24hrs)</TYPE.main>
                    <div />
                  </RowBetween>
                  <RowBetween align="flex-end">
                    <TYPE.main fontSize={'1.5rem'} lineHeight={1} fontWeight={600}>
                      {v1Data?.txCount && formattedNum(v1Data.txCount)}
                    </TYPE.main>
                    <TYPE.main>
                      {v1Data?.txCountPercentChange && formattedPercent(v1Data.txCountPercentChange)}
                    </TYPE.main>
                  </RowBetween>
                </AutoColumn>
              </Panel>
            </TopGroup>
          </AutoColumn>
        </AutoColumn>
      )}
    </PageWrapper>
  )
}

export default GlobalPage
