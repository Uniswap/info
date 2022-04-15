import React from 'react'
import styled from 'styled-components'
import TokenLogo from '../TokenLogo'

const TokenWrapper = styled.div`
  position: relative;
  display: flex;
  flex-direction: row;
  margin-right: ${({ sizeraw, margin }) => margin && (sizeraw / 3 + 8).toString() + 'px'};
`

const HigherLogo = styled(TokenLogo)`
  z-index: 2;
  border-radius: 50%;
`

const CoveredLogo = styled(TokenLogo)`
  position: absolute;
  left: ${({ sizeraw }) => (sizeraw / 2).toString() + 'px'};
  border-radius: 50%;
`

export default function DoubleTokenLogo({ a0, a1, size = 24, margin = false, networkInfo }) {
  return (
    <TokenWrapper sizeraw={size} margin={margin}>
      <HigherLogo address={a0} size={size.toString() + 'px'} sizeraw={size} networkInfo={networkInfo} />
      <CoveredLogo address={a1} size={size.toString() + 'px'} sizeraw={size} networkInfo={networkInfo} />
    </TokenWrapper>
  )
}
