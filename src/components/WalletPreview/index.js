import React, { useState } from 'react'
import { withRouter } from 'react-router-dom'

import styled from 'styled-components'

import { AutoRow } from '../Row'
import { AutoColumn } from '../Column'

import { Hover, TYPE } from '../../Theme'
import { useAllPairData } from '../../contexts/PairData'
import Panel from '../Panel'
import { useAllTokenData } from '../../contexts/TokenData'
import { ButtonLight } from '../ButtonStyled'

const Wrapper = styled.div`
  display: flex;
  /* position: relative; */
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
  width: 180px;
  padding: 8px 16px;
  border-radius: 12px;
  background: ${({ theme }) => theme.bg2};
`

const Input = styled.input`
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  white-space: nowrap;
  background: none;
  border: none;
  outline: none;
  color: ${({ theme }) => theme.textColor};
  background-color: ${({ theme }) => theme.bg2};
  font-size: 16px;

  ::placeholder {
    color: ${({ theme }) => theme.text3};
    font-size: 16px;
  }

  @media screen and (max-width: 640px) {
    ::placeholder {
      font-size: 1rem;
    }
  }
`

function WalletPreview({ history }) {
  const [accountValue, setAccountValue] = useState()

  return (
    <Panel>
      <AutoColumn gap={'12px'}>
        <TYPE.main>Wallet Analytics</TYPE.main>
        <TYPE.small>Input an address to view liqudiity provider statistics.</TYPE.small>
        <AutoRow>
          <Wrapper>
            <Input
              placeholder="0x.."
              onChange={e => {
                setAccountValue(e.target.value)
              }}
            />
          </Wrapper>
        </AutoRow>

        <ButtonLight style={{ marginRight: '1rem' }} onClick={() => history.push('/account/' + accountValue)}>
          Load Account Details
        </ButtonLight>
      </AutoColumn>
    </Panel>
  )
}

export default withRouter(WalletPreview)
