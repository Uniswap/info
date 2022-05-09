import styled from 'styled-components'

export const PercentValue = styled.span<{ color?: string }>`
  font-weight: 500;
  color: ${({ color }) => color};
`
