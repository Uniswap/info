import React from 'react'
import styled, { css } from 'styled-components'
import logo from '../../assets/logo.svg'

const Loader = styled.div`
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;

  & > * {
    width: 72px;
  }

  ${props =>
    props.fill && !props.height
      ? css`
          height: 100vh;
          position: fixed;
          top: 0;
          z-index: 99999;
          background: #fff; /* fallback for old browsers */
        `
      : css`
          height: 180px;
        `}
`

const Spinner = styled.div`
  display: flex;
  margin: 0 auto;
  width: 40%;
  height: 40%;
  position: relative;
  background: url(${logo}) no-repeat center center;
  background-size: contain;
  -webkit-animation: sk-bounce 2.0s infinite ease-in-out;
  animation: sk-bounce 2.0s infinite ease-in-out;
  -webkit-animation-delay: -1.0s;
  animation-delay: -1.0s;
  
  @-webkit-keyframes sk-bounce {
    0%, 100% {
      -webkit-transform: scale(0.9)
    }
    50% {
      -webkit-transform: scale(1.0)
    }
  }
  
  @keyframes sk-bounce {
    0%, 100% {
      transform: scale(0.9);
      -webkit-transform: scale(0.9);
    }
    50% {
      transform: scale(1.0);
      -webkit-transform: scale(1.0);
    }
  }
`

const LocalLoader = ({ fill }) => {
  return (
    <Loader fill={fill}>
      <Spinner />
    </Loader>
  )
}

export default LocalLoader
