import styled, { css } from 'styled-components'

const Loader = styled.div`
  pointer-events: none;
  display: grid;
  place-items: center;
  background-image: url('./loading3.gif');
  background-size: 72px;
  background-repeat: no-repeat;
  background-position: center;

  ${props =>
    props.fill && !props.height
      ? css`
          height: 100vh;
        `
      : css`
          height: 240px;
        `}
`

export default Loader
