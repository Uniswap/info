import React, { useEffect } from 'react'
import { Box, Flex, Text } from 'rebass'

import Panel from '../components/Panel'
import Overview from '../components/Overview'
import TopExchanges from '../components/ExchangeTable'
import { Divider, Hint } from '../components'
import { formatNumber } from '../helpers/'

export const OverviewPage = function OverviewPage({
  totalVolumeInEth,
  totalVolumeUSD,
  totalLiquidityInEth,
  totalLiquidityUSD,
  exchangeCount,
  txCount,
  topN
}) {
  if (
    !totalVolumeInEth ||
    !totalVolumeUSD ||
    !totalLiquidityInEth ||
    !totalLiquidityUSD ||
    !exchangeCount ||
    !txCount
  ) {
    return null
  }

  // prevent weird focus scrolling
  useEffect(() => {
    requestAnimationFrame(() => {
      window.scrollTo(0, 0)
    })
  }, [])

  return (
    <Overview mx="auto">
      <Panel rounded bg="white" alignItems="center" area="totals" style={{ height: 'fit-content' }}>
        <Flex p={24} justifyContent="center" bg="alabaster">
          <Text color="grey" fontSize={14} lineHeight={1} fontWeight={700}>
            All Time Stats
          </Text>
        </Flex>
        <Box p={24}>
          <Hint color="text" fontSize={15} fontWeight={500} mb={3}>
            Total Volume ETH
          </Hint>
          <Text fontSize={20} color="uniswappink" className="-transition" lineHeight={1.4} fontWeight={500}>
            {formatNumber(Number(totalVolumeInEth).toFixed(2))} ETH
          </Text>
          <Text fontSize={15} color="uniswappink" lineHeight={4} fontWeight={500}>
            ${formatNumber(Number(totalVolumeUSD).toFixed(2))}
          </Text>
          <Divider />
        </Box>
        <Box p={24}>
          <Hint color="text" fontSize={15} fontWeight={500} mb={3}>
            Total Liquidity
          </Hint>
          <Text color="uniswappink" className="-transition" fontSize={20} lineHeight={1.4} fontWeight={500}>
            {formatNumber(Number(totalLiquidityInEth).toFixed(2))} ETH
          </Text>
          <Text color="uniswappink" fontSize={15} lineHeight={4} fontWeight={500}>
            ${formatNumber(Number(totalLiquidityUSD).toFixed(2))}
          </Text>
          <Divider />
        </Box>
        <Box p={24}>
          <Hint color="text" fontSize={15} fontWeight={500} mb={3}>
            Total Exchanges
          </Hint>
          <Text color="uniswappink" className="-transition" fontSize={20} lineHeight={4} fontWeight={500}>
            {Number(exchangeCount)}
          </Text>
          <Divider />
        </Box>
        <Box p={24}>
          <Hint color="text" fontSize={15} fontWeight={500} mb={3}>
            Total Transactions
          </Hint>
          <Text color="uniswappink" fontSize={20} lineHeight={4} fontWeight={500}>
            {formatNumber(Number(txCount))}
          </Text>
        </Box>
      </Panel>
      <Panel rounded bg="white" alignItems="center" area="exchanges">
        <Flex p={24} justifyContent="center" bg="alabaster">
          <Text color="grey" fontSize={14} lineHeight={1} fontWeight={700}>
            Exchanges Ranked By 24 Hour Volume
          </Text>
        </Flex>
        <TopExchanges topN={topN} />
      </Panel>
    </Overview>
  )
}
