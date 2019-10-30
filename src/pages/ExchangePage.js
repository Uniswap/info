import React, { useEffect, useState } from 'react'
import { MainPage } from '../pages/MainPage'
import { useExchangeSpecificData } from '../hooks/ExchangeSpecificData'
import { useChart } from '../hooks/ChartData'
import { hardcodeThemes } from '../constants/theme'
import { setThemeColor } from '../helpers/'

export const ExchangePage = function({ address, exchanges, currencyUnit, historyDaysToQuery, setHistoryDaysToQuery }) {
  const exchangeData = useExchangeSpecificData(address)

  const chartData = useChart(address, historyDaysToQuery)

  const [tokenName, setTokenName] = useState('')

  const [tokenSymbol, setTokenSymbol] = useState('')

  const [logo, setLogo] = useState('')

  useEffect(() => {
    setThemeColor(hardcodeThemes[address])
  }, [address])

  useEffect(() => {
    if (exchanges.hasOwnProperty(address)) {
      setTokenName(exchanges[address].tokenName)
      setTokenSymbol(exchanges[address].tokenSymbol)
      setLogo(exchanges[address].logoStyled)
    }
  }, [exchanges, address])

  return exchangeData ? (
    <MainPage
      currencyUnit={currencyUnit}
      exchangeAddress={address}
      chartData={chartData}
      logo={logo}
      historyDaysToQuery={historyDaysToQuery}
      setHistoryDaysToQuery={setHistoryDaysToQuery}
      tokenName={tokenName}
      symbol={tokenSymbol}
      tokenAddres={exchangeData.tokenAddress}
      tradeVolume={exchangeData.tradeVolume}
      tradeVolumeUSD={exchangeData.tradeVolumeUSD}
      oneDayTxs={exchangeData.oneDayTxs}
      pricePercentChange={exchangeData.pricePercentChange}
      pricePercentChangeETH={exchangeData.pricePercentChangeETH}
      volumePercentChange={exchangeData.volumePercentChangeETH}
      volumePercentChangeUSD={exchangeData.volumePercentChangeUSD}
      liquidityPercentChange={exchangeData.liquidityPercentChangeETH}
      liquidityPercentChangeUSD={exchangeData.liquidityPercentChangeUSD}
      txsPercentChange={exchangeData.txsPercentChange}
      ethLiquidity={exchangeData.ethLiquidity}
      price={exchangeData.price}
      invPrice={exchangeData.invPrice}
      priceUSD={exchangeData.priceUSD}
      tokenAddress={exchangeData.tokenAddress}
    />
  ) : (
    ''
  )
}
