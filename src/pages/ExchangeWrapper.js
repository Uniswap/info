import React, { useEffect, useState } from 'react'
import { ExchangePage } from '../components/ExchangePage'
import LocalLoader from '../components/LocalLoader'
import { useExchangeSpecificData } from '../Data/ExchangeSpecificData'
import { useChart } from '../Data/ChartData'
import { hardcodeThemes } from '../constants/theme'
import { setThemeColor, isAddress } from '../helpers'
import Vibrant from 'node-vibrant'

export const ExchangeWrapper = function({
  address,
  exchanges,
  currencyUnit,
  historyDaysToQuery,
  setHistoryDaysToQuery
}) {
  const exchangeData = useExchangeSpecificData(address)

  const chartData = useChart(address, historyDaysToQuery)

  const [tokenName, setTokenName] = useState('')

  const [tokenSymbol, setTokenSymbol] = useState('')

  const [logo, setLogo] = useState('')

  const [currentData, setCurrentData] = useState({})

  useEffect(() => {
    let updateData = {}
    updateData.price = exchangeData.price
    updateData.invPrice = exchangeData.invPrice
    updateData.priceUSD = exchangeData.priceUSD
    updateData.tokenAddress = exchangeData.tokenAddres
    updateData.pricePercentChange = exchangeData.pricePercentChange
    updateData.pricePercentChangeETH = exchangeData.pricePercentChangeETH
    updateData.volumePercentChange = exchangeData.volumePercentChangeETH
    updateData.volumePercentChangeUSD = exchangeData.volumePercentChangeUSD
    updateData.liquidityPercentChange = exchangeData.liquidityPercentChangeETH
    updateData.liquidityPercentChangeUSD = exchangeData.liquidityPercentChangeUSD
    updateData.txsPercentChange = exchangeData.txsPercentChange
    updateData.ethLiquidity = exchangeData.ethLiquidity
    updateData.tradeVolume = exchangeData.tradeVolume
    updateData.tradeVolumeUSD = exchangeData.tradeVolumeUSD
    updateData.oneDayTxs = exchangeData.oneDayTxs
    setCurrentData(updateData)
  }, [exchangeData])

  useEffect(() => {
    setCurrentData({}) // reset data for UI
    if (hardcodeThemes.hasOwnProperty(address)) {
      setThemeColor(hardcodeThemes[address])
    } else {
      if (exchanges.hasOwnProperty(address)) {
        let tokenAddress = exchanges[address].tokenAddress
        const path = `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${isAddress(
          tokenAddress
        )}/logo.png`
        Vibrant.from(path).getPalette((err, palette) => {
          if (palette && palette.Vibrant) {
            let r = palette.Vibrant._rgb
            let code = 'rgba(' + r[0] + ',' + r[1] + ',' + r[2] + ')'
            setThemeColor(code)
          }
        })
      } else {
        setThemeColor('#333333')
      }
    }
  }, [address, exchanges])

  useEffect(() => {
    if (exchanges.hasOwnProperty(address)) {
      setTokenName(exchanges[address].tokenName)
      setTokenSymbol(exchanges[address].tokenSymbol)
      setLogo(exchanges[address].logoStyled)
    }
  }, [exchanges, address])

  return exchangeData ? (
    <ExchangePage
      currencyUnit={currencyUnit}
      exchangeAddress={address}
      chartData={chartData}
      logo={logo}
      historyDaysToQuery={historyDaysToQuery}
      setHistoryDaysToQuery={setHistoryDaysToQuery}
      tokenName={tokenName}
      symbol={tokenSymbol}
      tokenAddress={exchangeData.tokenAddress}
      tradeVolume={currentData.tradeVolume}
      tradeVolumeUSD={currentData.tradeVolumeUSD}
      oneDayTxs={currentData.oneDayTxs}
      ethLiquidity={currentData.ethLiquidity}
      price={currentData.price}
      invPrice={currentData.invPrice}
      priceUSD={currentData.priceUSD}
      pricePercentChange={currentData.pricePercentChange}
      pricePercentChangeETH={currentData.pricePercentChangeETH}
      volumePercentChange={currentData.volumePercentChange}
      volumePercentChangeUSD={currentData.volumePercentChangeUSD}
      liquidityPercentChange={currentData.liquidityPercentChange}
      liquidityPercentChangeUSD={currentData.liquidityPercentChangeUSD}
      txsPercentChange={currentData.txsPercentChange}
    />
  ) : (
    <LocalLoader />
  )
}
