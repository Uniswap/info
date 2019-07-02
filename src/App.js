import React, { Component, useEffect } from 'react'
import styled from 'styled-components'
import { Box, Flex, Text } from 'rebass'
import { ApolloProvider } from 'react-apollo'
import { Router, Link } from '@reach/router'

import { client } from './apollo/client'
import Wrapper from './components/Theme'
import Title from './components/Title'
import FourByFour from './components/FourByFour'
import Panel from './components/Panel'
import Dashboard from './components/Dashboard'
import Overview from './components/Overview'
import Select from './components/Select'
import Footer from './components/Footer'
import TransactionsList from './components/TransactionsList'
import TopExchanges from './components/ExchangeTable'
import Chart from './components/Chart'
import Loader from './components/Loader'
import { Header, Divider, Hint, Address } from './components'
import { setThemeColor, isWeb3Available, formatNumber } from './helpers/'

const timeframeOptions = [
  { value: '1week', label: '1 week' },
  { value: '1month', label: '1 month' },
  { value: '3months', label: '3 months' },
  { value: 'all', label: 'All time' }
]

const _StyledLink = ({ active, ...rest }) => <Link {...rest} />
const StyledLink = styled(_StyledLink)`
  font-size: 15px;
  font-weight: 500;
  text-decoration: none;
  color: ${({ active }) => (active ? 'black' : 'grey')};
`

const NavWrapper = styled.div`
  ${StyledLink}:not(:last-child) {
    margin-right: 0.75rem;
  }
`

function NavHeader({ location, directory, exchangeAddress, switchActiveExchange }) {
  const main = location.pathname === '/'

  return (
    <Header px={24} py={3} bg={['mineshaft', 'transparent']} color={['white', 'black']}>
      <Title />
      <Flex>
        <NavWrapper>
          <StyledLink to="/" active={main}>
            Charts
          </StyledLink>
          <StyledLink to="/overview" active={!main}>
            Overview
          </StyledLink>
        </NavWrapper>
      </Flex>
      {main && (
        <Select
          options={directory}
          defaultValue={directory[0]}
          onChange={select => {
            if (exchangeAddress !== select.value) {
              switchActiveExchange(select.value)
            }
          }}
        />
      )}
    </Header>
  )
}

