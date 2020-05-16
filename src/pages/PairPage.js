import React, { useState } from 'react'
import 'feather-icons'
import styled from 'styled-components'

import { Text, Box } from 'rebass'
import Panel from '../components/Panel'
import { RowFlat, AutoRow, RowBetween, RowFixed } from '../components/Row'
import Column, { AutoColumn } from '../components/Column'
import { ButtonLight, ButtonDark } from '../components/ButtonStyled'
import PairChart from '../components/PairChart'
import Link from '../components/Link'
import { Hint } from '../components'
import TxnList from '../components/TxnList'
import Loader from '../components/Loader'

import { formattedNum } from '../helpers'
import { useColor } from '../hooks'
import { usePairData, usePairTransactions, usePairChartData } from '../contexts/PairData'
import { useCurrentCurrency } from '../contexts/Application'
import { ThemedBackground, Hover } from '../Theme'
import CopyHelper from '../components/Copy'
import { useMedia } from 'react-use'
import DoubleTokenLogo from '../components/DoubleLogo'

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-bottom: 100px;
  width: calc(100% - 80px);
  padding: 0 40px;
  overflow: scroll;

  @media screen and (max-width: 640px) {
    width: calc(100% - 40px);
    padding: 0 20px;
  }

  & > * {
    width: 100%;
    max-width: 1240px;
  }
`

const DashboardWrapper = styled.div`
  width: 100%;
`

const ListHeader = styled.div`
  font-size: 1.25rem;
  font-weight: 600;
  width: 100%;
  margin: 5rem 0 2rem 0;
`

const PanelWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  width: 100%;
  margin: 40px 0;
`

const TopPanel = styled(Panel)`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: fit-content;

  @media screen and (max-width: 64em) {
    width: 100%;
    border-radius: 0

    &:nth-of-type(3) {
      margin-bottom: 20px;
      border-radius: 0 0 1em 1em;
    }

    &:first-of-type {
      border-radius: 1em 1em 0 0;
    }
  }
`

const TokenName = styled.div`
  font-size: 1.5rem;
  font-weight: 600;
  line-height: 32px;

  @media screen and (max-width: 1080px) {
    font-size: 1.25rem;
    line-height: normal;
  }
`

const TokenDetailsLayout = styled.div`
  display: inline-grid;
  width: 100%;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
  & > :last-child {
    align-self: center;
    justify-self: end;
  }
`

const GroupedOverflow = styled.div`
  display: flex;
  align-items: flex-end;

  min-width: 0;
  max-width: 240px;
  div {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`

const ChartWrapper = styled.div`
  margin-bottom: 40px;
`
const ShadedBox = styled.div`
  background: rgba(255, 255, 255, 0.4);
  border-radius: 20px;
  padding: 20px;
`

const TopPercent = styled.div`
  align-self: flex-end;
  margin-left: 10px;
`

const Break = styled.div`
  width: 50px;
  height: 2px;
  background: black;
`

const Option = ({ onClick, active, children }) => {
  return (
    <Hover>
      <Text onClick={onClick} color={!active ? '#aeaeae' : 'black'} fontWeight={600} fontSize={24}>
        {children}
      </Text>
    </Hover>
  )
}

