import React from 'react'
import styled from 'styled-components'

const AdvancedDataGroup = styled.div`
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  margin-top: 20px;
  font-family: 'Inter var', sans-serif;
`

const AdvancedDataBox = styled.div`
  width: calc(50% - 10px);
  margin-bottom: 20px;
  box-sizing: border-box;
  box-shadow: none;
`

export default function AdvancedPairData(pairAddress) {
  // load widget
  window.itb_widget.init({
    apiKey: '0hWAaw2SsW1YyaNKcBXEV6LIkRk4HZ0o23dP6AV9',
    options: {
      colors: {
        series: ['#ff007a']
      },
      protocol: 'uniswap',
      pairAddress: pairAddress,
      granularity: 'hourly',
      loader: false,
      hideNavigator: true
    }
  })

  return (
    <AdvancedDataGroup>
      <AdvancedDataBox data-target="itb-widget" data-type="protocol-fees-per-liquidity" />
      <AdvancedDataBox data-target="itb-widget" data-type="protocol-transactions-breakdown" />
      <AdvancedDataBox
        data-target="itb-widget"
        data-type="protocol-liquidity-variation"
        data-options='{ "pairTokenIndex": 0 }'
      />
      <AdvancedDataBox
        data-target="itb-widget"
        data-type="protocol-liquidity-variation"
        data-options='{ "pairTokenIndex": 1 }'
      />
    </AdvancedDataGroup>
  )
}
