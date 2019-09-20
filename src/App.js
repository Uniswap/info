import React, { Component, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { Flex } from 'rebass'
import { ApolloProvider } from 'react-apollo'
import { Router, Link } from '@reach/router'
import { useWeb3Context } from 'web3-react'
import Jazzicon from 'jazzicon'
import { client } from './apollo/client'
import Wrapper from './components/Theme'
import Title from './components/Title'
import Select from './components/Select'
import Loader from './components/Loader'
import CurrencySelect from './components/CurrencySelect'
import { Header } from './components'
import { setThemeColor, isWeb3Available } from './helpers/'
import { MainPage } from './pages/MainPage'

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

const AccountBar = styled.div`
  width: 130px;
  background-color: rgba(255, 255, 255, 0.15);
  border-radius: 38px;
  margin-left: 0.8em;
  height: 38px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
  padding: 0 12px;
`

const NavSelect = styled(Select)`
  min-width: 200px;

  @media screen and (max-width: 40em) {
    color: black;
  }
`

const CurrencySelectFormatted = styled(CurrencySelect)`
  min-width: 100px;
  margin-right: 0.8em;
`

const FlexEnd = styled(Flex)`
  justify-content: flex-end;

  @media screen and (max-width: 40em) {
    margin-top: 1em;
  }
`

const Identicon = styled.div`
  height: 1rem;
  width: 1rem;
  border-radius: 1.125rem;
  background-color: grey;
`

function NavHeader({
  location,
  directory,
  defaultExchangeAddress,
  exchangeAddress,
  switchActiveExchange,
  setCurrencyUnit
}) {
  const main = location.pathname === '/'

  // for now exclude broken tokens
  let filteredDirectory = []
  for (var i = 0; i < directory.length; i++) {
    if (directory[i].label !== 'unknown') {
      // console.log(directory[i])
      filteredDirectory.push(directory[i])
    }
  }

  const web3 = useWeb3Context()

  // setup connection if user ahs metamask
  useEffect(() => {
    web3.setFirstValidConnector(['MetaMask'])
  }, [web3])

  const ref = useRef()
  useEffect(() => {
    if (ref.current) {
      ref.current.innerHTML = ''
      if (web3.account) {
        ref.current.appendChild(Jazzicon(16, parseInt(web3.account.slice(2, 10), 16)))
      }
    }
  }, [web3.account])

  function getDirectoryIndex() {
    let def = {}
    directory.forEach(element => {
      if (element.value === defaultExchangeAddress) {
        def = element
      }
    })
    return (
      <NavSelect
        options={filteredDirectory}
        defaultValue={def}
        onChange={select => {
          if (exchangeAddress !== select.value) {
            switchActiveExchange(select.value)
          }
        }}
      />
    )
  }

  return (
    <Header px={24} py={3} bg={['mineshaft', 'transparent']} color={['white', 'black']}>
      <Title />
      <Flex>
        <NavWrapper></NavWrapper>
      </Flex>
      <FlexEnd>
        <CurrencySelectFormatted
          options={[
            {
              label: 'ETH',
              value: 'ETH'
            },
            { label: 'USD', value: 'USD' }
          ]}
          defaultValue={{ label: 'USD', value: 'USD' }}
          onChange={select => {
            setCurrencyUnit(select.value)
          }}
        />
        {main && defaultExchangeAddress && getDirectoryIndex()}
        {web3.account ? (
          <AccountBar>
            {web3.account.slice(0, 6) + '...' + web3.account.slice(38, 42)} <Identicon ref={ref} />
          </AccountBar>
        ) : (
          ''
        )}
      </FlexEnd>
    </Header>
  )
}

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      historyDaysToQuery: timeframeOptions[3].value,
      overviewPage: false,
      currencyUnit: 'USD'
    }
  }

  setCurrencyUnit = unit => {
    this.setState({
      currencyUnit: unit
    })
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

      // await this.props.overviewPageStore.fetchTotals()
      // await this.props.overviewPageStore.fetchExchanges()
    } catch (err) {
      console.log('error:', err)
    }
  }

  render() {
    // spread state into cleaner vars

    const {
      exchangeAddress,
      tradeVolume,
      tokenName,
      volumePercentChange,
      pricePercentChange,
      symbol,
      erc20Liquidity,
      price,
      invPrice,
      priceUSD,
      ethLiquidity,
      tokenAddress,
      liquidityPercentChange
    } = this.props.directoryStore.state.activeExchange

    const defaultExchangeAddress = this.props.directoryStore.state.defaultExchangeAddress

    // const {
    //   exchangeCount,
    //   totalLiquidityInEth,
    //   totalLiquidityUSD,
    //   totalVolumeInEth,
    //   totalVolumeUSD,
    //   txCount
    // } = this.props.overviewPageStore.state.totals

    // OverviewPage Store
    // const {
    //   state: { topN }
    // } = this.props.overviewPageStore

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
              setCurrencyUnit={this.setCurrencyUnit}
              exchangeAddress={exchangeAddress}
              defaultExchangeAddress={defaultExchangeAddress}
              switchActiveExchange={this.switchActiveExchange}
            />
          </Router>
          <Router>
            <MainPage
              path="/"
              currencyUnit={this.state.currencyUnit}
              tokenName={tokenName}
              directory={directory}
              exchangeAddress={exchangeAddress}
              symbol={symbol}
              tradeVolume={tradeVolume}
              pricePercentChange={pricePercentChange}
              volumePercentChange={volumePercentChange}
              liquidityPercentChange={liquidityPercentChange}
              userNumPoolTokens={userNumPoolTokens}
              userPoolPercent={userPoolPercent}
              erc20Liquidity={erc20Liquidity}
              ethLiquidity={ethLiquidity}
              price={price}
              invPrice={invPrice}
              priceUSD={priceUSD}
              data={data}
              tokenAddress={tokenAddress}
              transactions={transactions}
              updateTimeframe={this.updateTimeframe}
            />
          </Router>
        </Wrapper>
      </ApolloProvider>
    )
  }
}

export default App
