import React from 'react'
import styled from 'styled-components'
import TokenLogo from '../TokenLogo'
import { useDarkModeManager } from '../../contexts/LocalStorage'

export default function DoubleTokenLogo({ a0, a1, size = 24, margin = false }) {
  const [darkMode] = useDarkModeManager()
  const TokenWrapper = styled.div`
    position: relative;
    display: flex;
    flex-direction: row;
    margin-right: ${({ sizeraw, margin }) => margin && (sizeraw / 3 + 8).toString() + 'px'};
  `

  const HigherLogo = styled(TokenLogo)`
    z-index: 2;
    background-color: ${({ darkMode }) => (darkMode ? 'white' : '#2b2c2c')};
    border-radius: 50%;
  `

  const CoveredLogo = styled(TokenLogo)`
    position: absolute;
    left: ${({ sizeraw }) => (sizeraw / 2).toString() + 'px'};
    background-color: ${({ darkMode }) => (darkMode ? '#2b2c2c' : '#2b2c2c')};
    border-radius: 50%;
  `

  return (
    <TokenWrapper darkMode={darkMode} sizeraw={size} margin={margin}>
      <HigherLogo darkMode={darkMode} address={a0} size={size.toString() + 'px'} sizeraw={size} />
      <CoveredLogo darkMode={darkMode} address={a1} size={size.toString() + 'px'} sizeraw={size} />
    </TokenWrapper>
  )
}
