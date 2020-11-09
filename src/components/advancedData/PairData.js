import React, { useEffect } from 'react'
import styled from 'styled-components'
import './override.css'
import { useDarkModeManager } from '../../contexts/LocalStorage'
import { ButtonLight } from '../ButtonStyled'
import Link from '../Link'
import { RowBetween } from '../Row'

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

export default function AdvancedPairData({ pairAddress, onPairNotSupported }) {
  // load widget
  useEffect(() => {
    if (window.itb_widget?.init) {
      window.itb_widget.init({
        apiKey: '0hWAaw2SsW1YyaNKcBXEV6LIkRk4HZ0o23dP6AV9',
        options: {
          colors: {
            series: ['#ff007a']
          },
          protocol: 'uniswap',
          pairAddress,
          granularity: 'hourly',
          loader: true,
          hideNavigator: true,
          events: {
            onPairNotSupported // hide if not supported
          }
        }
      })
    }
  }, [pairAddress, onPairNotSupported])

  const [isDark] = useDarkModeManager()

  return (
    <AdvancedDataGroup className={isDark ? 'night-mode' : ''}>
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
      <RowBetween>
        <div />
        <ButtonLight>
          <Link
            external
            href={`https://app.intotheblock.com/insights/defi/protocols/uniswap?address=${pairAddress}&pid=uniswap&utm_source=uniswap_widget`}
          >
            See more ↗
          </Link>
        </ButtonLight>
      </RowBetween>
    </AdvancedDataGroup>
  )
}
