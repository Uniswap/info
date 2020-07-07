import React, { useState } from 'react'
import 'feather-icons'
import styled from 'styled-components'
import { Text } from 'rebass'
import { AlertTriangle } from 'react-feather'
import { RowBetween, RowFixed } from '../Row'
import { ButtonDark } from '../ButtonStyled'
import { useMedia } from 'react-use'
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
`

const StyledWarningIcon = styled(AlertTriangle)`
  height: 20px;
  width: 20px;
  stroke: red;
`

export default function Warning({ type }) {
  const [showWarning, setShowWarning] = useState(true)

  const below700 = useMedia('(max-width: 700px)')

  const warningText =
    type === 'pair'
      ? 'Anyone can create and and name any ERC20 token. Do your own research before interacting with this pair.'
      : 'Anyone can create and and name any ERC20 token. Do your own research before interacting with this token.'

  return below700 ? (
    <WarningWrapper show={showWarning}>
      <AutoColumn gap="10px">
        <RowFixed>
          <StyledWarningIcon />
        </RowFixed>
        <Text fontWeight={500} lineHeight={'145.23%'}>
          {warningText}
        </Text>
        <RowBetween style={{ marginTop: '10px' }}>
          <div />
          <ButtonDark color={'#f82d3a'} style={{ minWidth: '140px' }} onClick={() => setShowWarning(false)}>
            I understand
          </ButtonDark>
        </RowBetween>
      </AutoColumn>
    </WarningWrapper>
  ) : (
    <WarningWrapper show={showWarning}>
      <RowBetween>
        <RowFixed>
          <StyledWarningIcon />
          <Text ml={'8px'} fontWeight={500}>
            {warningText}
          </Text>
        </RowFixed>
        <ButtonDark ml={'.5rem'} color={'#f82d3a'} style={{ minWidth: '140px' }} onClick={() => setShowWarning(false)}>
          I understand
        </ButtonDark>
      </RowBetween>
    </WarningWrapper>
  )
}
