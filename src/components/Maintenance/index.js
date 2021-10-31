import React, { useState, useEffect } from 'react'
import { useMedia } from 'react-use'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { Box, Flex, Text } from 'rebass'
import styled from 'styled-components'
import { Divider } from '..'
import { withRouter } from 'react-router-dom'

dayjs.extend(utc)

const PageButtons = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: 2em;
  margin-bottom: 0.5em;
`

const Arrow = styled.div`
  color: ${({ theme }) => theme.primary1};
  opacity: ${(props) => (props.faded ? 0.3 : 1)};
  padding: 0 20px;
  user-select: none;
  :hover {
    cursor: pointer;
  }
`
function Maintenance() {
  return (
    <div class="introduce">
      <div class="container">
        <div class="body mt-5">
          <h1 class="text-white"> Factory Info </h1>
          <p class="sub-header">is under maintenance....</p>
        </div>
      </div>
      <div class="d-flex justify-content-center">
        <img src="~/assets/img/incoming.svg" class="incoming" />
      </div>
    </div>
  )
}

export default withRouter(Maintenance)