function PairPage({ pairAddress }) {
  const [txFilter, setTxFilter] = useState('ALL')
  const [currency] = useCurrentCurrency()
  const {
    token0,
    token1,
    reserve0,
    reserve1,
    combinedBalanceETH,
    reserveUSD,
    oneDayVolumeETH,
    oneDayVolumeUSD,
    volumeChangeUSD,
    volumeChangeETH,
    liquidityChangeUSD,
    liquidityChangeETH
  } = usePairData(pairAddress)
  const chartData = usePairChartData(pairAddress)
  const transactions = usePairTransactions(pairAddress)

  const backgroundColor = useColor(pairAddress)

  const liquidity = currency === 'ETH' ? 'Ξ ' + formattedNum(combinedBalanceETH) : '$' + formattedNum(reserveUSD)

  const liquidityChange =
    currency === 'ETH' ? formattedNum(liquidityChangeETH) + '%' : formattedNum(liquidityChangeUSD) + '%'

  const volume = currency === 'ETH' ? 'Ξ ' + formattedNum(oneDayVolumeETH) : '$' + formattedNum(oneDayVolumeUSD)

  const volumeChange = currency === 'ETH' ? formattedNum(volumeChangeETH) + '%' : formattedNum(volumeChangeUSD) + '%'

  const below1080 = useMedia('(max-width: 1080px)')

  return (
    <PageWrapper>
      <ThemedBackground backgroundColor={backgroundColor} />
      {below1080 && (
        <ShadedBox style={{ width: '100%' }}>
          <AutoColumn gap="40px">
            <RowBetween>
              {token0 && token1 && (
                <DoubleTokenLogo a0={token0?.id || ''} a1={token1?.id || ''} size={32} margin={true} />
              )}
              <RowFixed justify="flex-end">
                <ButtonLight color={backgroundColor}>+ Add Liquidity</ButtonLight>
              </RowFixed>
            </RowBetween>
            <TokenName>{token0 && token1 ? token0.symbol + '-' + token1.symbol + ' Pool' : ''}</TokenName>
            <AutoColumn gap="10px">
              <RowFlat style={{ lineHeight: '22px' }}>
                <Text fontSize={24} fontWeight={600}>
                  {volume}
                </Text>
                <TopPercent>{volumeChange}</TopPercent>
              </RowFlat>
              <Hint>24hr Volume</Hint>
            </AutoColumn>
            <AutoColumn gap="10px">
              <RowFlat style={{ lineHeight: '22px' }}>
                <Text fontSize={24} fontWeight={600}>
                  {liquidity}
                </Text>
                <TopPercent>{liquidityChange}</TopPercent>
              </RowFlat>
              <Hint>Total Liquidity</Hint>
            </AutoColumn>
            <AutoColumn gap="10px">
              <RowFlat style={{ lineHeight: '22px' }}>
                <Text fontSize={24} fontWeight={600}>
                  {reserve0 ? formattedNum(reserve0) : ''}
                </Text>
              </RowFlat>
              <Hint>{token0 ? token0.symbol + ' balance' : ''}</Hint>
            </AutoColumn>
            <AutoColumn gap="10px">
              <RowFlat style={{ lineHeight: '22px' }}>
                <Text fontSize={24} fontWeight={600}>
                  {reserve1 ? formattedNum(reserve1) : ''}
                </Text>
              </RowFlat>
              <Hint>{token1 ? token1.symbol + ' balance' : ''}</Hint>
            </AutoColumn>
            <Break />
            <AutoRow gap="10px">
              <AutoColumn gap="20px">
                <RowFixed>
                  <Text fontSize={16} fontWeight="500">
                    {pairAddress.slice(0, 6) + '...' + pairAddress.slice(38, 42)}
                  </Text>
                  <CopyHelper toCopy={pairAddress} />
                </RowFixed>
                <Text>Pool Address</Text>
              </AutoColumn>
              <AutoColumn gap="20px">
                <RowFixed>
                  <Text fontSize={16} fontWeight="500">
                    {token0 && token0?.id.slice(0, 6) + '...' + token0?.id.slice(38, 42)}
                  </Text>
                  <CopyHelper toCopy={token0?.id} />
                </RowFixed>
                <Text>{token0 && token0.symbol + ' address'}</Text>
              </AutoColumn>
              <AutoColumn gap="20px">
                <RowFixed>
                  <Text fontSize={16} fontWeight="500">
                    {token1 && token1?.id.slice(0, 6) + '...' + token1?.id.slice(38, 42)}
                  </Text>
                  <CopyHelper toCopy={token1?.id} />
                </RowFixed>
                <Text>{token1 && token1.symbol + ' address'}</Text>
              </AutoColumn>
            </AutoRow>
          </AutoColumn>
        </ShadedBox>
      )}
      {!below1080 && (
        <RowBetween mb={20} mt={20}>
          <RowFixed>
            <DoubleTokenLogo a0={token0?.id || ''} a1={token1?.id || ''} size={32} margin={true} />
            <RowFlat style={{ marginLeft: '10px' }}>
              <TokenName>{token0 && token1 ? token0.symbol + '-' + token1.symbol + ' Pool' : ''}</TokenName>
            </RowFlat>
          </RowFixed>
          <RowFixed justify="flex-end">
            <ButtonLight color={backgroundColor}>+ Add Liquidity</ButtonLight>
            <ButtonDark ml={10} color={backgroundColor}>
              Trade
            </ButtonDark>
          </RowFixed>
        </RowBetween>
      )}
      <DashboardWrapper>
        <ChartWrapper>
          <PairChart chartData={chartData} color={backgroundColor} />
        </ChartWrapper>
        {!below1080 && (
          <PanelWrapper>
            <TopPanel rounded color="black" p={24}>
              <Column>
                <RowFlat>
                  <Text fontSize={24} lineHeight={1} fontWeight={600}>
                    {volume}
                  </Text>
                  <Text marginLeft={10}>{volumeChange}</Text>
                </RowFlat>
                <RowFlat style={{ marginTop: '10px' }}>
                  <Hint>Volume (24hrs)</Hint>
                </RowFlat>
              </Column>
            </TopPanel>
            <TopPanel rounded color="black" p={24}>
              <Column>
                <RowFlat>
                  <Text fontSize={24} lineHeight={1} fontWeight={600}>
                    {liquidity}
                  </Text>
                  <Text marginLeft={10}>{liquidityChange}</Text>
                </RowFlat>
                <RowFlat style={{ marginTop: '10px' }}>
                  <Hint>Total Liquidity</Hint>
                </RowFlat>
              </Column>
            </TopPanel>
            <TopPanel rounded color="black" p={24}>
              <Column>
                <RowFlat>
                  <Text fontSize={24} lineHeight={1} fontWeight={600}>
                    {reserve0 ? formattedNum(reserve0) : ''}
                  </Text>
                </RowFlat>
                <RowFlat style={{ marginTop: '10px' }}>
                  <Hint>{token0 ? token0.symbol + ' balance' : ''}</Hint>
                </RowFlat>
              </Column>
            </TopPanel>
            <TopPanel rounded color="black" p={24}>
              <Column>
                <RowFlat>
                  <Text fontSize={24} lineHeight={1} fontWeight={600}>
                    {reserve1 ? formattedNum(reserve1) : ''}
                  </Text>
                </RowFlat>
                <RowFlat style={{ marginTop: '10px' }}>
                  <Hint>{token1 ? token1.symbol + ' balance' : ''}</Hint>
                </RowFlat>
              </Column>
            </TopPanel>
          </PanelWrapper>
        )}
        {!below1080 && (
          <>
            <ListHeader>Pool Details</ListHeader>
            <Panel
              rounded
              style={{
                border: '1px solid rgba(43, 43, 43, 0.05)',
                marginBottom: '60px'
              }}
              p={20}
            >
              <TokenDetailsLayout>
                <Column>
                  <Text color="#888D9B">Pool Name</Text>
                  <GroupedOverflow>
                    <Text style={{ marginTop: '1rem' }} fontSize={18} fontWeight="500">
                      {token0 && token1 ? token0.symbol + '-' + token1.symbol + ' Pool' : ''}
                    </Text>
                  </GroupedOverflow>
                </Column>
                <Column>
                  <Text color="#888D9B">Pool Address</Text>
                  <GroupedOverflow>
                    <Text style={{ marginTop: '1rem' }} fontSize={18} fontWeight="500">
                      {pairAddress.slice(0, 6) + '...' + pairAddress.slice(38, 42)}
                    </Text>
                    <CopyHelper toCopy={pairAddress} />
                  </GroupedOverflow>
                </Column>
                <Column>
                  <Text color="#888D9B">{token0 && token0.symbol + ' address'}</Text>
                  <GroupedOverflow>
                    <Text style={{ marginTop: '1rem' }} fontSize={18} fontWeight="500">
                      {token0 && token0.id.slice(0, 6) + '...' + token0.id.slice(38, 42)}
                    </Text>
                    <CopyHelper toCopy={token0?.id} />
                  </GroupedOverflow>
                </Column>
                <Column>
                  <Text color="#888D9B">{token1 && token1.symbol + ' address'}</Text>
                  <GroupedOverflow>
                    <Text style={{ marginTop: '1rem' }} fontSize={18} fontWeight="500">
                      {token1 && token1.id.slice(0, 6) + '...' + token1.id.slice(38, 42)}
                    </Text>
                    <CopyHelper toCopy={token1?.id} />
                  </GroupedOverflow>
                </Column>
                <ButtonLight color={backgroundColor}>
                  <Link external href={'https://etherscan.io/address/' + pairAddress}>
                    View on Etherscan ↗
                  </Link>
                </ButtonLight>
              </TokenDetailsLayout>
            </Panel>
          </>
        )}
        <Box mb={20}>
          <AutoRow gap="10px" pl={4}>
            <Option
              onClick={() => {
                setTxFilter('ALL')
              }}
              active={txFilter === 'ALL'}
            >
              All
            </Option>
            <Option
              onClick={() => {
                setTxFilter('SWAPS')
              }}
              active={txFilter === 'SWAPS'}
            >
              Swaps
            </Option>
            <Option
              onClick={() => {
                setTxFilter('ADDS')
              }}
              active={txFilter === 'ADDS'}
            >
              Adds
            </Option>
            <Option
              onClick={() => {
                setTxFilter('REMOVES')
              }}
              active={txFilter === 'REMOVES'}
            >
              Removes
            </Option>
          </AutoRow>
        </Box>
        <Panel
          rounded
          style={{
            border: '1px solid rgba(43, 43, 43, 0.05)'
          }}
        >
          {transactions ? <TxnList transactions={transactions} txFilter={txFilter} /> : <Loader />}
        </Panel>
      </DashboardWrapper>
    </PageWrapper>
  )
}

export default PairPage
