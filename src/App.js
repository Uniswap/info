import React, { useState, useEffect } from 'react'
import { ApolloProvider } from 'react-apollo'
import { client } from './apollo/client'
import { Route, Switch, BrowserRouter, withRouter } from 'react-router-dom'
import Wrapper from './components/Theme'
import Loader from './components/Loader'
import NavHeader from './components/NavHeader'
import { setThemeColor } from './helpers/'
import { MainPage } from './pages/MainPage'
import { OverviewPage } from './pages/OverviewPage'
import { useChart } from './hooks/ChartData'

const timeframeOptions = [
  { value: '1week', label: '1 week' },
  { value: '1month', label: '1 month' },
  { value: '3months', label: '3 months' },
  { value: 'all', label: 'All time' }
]

function App(props) {
  const [historyDaysToQuery, setHistoryDaysToQuery] = useState(timeframeOptions[3].value)

  const [currencyUnit, setCurrencyUnit] = useState('USD')

  const TOKEN_ICON_API = 'https://raw.githubusercontent.com/TrustWallet/tokens/master/tokens'
  const mkrLogo = `${TOKEN_ICON_API}/${'0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2'.toLowerCase()}.png`

  const chartData = useChart(props.directoryStore.state.activeExchange.exchangeAddress, historyDaysToQuery)

  // switch active exchane
  const switchActiveExchange = async address => {
    try {
      // first, set the active exchange
      await props.directoryStore.setActiveExchange(address)

      // second, set the new theme color from active exchange
      await setThemeColor(props.directoryStore.state.activeExchange.theme)

      // third, fetch the new ticker information
      await props.directoryStore.fetchTicker(address)
    } catch (err) {
      console.log('error:', err)
    }
  }

  // updateTimeframe
  const updateTimeframe = async newTimeframe => {
    if (historyDaysToQuery !== newTimeframe && props.directoryStore.state.activeExchange) {
      setHistoryDaysToQuery(newTimeframe)
    }
  }

  // fetch the initial data
  useEffect(() => {
    async function getData() {
      // first, fetch directory & set default exchange address
      await props.directoryStore.fetchDirectory()
      // second, run "switchActiveExchange" with default exchange address
      await switchActiveExchange(props.directoryStore.state.defaultExchangeAddress)
    }
    try {
      getData()
    } catch (err) {
      console.log('error:', err)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

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
  } = props.directoryStore.state.activeExchange

  const defaultExchangeAddress = props.directoryStore.state.defaultExchangeAddress

  const {
    state: { exchanges }
  } = props.directoryStore

  // Directory Store
  const {
    state: { directory }
  } = props.directoryStore

  if (directory.length === 0) {
    return (
      <Wrapper>
        <Loader fill="true" />
      </Wrapper>
    )
  }

  const NavHeaderUpdated = withRouter(props => (
    <NavHeader
      default
      {...props}
      directory={directory}
      setCurrencyUnit={setCurrencyUnit}
      exchangeAddress={exchangeAddress}
      defaultExchangeAddress={defaultExchangeAddress}
      switchActiveExchange={switchActiveExchange}
      exchanges={exchanges}
      mkrLogo={mkrLogo}
    />
  ))

  return (
    <ApolloProvider client={client}>
      <Wrapper>
        <BrowserRouter>
          <NavHeaderUpdated />
          <Switch>
            <Route path="/">
              <MainPage
                currencyUnit={currencyUnit}
                tokenName={tokenName}
                directory={directory}
                exchangeAddress={exchangeAddress}
                symbol={symbol}
                tradeVolume={tradeVolume}
                pricePercentChange={pricePercentChange}
                volumePercentChange={volumePercentChange}
                liquidityPercentChange={liquidityPercentChange}
                erc20Liquidity={erc20Liquidity}
                ethLiquidity={ethLiquidity}
                price={price}
                invPrice={invPrice}
                priceUSD={priceUSD}
                chartData={chartData}
                tokenAddress={tokenAddress}
                updateTimeframe={updateTimeframe}
              />
            </Route>
            {/* <Route path="/overview">
              <OverviewPage
                currencyUnit={currencyUnit}
                tokenName={tokenName}
                directory={directory}
                exchangeAddress={exchangeAddress}
                symbol={symbol}
                tradeVolume={tradeVolume}
                pricePercentChange={pricePercentChange}
                volumePercentChange={volumePercentChange}
                liquidityPercentChange={liquidityPercentChange}
                erc20Liquidity={erc20Liquidity}
                ethLiquidity={ethLiquidity}
                price={price}
                invPrice={invPrice}
                priceUSD={priceUSD}
                chartData={chartData}
                tokenAddress={tokenAddress}
                updateTimeframe={updateTimeframe}
              />
            </Route> */}
          </Switch>
        </BrowserRouter>
      </Wrapper>
    </ApolloProvider>
  )
}

export default App
