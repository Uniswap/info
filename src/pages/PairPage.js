import React, { useState } from 'react'
import 'feather-icons'
import styled from 'styled-components'

import { Text, Flex } from 'rebass'
import Panel from '../components/Panel'
import TokenLogo from '../components/TokenLogo'
import { RowFlat, AutoRow, RowBetween, RowFixed } from '../components/Row'
import Column from '../components/Column'
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

const PageWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  padding-bottom: 100px;

  @media screen and (min-width: 64em) {
    max-width: 1240px;
  }
`

const DashboardWrapper = styled.div`
  width: 100%;
`

const ListHeader = styled.div`
  font-size: 24px;
  font-weight: 600;
  width: 100%;
  margin: 5rem 0 2rem 0;
`

const ListOptions = styled(Flex)`
  flex-direction: row;
  height: 40px
  justify-content: space-between;
  align-items; center;
  width: 100%;
  margin: 2rem 0;
  font-size: 20px;
  font-weight: 600;

  @media screen and (max-width: 64em) {
    display: none;
  }
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
  font-size: 36px;
  font-weight: 600;
  line-height: 32px;

  @media screen and (max-width: 1080px) {
    font-size: 24px;
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

  return (
    <PageWrapper>
      <ThemedBackground backgroundColor={backgroundColor} />
      <RowBetween mb={20} mt={20}>
        <RowFixed>
          <TokenLogo address={'0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'} size="32px" />
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
      <DashboardWrapper>
        <ChartWrapper>
          <PairChart chartData={chartData} color={backgroundColor} />
        </ChartWrapper>
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
              <Text color="#888D9B">Address</Text>
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
                <CopyHelper toCopy={token0?.address} />
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
        <ListOptions>
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
        </ListOptions>
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
