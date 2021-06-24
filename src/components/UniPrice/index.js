import React, { useMemo } from 'react'
import styled from 'styled-components'
import Panel from '../Panel'
import { AutoColumn } from '../Column'
import { RowFixed } from '../Row'
import { TYPE } from '../../Theme'
import { usePoolData } from '../../contexts/PoolData'
import { formattedNum, getNativeTokenSymbol } from '../../utils'

const PriceCard = styled(Panel)`
  position: absolute;
  right: -220px;
  width: 220px;
  top: -20px;
  z-index: 9999;
  height: fit-content;
  background-color: ${({ theme }) => theme.bg1};
`

function formatPercent(rawPercent) {
  if (rawPercent < 0.01) {
    return '<1%'
  } else return parseFloat(rawPercent * 100).toFixed(0) + '%'
}

export default function UniPrice() {
  const ethDaiBaseAmpPoolAddress =
    process.env.REACT_APP_ETH_DAI_BASE_AMP_POOL_ADDRESS || '0x20d6b227f4a5a2a13d520329f01bb1f8f9d2d628'
  const ethUsdcBaseAmpPoolAddress =
    process.env.REACT_APP_ETH_USDC_BASE_AMP_POOL_ADDRESS || '0xd478953d5572f829f457a5052580cbeaee36c1aa'
  const ethUsdtBaseAMPPoolAddress =
    process.env.REACT_APP_ETH_USDT_BASE_AMP_POOL_ADDRESS || '0xf8467ef9de03e83b5a778ac858ea5c2d1fc47188'

  const daiPair = usePoolData(ethDaiBaseAmpPoolAddress)
  const usdcPair = usePoolData(ethUsdcBaseAmpPoolAddress)
  const usdtPair = usePoolData(ethUsdtBaseAMPPoolAddress)

  const totalLiquidity = useMemo(() => {
    return daiPair && usdcPair && usdtPair
      ? daiPair.trackedReserveUSD + usdcPair.trackedReserveUSD + usdtPair.trackedReserveUSD
      : 0
  }, [daiPair, usdcPair, usdtPair])

  const daiPerEth = daiPair ? parseFloat(daiPair.token0Price).toFixed(2) : '-'
  const usdcPerEth = usdcPair ? parseFloat(usdcPair.token0Price).toFixed(2) : '-'
  const usdtPerEth = usdtPair
    ? String(process.env.REACT_APP_CHAIN_ID) === '1' // ETH and USDT order are reversed on Mainnet vs Ropsten
      ? parseFloat(usdtPair.token1Price).toFixed(2)
      : parseFloat(usdtPair.token0Price).toFixed(2)
    : '-'

  return (
    <PriceCard>
      <AutoColumn gap="10px">
        <RowFixed>
          <TYPE.main>
            {getNativeTokenSymbol()}/DAI: {formattedNum(daiPerEth, true)}
          </TYPE.main>
          <TYPE.light style={{ marginLeft: '10px' }}>
            {daiPair && totalLiquidity ? formatPercent(daiPair.trackedReserveUSD / totalLiquidity) : '-'}
          </TYPE.light>
        </RowFixed>
        <RowFixed>
          <TYPE.main>
            {getNativeTokenSymbol()}/USDC: {formattedNum(usdcPerEth, true)}
          </TYPE.main>
          <TYPE.light style={{ marginLeft: '10px' }}>
            {usdcPair && totalLiquidity ? formatPercent(usdcPair.trackedReserveUSD / totalLiquidity) : '-'}
          </TYPE.light>
        </RowFixed>
        <RowFixed>
          <TYPE.main>
            {getNativeTokenSymbol()}/USDT: {formattedNum(usdtPerEth, true)}
          </TYPE.main>
          <TYPE.light style={{ marginLeft: '10px' }}>
            {usdtPair && totalLiquidity ? formatPercent(usdtPair.trackedReserveUSD / totalLiquidity) : '-'}
          </TYPE.light>
        </RowFixed>
      </AutoColumn>
    </PriceCard>
  )
}
