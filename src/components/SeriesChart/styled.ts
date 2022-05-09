import styled from 'styled-components'

export const Wrapper = styled.div`
  position: relative;
`

export const Title = styled.p`
  margin: 4px 0px;
  font-size: 1rem;
  color: ${({ theme }) => theme.text6};
`

export const ChartInfo = styled.div`
  position: absolute;
  font-weight: 500;
  left: -4px;
  top: -8px;
  font-size: 1rem;
  color: ${({ theme }) => theme.text6};
  background-color: transparent;
  z-index: 10;
  pointer-events: none;
`
export const ChartInfoPrice = styled.span`
  margin: 0;
  font-size: 1.4rem;
`

export const ChartInfoDate = styled.p`
  font-size: 0.75rem;
  margin: 0;
  color: ${({ theme }) => theme.text6};
`
