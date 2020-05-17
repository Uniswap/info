import React from 'react'
import 'feather-icons'
import { Box } from 'rebass'
import styled from 'styled-components'

import { RowBetween } from '../components/Row'
import { AutoColumn } from '../components/Column'

import GlobalChart from '../components/GlobalChart'
import { TYPE } from '../Theme'
import { formattedNum, formattedPercent } from '../helpers'
import { useGlobalData, useEthPrice, useGlobalChartData } from '../contexts/GlobalData'

import { useMedia } from 'react-use'
import TokenLogo from '../components/TokenLogo'

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

  const chartData = useGlobalChartData()

  const ethPrice = useEthPrice()
  const formattedEthPrice = ethPrice ? formattedNum(ethPrice, true) : '-'

  const liquidity = totalLiquidityUSD ? formattedNum(totalLiquidityUSD, true) : '-'

  const liquidityChange = liquidityChangeUSD ? formattedPercent(liquidityChangeUSD) : ''

  const volume = oneDayVolumeUSD ? formattedNum(oneDayVolumeUSD, true) : '-'

  const volumeChange = volumeChangeUSD ? formattedPercent(volumeChangeUSD) : ''

  let txnChangeFormatted = txnChange ? formattedPercent(txnChange) : ''

  const below1080 = useMedia('(max-width: 1080px)')

  return (
    <PageWrapper>
      <ThemedBackground />
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
                        {!!oneDayTxns ? oneDayTxns : '-'}
                      </TYPE.main>
                      <TYPE.main>{txnChangeFormatted && txnChangeFormatted}</TYPE.main>
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
      )}
    </PageWrapper>
  )
}

export default GlobalPage
