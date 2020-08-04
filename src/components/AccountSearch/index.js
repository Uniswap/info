import React, { useState } from 'react'
import 'feather-icons'
import { withRouter } from 'react-router-dom'
import styled from 'styled-components'
import { ButtonLight, ButtonFaded } from '../ButtonStyled'
import { AutoRow, RowBetween } from '../Row'
import { isAddress } from '../../utils'
import { useSavedAccounts } from '../../contexts/LocalStorage'
import { AutoColumn } from '../Column'
import { TYPE } from '../../Theme'
import { Hover } from '..'
import { X } from 'react-feather'

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
  width: 100%;
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
  padding: 8px 16px;
  border-radius: 20px;
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

function AccountLookup({ history }) {
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
    <AutoColumn gap={'1rem'}>
      <TYPE.main>Accounts</TYPE.main>
      <AutoColumn gap={'12px'}>
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
          <TYPE.light>No pinned wallets</TYPE.light>
        )}
      </AutoColumn>
      <AutoRow>
        <Wrapper>
          <Input
            placeholder="0x..."
            onChange={e => {
              setAccountValue(e.target.value)
            }}
          />
        </Wrapper>
      </AutoRow>
      <ButtonLight onClick={handleAccountSearch}>Load Account Details</ButtonLight>
    </AutoColumn>
  )
}

export default withRouter(AccountLookup)
