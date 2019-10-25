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
import TokenLogo from './components/TokenLogo'
import { useChart } from './hooks/ChartData'
import { useGlobalData } from './hooks/GlobalData'
import { useUniswapHistory } from './hooks/UniswapHistory'

const timeframeOptions = [
  { value: '1week', label: '1 week' },
  { value: '1month', label: '1 month' },
  { value: '3months', label: '3 months' },
  { value: 'all', label: 'All time' }
]

function App(props) {
  //set default chart query time box
  const [historyDaysToQuery, setHistoryDaysToQuery] = useState(timeframeOptions[3].value)

  const [currencyUnit, setCurrencyUnit] = useState('USD')

  const chartData = useChart(
    props.directoryStore.state.activeExchange ? props.directoryStore.state.activeExchange.exchangeAddress : '',
    historyDaysToQuery
  )

  const uniswapHistory = useUniswapHistory(historyDaysToQuery)

  const globalData = useGlobalData()

  // switch active exchane
  const switchActiveExchange = async address => {
    try {
      // set the active exchange
      await props.directoryStore.setActiveExchange(address)

      // set the new theme color from active exchange
      await setThemeColor(props.directoryStore.state.activeExchange.theme)

      // fetch the new ticker information
      await props.directoryStore.fetchOverviewData(address)
    } catch (err) {
      console.log('error:', err)
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
    tradeVolumeUSD,
    tokenName,
    volumePercentChange,
    volumePercentChangeUSD,
    pricePercentChange,
    pricePercentChangeETH,
    txsPercentChange,
    symbol,
    erc20Liquidity,
    price,
    invPrice,
    priceUSD,
    ethLiquidity,
    usdLiquidity,
    tokenAddress,
    liquidityPercentChange,
    liquidityPercentChangeUSD
  } = props.directoryStore.state.activeExchange

  const defaultExchangeAddress = props.directoryStore.state.defaultExchangeAddress

  const {
    state: { exchanges }
  } = props.directoryStore

  // Directory Store
  const {
    state: { directory }
  } = props.directoryStore

  useEffect(() => {
    for (var i = 0; i < directory.length; i++) {
      const logo = <TokenLogo address={directory[i].tokenAddress} style={{ height: '20px', width: '20px' }} />
      directory[i].logo = logo
    }
  }, [directory])

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
      currencyUnit={currencyUnit}
      setCurrencyUnit={setCurrencyUnit}
      exchangeAddress={exchangeAddress}
      defaultExchangeAddress={defaultExchangeAddress}
      switchActiveExchange={switchActiveExchange}
      exchanges={exchanges}
    />
  ))

  return (
    <ApolloProvider client={client}>
      <Wrapper>
        <BrowserRouter>
          <NavHeaderUpdated />
          <Switch>
            <Route path="/tokens">
              <MainPage
                currencyUnit={currencyUnit}
                tokenName={tokenName}
                directory={directory}
                exchangeAddress={exchangeAddress}
                symbol={symbol}
                tradeVolume={tradeVolume}
                tradeVolumeUSD={tradeVolumeUSD}
                pricePercentChange={pricePercentChange}
                pricePercentChangeETH={pricePercentChangeETH}
                volumePercentChange={volumePercentChange}
                volumePercentChangeUSD={volumePercentChangeUSD}
                liquidityPercentChange={liquidityPercentChange}
                liquidityPercentChangeUSD={liquidityPercentChangeUSD}
                txsPercentChange={txsPercentChange}
                erc20Liquidity={erc20Liquidity}
                ethLiquidity={ethLiquidity}
                usdLiquidity={usdLiquidity}
                price={price}
                invPrice={invPrice}
                priceUSD={priceUSD}
                chartData={chartData}
                tokenAddress={tokenAddress}
                setHistoryDaysToQuery={setHistoryDaysToQuery}
              />
            </Route>
            <Route path="/">
              <OverviewPage
                currencyUnit={currencyUnit}
                tokenName={tokenName}
                switchActiveExchange={switchActiveExchange}
                globalData={globalData}
                directory={directory}
                exchangeAddress={exchangeAddress}
                symbol={symbol}
                tradeVolume={tradeVolume}
                pricePercentChange={pricePercentChange}
                volumePercentChange={volumePercentChange}
                liquidityPercentChange={liquidityPercentChange}
                erc20Liquidity={erc20Liquidity}
                price={price}
                invPrice={invPrice}
                priceUSD={priceUSD}
                chartData={chartData}
                uniswapHistory={uniswapHistory}
                tokenAddress={tokenAddress}
                updateTimeframe={setHistoryDaysToQuery}
              />
            </Route>
          </Switch>
        </BrowserRouter>
      </Wrapper>
    </ApolloProvider>
  )
}

export default App
