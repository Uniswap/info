import React, { useState, useEffect, useCallback } from 'react'
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
import { timeframeOptions } from './constants'

function App(props) {
  // set default time box to all time
  const [historyDaysToQuery, setHistoryDaysToQuery] = useState(timeframeOptions[3].value)

  // currency across site can be USD or ETH
  const [currencyUnit, setCurrencyUnit] = useState('USD')

  // data for individual exchange historical chart, start with default
  const chartData = useChart(
    props.directoryStore.state.activeExchange ? props.directoryStore.state.activeExchange.exchangeAddress : '',
    historyDaysToQuery
  )

  // historical data for chart on overview page
  const uniswapHistory = useUniswapHistory(historyDaysToQuery)

  // data for Uniswap totals on overview page, may be dependent on values in the future
  const globalData = useGlobalData()

  // switch active exchane
  const switchActiveExchange = useCallback(
    async address => {
      try {
        // reset active exchange address
        await props.directoryStore.setActiveExchange(address)

        // set the new theme color from active exchange
        await setThemeColor(props.directoryStore.state.activeExchange.theme)

        // fetch the new information for the exhcnage token page
        await props.directoryStore.fetchOverviewData(address)
      } catch (err) {
        console.log('error:', err)
      }
    },
    [props.directoryStore]
  )

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
  }, [props.directoryStore, switchActiveExchange])

  const {
    exchangeAddress,
    tradeVolume,
    tradeVolumeUSD,
    oneDayTxs,
    tokenName,
    volumePercentChange,
    volumePercentChangeUSD,
    pricePercentChange,
    pricePercentChangeETH,
    txsPercentChange,
    symbol,
    price,
    invPrice,
    priceUSD,
    ethLiquidity,
    tokenAddress,
    liquidityPercentChange,
    liquidityPercentChangeUSD
  } = props.directoryStore.state.activeExchange

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
      exchanges={exchanges}
      exchangeAddress={exchangeAddress}
      switchActiveExchange={switchActiveExchange}
      currencyUnit={currencyUnit}
      setCurrencyUnit={setCurrencyUnit}
      setHistoryDaysToQuery={setHistoryDaysToQuery}
    />
  ))

  return (
    <ApolloProvider client={client}>
      <Wrapper>
        <BrowserRouter>
          <NavHeaderUpdated />
          <Switch>
            <Route path="/token">
              <MainPage
                currencyUnit={currencyUnit}
                tokenName={tokenName}
                exchangeAddress={exchangeAddress}
                symbol={symbol}
                tradeVolume={tradeVolume}
                tradeVolumeUSD={tradeVolumeUSD}
                oneDayTxs={oneDayTxs}
                pricePercentChange={pricePercentChange}
                pricePercentChangeETH={pricePercentChangeETH}
                volumePercentChange={volumePercentChange}
                volumePercentChangeUSD={volumePercentChangeUSD}
                liquidityPercentChange={liquidityPercentChange}
                liquidityPercentChangeUSD={liquidityPercentChangeUSD}
                txsPercentChange={txsPercentChange}
                ethLiquidity={ethLiquidity}
                price={price}
                invPrice={invPrice}
                priceUSD={priceUSD}
                chartData={chartData}
                tokenAddress={tokenAddress}
                historyDaysToQuery={historyDaysToQuery}
                setHistoryDaysToQuery={setHistoryDaysToQuery}
              />
            </Route>
            <Route path="/">
              <OverviewPage
                currencyUnit={currencyUnit}
                switchActiveExchange={switchActiveExchange}
                globalData={globalData}
                symbol={symbol}
                price={price}
                invPrice={invPrice}
                priceUSD={priceUSD}
                uniswapHistory={uniswapHistory}
                historyDaysToQuery={historyDaysToQuery}
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
