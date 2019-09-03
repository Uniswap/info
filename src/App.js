import React, { Component } from 'react'
import styled from 'styled-components'
import { Flex } from 'rebass'
import { ApolloProvider } from 'react-apollo'
import { Router, Link } from '@reach/router'

import { client } from './apollo/client'
import Wrapper from './components/Theme'
import Title from './components/Title'
import Select from './components/Select'
import Loader from './components/Loader'
import { Header } from './components'
import { setThemeColor, isWeb3Available } from './helpers/'
import { MainPage } from './pages/MainPage'
import { OverviewPage } from './pages/OverviewPage'

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
  display: flex;
  width: 100%;
  justify-content: center;
  align-items: center;
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
