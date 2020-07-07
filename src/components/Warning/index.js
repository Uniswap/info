import React from 'react'
import 'feather-icons'
import styled from 'styled-components'
import { Text } from 'rebass'
import { AlertTriangle } from 'react-feather'
import { RowBetween, RowFixed } from '../Row'
import { ButtonDark } from '../ButtonStyled'
import { AutoColumn } from '../Column'

const WarningWrapper = styled.div`
  border-radius: 20px;
  border: 1px solid #f82d3a;
  background: rgba(248, 45, 58, 0.05);
  padding: 10px 1rem;
  color: #f82d3a;
  width: 80% !important;
  max-width: 1000px;
  display: ${({ show }) => !show && 'none'};
  margin-bottom: 40px;
  position: relative;
`

const StyledWarningIcon = styled(AlertTriangle)`
  height: 20px;
  width: 20px;
  stroke: red;
`

export default function Warning({ show, setShow }) {
  return (
    <WarningWrapper show={show}>
      <AutoColumn gap="10px">
        <RowFixed>
          <StyledWarningIcon />
        </RowFixed>
        <Text fontWeight={500} lineHeight={'145.23%'}>
          Anyone can create and name any ERC20 token on Ethereum, including creating fake versions of existing tokens
          and tokens that claim to represent projects that do not have a token.
        </Text>
        <Text fontWeight={500} lineHeight={'145.23%'}>
          Similar to Etherscan, this site automatically tracks analytics for all ERC20 tokens independent of token
          integrity. Please do your own research before interacting with any ERC20 token.
        </Text>
        <RowBetween>
          <div />
          <ButtonDark color={'#f82d3a'} style={{ minWidth: '140px' }} onClick={() => setShow(false)}>
            I understand
          </ButtonDark>
        </RowBetween>
      </AutoColumn>
    </WarningWrapper>
  )
}