function OverviewPage({
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

function MainPage({
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
                  {tradeVolume}
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
                  {userNumPoolTokens} Pool Tokens
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
                {erc20Liquidity || `0.00`}
              </Text>
            }
            topRight={<Hint color="text">ETH Liquidity</Hint>}
            bottomRight={
              <Text fontSize={20} color="uniswappink" lineHeight={1.4} fontWeight={500}>
                {ethLiquidity || `0.00`}
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

class App extends Component {
  state = {
    historyDaysToQuery: timeframeOptions[0].value,
    overviewPage: false
  }

  // Fetch Exchange's Transactions
  fetchTransactions = () =>
    this.props.transactionsStore.fetchTransactions(this.props.directoryStore.state.activeExchange.exchangeAddress)

  fetchChart = () =>
    this.props.chartStore.fetchChart(
      this.props.directoryStore.state.activeExchange.exchangeAddress,
      this.state.historyDaysToQuery
    )

  clearCurrentExchange = () => {
    this.props.chartStore.resetChart()
    this.props.transactionsStore.resetTransactions()
    this.props.poolStore.resetUserPool()
  }

  // Fetch User Pool Information
  fetchUserPoolShare = async () => {
    try {
      await isWeb3Available()

      this.props.poolStore.fetchUserPool(
        this.props.directoryStore.state.activeExchange.exchangeAddress,
        web3.eth.accounts[0] // eslint-disable-line
      )
    } catch {}
  }

  // switch active exchane
  switchActiveExchange = async address => {
    try {
      // prep, clear current exchange's data
      await this.clearCurrentExchange()

      // first, set the active exchange
      await this.props.directoryStore.setActiveExchange(address)

      // second, set the new theme color from active exchange
      await setThemeColor(this.props.directoryStore.state.activeExchange.theme)

      // third, fetch the new ticker information
      await this.props.directoryStore.fetchTicker(address)

      // fourth - a, fetch new transaction information
      this.fetchTransactions()

      // fourth - b, fetch new user pool share information if web3
      this.fetchUserPoolShare()

      // fourth - c, fetch the chart data for default exchange
      this.fetchChart()
    } catch (err) {
      console.log('error:', err)
    }
  }

  // updateTimeframe
  updateTimeframe = newTimeframe => {
    if (this.state.historyDaysToQuery !== newTimeframe) {
      this.setState({ historyDaysToQuery: newTimeframe }, () => this.switchExchangeTimeframe())
    }
  }

  // switch exchange history & transaction timeline
  switchExchangeTimeframe = async () => {
    await this.props.transactionsStore.resetTransactions()
    this.props.chartStore.resetChart()

    this.fetchTransactions()

    this.fetchChart()
  }

  async componentDidMount() {
    try {
      // first, fetch directory & set default exchange address
      await this.props.directoryStore.fetchDirectory()

      // second, run "switchActiveExchange" with default exchange address
      await this.switchActiveExchange(this.props.directoryStore.state.defaultExchangeAddress)

      await this.props.overviewPageStore.fetchTotals()
      await this.props.overviewPageStore.fetchExchanges()
    } catch (err) {
      console.log('error:', err)
    }
  }

  render() {
    // spread state into cleaner vars
    const {
      exchangeAddress,
      tradeVolume,
      percentChange,
      symbol,
      erc20Liquidity,
      price,
      invPrice,
      ethLiquidity,
      tokenAddress
    } = this.props.directoryStore.state.activeExchange

    const {
      exchangeCount,
      totalLiquidityInEth,
      totalLiquidityUSD,
      totalVolumeInEth,
      totalVolumeUSD,
      txCount
    } = this.props.overviewPageStore.state.totals

    // OverviewPage Store
    const {
      state: { topN }
    } = this.props.overviewPageStore

    // Directory Store
    const {
      state: { directory }
    } = this.props.directoryStore

    // Transactions Store
    const {
      state: { transactions }
    } = this.props.transactionsStore

    // Chart Store
    const {
      state: { data }
    } = this.props.chartStore

    // Pool Store
    const {
      state: { userNumPoolTokens, userPoolPercent }
    } = this.props.poolStore

    if (directory.length === 0) {
      return (
        <Wrapper>
          <Loader fill="true" />
        </Wrapper>
      )
    }

    return (
      <ApolloProvider client={client}>
        <Wrapper>
          <Router primary={false}>
            <NavHeader
              default
              directory={directory}
              exchangeAddress={exchangeAddress}
              switchActiveExchange={this.switchActiveExchange}
            />
          </Router>

          <Router>
            <MainPage
              path="/"
              directory={directory}
              exchangeAddress={exchangeAddress}
              symbol={symbol}
              tradeVolume={tradeVolume}
              percentChange={percentChange}
              userNumPoolTokens={userNumPoolTokens}
              userPoolPercent={userPoolPercent}
              erc20Liquidity={erc20Liquidity}
              ethLiquidity={ethLiquidity}
              price={price}
              invPrice={invPrice}
              data={data}
              tokenAddress={tokenAddress}
              transactions={transactions}
              updateTimeframe={this.updateTimeframe}
            />
            <OverviewPage
              path="/overview"
              totalVolumeInEth={totalVolumeInEth}
              totalVolumeUSD={totalVolumeUSD}
              totalLiquidityInEth={totalLiquidityInEth}
              totalLiquidityUSD={totalLiquidityUSD}
              exchangeCount={exchangeCount}
              txCount={txCount}
              topN={topN}
            />
          </Router>
        </Wrapper>
      </ApolloProvider>
    )
  }
}

export default App
