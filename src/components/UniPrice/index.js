import React, { useState, useEffect, useMemo } from 'react'
import styled from 'styled-components'
import Panel from '../Panel'
import { AutoColumn } from '../Column'
import { RowFixed } from '../Row'
import { TYPE } from '../../Theme'
import { usePairData } from '../../contexts/PairData'

const PriceCard = styled(Panel)`
  position: absolute;
  right: -60px;
  width: fit-content;
  top: -40px;
  z-index: 10;
  background-color: ${({ theme }) => theme.bg1};
`

function formatPercent(rawPercent) {
  if (rawPercent < 0.01) {
    return '<1%'
  } else return parseFloat(rawPercent * 100).toFixed(0) + '%'
}

export default function UniPrice() {
  const daiPair = usePairData('0x75116bd1ab4b0065b44e1a4ea9b4180a171406ed')
  const usdcPair = usePairData('0x61bb2fda13600c497272a8dd029313afdb125fd3')
  // const tusdPair = usePairData('0xb4d0d9df2738abe81b87b66c80851292492d1404')
  const usdtPair = usePairData('0xbeabef3fc02667d8bd3f702ae0bb2c4edb3640cc')

  const totalLiquidity = useMemo(() => {
    return daiPair && usdcPair && usdtPair
      ? daiPair.trackedReserveUSD + usdcPair.trackedReserveUSD + usdtPair.trackedReserveUSD
      : 0
  }, [daiPair, usdcPair, usdtPair])

  const [daiPerEth, setDaiPerEth] = useState()
  useEffect(() => {
    daiPair && setDaiPerEth(parseFloat(daiPair.token1Price).toFixed(2))
  }, [daiPair])

  const [usdcPerEth, setUSDCPerEth] = useState()
  useEffect(() => {
    usdcPair && setUSDCPerEth(parseFloat(usdcPair.token1Price).toFixed(2))
  }, [usdcPair])

  // const [tusdPerEth, setTUSDerEth] = useState()
  // useEffect(() => {
  //   tusdPair && setTUSDerEth(parseFloat(tusdPair.token0Price).toFixed(2))
  // }, [tusdPair])

  const [usdtPerEth, setUSDTPerEth] = useState()
  useEffect(() => {
    usdtPair && setUSDTPerEth(parseFloat(usdtPair.token1Price).toFixed(2))
  }, [usdtPair])

  return (
    <PriceCard>
      <AutoColumn gap="10px">
        <RowFixed>
          <TYPE.main>DAI/ETH: {daiPerEth ? daiPerEth : '-'}</TYPE.main>
          <TYPE.light style={{ marginLeft: '10px' }}>
            {daiPair && totalLiquidity ? formatPercent(daiPair.trackedReserveUSD / totalLiquidity) : '-'}
          </TYPE.light>
        </RowFixed>
        <RowFixed>
          <TYPE.main>USDC/ETH: {usdcPerEth ? usdcPerEth : '-'}</TYPE.main>
          <TYPE.light style={{ marginLeft: '10px' }}>
            {usdcPair && totalLiquidity ? formatPercent(usdcPair.trackedReserveUSD / totalLiquidity) : '-'}
          </TYPE.light>
        </RowFixed>
        {/* <RowFixed>
          <TYPE.main>TUSD/ETH: {tusdPerEth}</TYPE.main>
          <TYPE.light style={{ marginLeft: '10px' }}>
            {tusdPair && totalLiquidity
              ? parseFloat(tusdPair.trackedReserveUSD / totalLiquidity).toFixed(2) * 100 + '%'
              : '-'}
          </TYPE.light>
        </RowFixed> */}
        <RowFixed>
          <TYPE.main>USDT/ETH: {usdtPerEth ? usdtPerEth : '-'}</TYPE.main>
          <TYPE.light style={{ marginLeft: '10px' }}>
            {usdtPair && totalLiquidity ? formatPercent(usdtPair.trackedReserveUSD / totalLiquidity) : '-'}
          </TYPE.light>
        </RowFixed>
      </AutoColumn>
    </PriceCard>
  )
}
