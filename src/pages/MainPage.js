import React from 'react'
import { Box, Flex, Text } from 'rebass'
import styled from 'styled-components'

import FourByFour from '../components/FourByFour'
import Panel from '../components/Panel'
import Dashboard from '../components/Dashboard'
import Select from '../components/Select'
import Footer from '../components/Footer'
import TransactionsList from '../components/TransactionsList'
import Chart from '../components/Chart'
import Loader from '../components/Loader'
import { Divider, Hint, Address } from '../components'

const timeframeOptions = [
  { value: '1week', label: '1 week' },
  { value: '1month', label: '1 month' },
  { value: '3months', label: '3 months' },
  { value: 'all', label: 'All time' }
]

const SmallText = styled.span`
  font-size: 0.6em;
`

export const MainPage = function({
  exchangeAddress,
  symbol,
  tradeVolume,
  percentChange,
  userNumPoolTokens,
  userPoolPercent,
  erc20Liquidity,
  ethLiquidity,
  price,
  invPrice,
  data,
  tokenAddress,
  transactions,
  updateTimeframe
}) {
  return (
    <>
      <Dashboard mx="auto" px={[0, 3]}>
        <Box style={{ gridArea: 'volume' }}>
          <Panel grouped rounded color="white" bg="jaguar" p={24}>
            <FourByFour
              gap={24}
              topLeft={<Hint color="textLightDim">{symbol} Volume</Hint>}
              bottomLeft={
                <Text fontSize={24} lineHeight={1.4} fontWeight={500}>
                  {parseFloat(tradeVolume).toLocaleString('en')} <SmallText>ETH</SmallText>
                </Text>
              }
              topRight={<Hint color="textLightDim">24h</Hint>}
              bottomRight={
                <Text fontSize={20} lineHeight={1.4}>
                  {percentChange}%
                </Text>
              }
            />
          </Panel>
          <Panel grouped rounded color="white" bg="token" p={24} className="-transition">
            <FourByFour
              topLeft={<Hint color="textLight">Your share</Hint>}
              bottomLeft={
                <Text fontSize={20} lineHeight={1.4} fontWeight={500}>
                  {userNumPoolTokens} <SmallText>Pool Tokens</SmallText>
                </Text>
              }
              bottomRight={
                <Text fontSize={20} lineHeight={1.4}>
                  {userPoolPercent}%
                </Text>
              }
            />
          </Panel>
        </Box>

        <Panel rounded bg="white" area="liquidity">
          <FourByFour
            p={24}
            topLeft={<Hint color="text">{symbol} Liquidity</Hint>}
            bottomLeft={
              <Text fontSize={20} color="token" className="-transition" lineHeight={1.4} fontWeight={500}>
                {(erc20Liquidity && parseFloat(erc20Liquidity).toLocaleString('en')) || `0.00`}{' '}
                <SmallText>{symbol}</SmallText>
              </Text>
            }
            topRight={<Hint color="text">ETH Liquidity</Hint>}
            bottomRight={
              <Text fontSize={20} color="uniswappink" lineHeight={1.4} fontWeight={500}>
                {(ethLiquidity && parseFloat(ethLiquidity).toLocaleString('en')) || `0.00`} <SmallText>ETH</SmallText>
              </Text>
            }
          />
          <Divider />
          <FourByFour
            p={24}
            topLeft={<Hint color="text">{symbol} / ETH</Hint>}
            bottomLeft={
              <Text color="token" className="-transition" fontSize={20} lineHeight={1.4} fontWeight={500}>
                {Number(price).toFixed(2)}
              </Text>
            }
            topRight={<Hint color="text">ETH / {symbol}</Hint>}
            bottomRight={
              <Text color="uniswappink" fontSize={20} lineHeight={1.4} fontWeight={500}>
                {Number(invPrice).toFixed(4)}
              </Text>
            }
          />
        </Panel>

        <Panel rounded bg="white" area="statistics">
          <Box p={24}>
            <Flex alignItems="center" justifyContent="space-between">
              <Text>Pool Statistics</Text>
              <Box width={144}>
                <Select
                  placeholder="Timeframe"
                  options={timeframeOptions}
                  defaultValue={timeframeOptions[0]}
                  onChange={select => {
                    updateTimeframe(select.value)
                  }}
                />
              </Box>
            </Flex>
          </Box>
          <Divider />

          <Box p={24}>{data && data.length > 0 ? <Chart symbol={symbol} data={data} /> : <Loader />}</Box>
        </Panel>

        <Panel rounded bg="white" area="exchange">
          <Box p={24}>
            <Hint color="textSubtext" mb={3}>
              Exchange Address
            </Hint>
            <Address address={exchangeAddress} />
          </Box>

          <Box p={24}>
            <Hint color="textSubtext" mb={3}>
              Token Address
            </Hint>
            <Address address={tokenAddress} />
          </Box>
        </Panel>

        <Panel rounded bg="white" area="transactions">
          <Flex p={24} justifyContent="space-between">
            <Text color="text">Latest Transactions</Text>
            <Text>↓</Text>
          </Flex>
          <Divider />

          {transactions && transactions.length > 0 ? (
            <TransactionsList transactions={transactions} tokenSymbol={symbol} />
          ) : (
            <Loader />
          )}
        </Panel>
      </Dashboard>
      <Footer />
    </>
  )
}
