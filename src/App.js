import React, { useState, useEffect } from 'react'
import { ApolloProvider } from 'react-apollo'
import { Router } from '@reach/router'
import { client } from './apollo/client'
import Wrapper from './components/Theme'
import Loader from './components/Loader'
import NavHeader from './components/NavHeader'
import { setThemeColor, isWeb3Available } from './helpers/'
import { MainPage } from './pages/MainPage'

const timeframeOptions = [
  { value: '1week', label: '1 week' },
  { value: '1month', label: '1 month' },
  { value: '3months', label: '3 months' },
  { value: 'all', label: 'All time' }
]

function App(props) {
  const [historyDaysToQuery, setHistoryDaysToQuery] = useState(timeframeOptions[3].value)

  const [currencyUnit, setCurrencyUnit] = useState('USD')

  const [chartData, setChartData] = useState([])

  const fetchChart = async () => {
    let data = []
    if (props.directoryStore.state.activeExchange) {
      data = await props.chartStore.fetchChart(
        props.directoryStore.state.activeExchange.exchangeAddress,
        historyDaysToQuery
      )
    }
    setChartData(data)
  }

  const clearCurrentExchange = () => {
    props.chartStore.resetChart()
    props.transactionsStore.resetTransactions()
    props.poolStore.resetUserPool()
  }

  // Fetch User Pool Information
  const fetchUserPoolShare = async () => {
    try {
      await isWeb3Available()
      if (props.directoryStore.state.activeExchange) {
        props.poolStore.fetchUserPool(
          props.directoryStore.state.activeExchange.exchangeAddress,
          web3.eth.accounts[0] // eslint-disable-line
        )
      }
    } catch {}
  }

  // switch active exchane
  const switchActiveExchange = async address => {
    try {
      // prep, clear current exchange's data
      await clearCurrentExchange()

      // first, set the active exchange
      await props.directoryStore.setActiveExchange(address)

      // second, set the new theme color from active exchange
      await setThemeColor(props.directoryStore.state.activeExchange.theme)

      // third, fetch the new ticker information
      await props.directoryStore.fetchTicker(address)

      // fourth - b, fetch new user pool share information if web3
      fetchUserPoolShare()

      // fourth - c, fetch the chart data for default exchange
      await fetchChart()
    } catch (err) {
      console.log('error:', err)
    }
  }

  // updateTimeframe
  const updateTimeframe = async newTimeframe => {
    if (historyDaysToQuery !== newTimeframe && props.directoryStore.state.activeExchange) {
      setHistoryDaysToQuery(newTimeframe)
      let newchartData = await props.chartStore.fetchChart(
        props.directoryStore.state.activeExchange.exchangeAddress,
        newTimeframe
      )
      setChartData(newchartData)
    }
  }

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

  // Pool Store
  const {
    state: { userNumPoolTokens, userPoolPercent }
  } = props.poolStore

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
            setCurrencyUnit={setCurrencyUnit}
            exchangeAddress={exchangeAddress}
            defaultExchangeAddress={defaultExchangeAddress}
            switchActiveExchange={switchActiveExchange}
            exchanges={exchanges}
          />
        </Router>
        <Router>
          <MainPage
            path="/"
            currencyUnit={currencyUnit}
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
            chartData={chartData}
            tokenAddress={tokenAddress}
            updateTimeframe={updateTimeframe}
          />
        </Router>
      </Wrapper>
    </ApolloProvider>
  )
}

export default App
