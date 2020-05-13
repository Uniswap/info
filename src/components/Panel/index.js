import { Box as RebassBox } from 'rebass'
import styled, { css } from 'styled-components'

const panelPseudo = css`
  :after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    height: 10px;
  }

  @media only screen and (min-width: 40em) {
    :after {
      content: unset;
    }
  }
`

const Panel = styled(RebassBox)`
  position: relative;
  box-shadow:
  0 1.1px 2.8px -9px rgba(0, 0, 0, 0.008),
  0 2.7px 6.7px -9px rgba(0, 0, 0, 0.012),
  0 5px 12.6px -9px rgba(0, 0, 0, 0.015),
  0 8.9px 22.6px -9px rgba(0, 0, 0, 0.018),
  0 16.7px 42.2px -9px rgba(0, 0, 0, 0.022),
  0 40px 101px -9px rgba(0, 0, 0, 0.03)
;


  ${props => (props.area ? `grid-area: ${props.area};` : null)}

  ${props =>
    props.grouped &&
    css`
      @media only screen and (min-width: 40em) {
        &:first-of-type {
          border-radius: 20px 20px 0 0;
        }
        &:last-of-type {
          border-radius: 0 0 20px 20px;
        }
      }
    `}

  ${props =>
    props.rounded &&
    css`
      border-radius: 24px;
      @media only screen and (min-width: 40em) {
        border-radius: 10px;
      }
    `};

  ${props => !props.last && panelPseudo}
`

export default Panel
