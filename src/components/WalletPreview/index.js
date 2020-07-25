import React, { useState } from 'react'
import { withRouter } from 'react-router-dom'
import styled from 'styled-components'
import { AutoRow, RowBetween } from '../Row'
import { AutoColumn } from '../Column'
import { TYPE } from '../../Theme'
import Panel from '../Panel'
import { ButtonLight, ButtonFaded } from '../ButtonStyled'
import { useSavedAccounts } from '../../contexts/LocalStorage'
import { isAddress } from '../../utils'
import { X } from 'react-feather'
import { Hover } from '..'

const Wrapper = styled.div`
  display: flex;
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

  const [savedAccounts, addAccount, removeAccount] = useSavedAccounts()

  function handleAccountSearch() {
    if (isAddress(accountValue)) {
      history.push('/account/' + accountValue)
      if (!savedAccounts.includes(accountValue)) {
        addAccount(accountValue)
      }
    }
  }

  return (
    <AutoColumn gap="1rem">
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

          <ButtonLight onClick={handleAccountSearch}>Load Account Details</ButtonLight>
        </AutoColumn>
      </Panel>
      <Panel>
        <AutoColumn gap={'12px'}>
          <TYPE.main>Pinned Accounts </TYPE.main>
          {savedAccounts?.length > 0 ? (
            savedAccounts.map(account => {
              return (
                <RowBetween key={account}>
                  <ButtonFaded onClick={() => history.push('/account/' + account)}>
                    <TYPE.header>{account?.slice(0, 6) + '...' + account?.slice(38, 42)}</TYPE.header>
                  </ButtonFaded>
                  <Hover onClick={() => removeAccount(account)}>
                    <X size={16} />
                  </Hover>
                </RowBetween>
              )
            })
          ) : (
            <TYPE.small>Pinned accounts will appear here.</TYPE.small>
          )}
        </AutoColumn>
      </Panel>
    </AutoColumn>
  )
}

export default withRouter(WalletPreview)
