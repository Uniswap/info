import React from 'react'
import styled, { css } from 'styled-components'
import gif from './loading.gif'

const Loader = styled.div`
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  width: 100vw;

  & > * {
    width: 72px;
  }
`

const LocalLoader = () => {
  return (
    <Loader>
      <img src={gif} alt="loading-icon" />
    </Loader>
  )
}

export default LocalLoader
