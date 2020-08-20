import styled, { css, keyframes } from 'styled-components'

const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
`

const Loader = styled.div`
  pointer-events: none;
  display: grid;
  place-items: center;
  background-image: url('./logo.svg');
  background-size: 72px;
  background-repeat: no-repeat;
  background-position: center;
  animation: ${rotate} 2s linear infinite;

  ${props =>
    props.fill && !props.height
      ? css`
          height: 100vh;
        `
      : css`
          height: 180px;
        `}
`

export default Loader
