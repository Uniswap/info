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
import Panel from '../Panel'
import { Divider } from '..'
import { Flex } from 'rebass'

import { X } from 'react-feather'

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
  width: 100%;
  border-radius: 12px;
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
  padding: 12px 16px;
  border-radius: 12px;
  color: ${({ theme }) => theme.textColor};
  background-color: ${({ theme }) => theme.white};
  font-size: 16px;
  margin-right: 1rem;
  border: 1px solid ${({ theme }) => theme.bg3};

  ::placeholder {
    color: ${({ theme }) => theme.text3};
    font-size: 14px;
  }

  @media screen and (max-width: 640px) {
    ::placeholder {
      font-size: 1rem;
    }
  }
`

const AccountLink = styled.span`
  display: flex;
  cursor: pointer;
  color: ${({ theme }) => theme.link};
  font-size: 14px;
  font-weight: 500;
`

const DashGrid = styled.div`
  display: grid;
  grid-gap: 1em;
  grid-template-columns: 1fr;
  grid-template-areas: 'account';
  padding: 0 4px;

  > * {
    justify-content: flex-end;
  }
`

function AccountLookup({ history, small }) {
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
      {!small && (
        <>
          <AutoRow>
            <Wrapper>
              <Input
                placeholder="0x..."
                onChange={e => {
                  setAccountValue(e.target.value)
                }}
              />
            </Wrapper>
            <ButtonLight onClick={handleAccountSearch}>Load Account Details</ButtonLight>
          </AutoRow>
        </>
      )}

      <AutoColumn gap={'12px'}>
        {!small && (
          <Panel>
            <DashGrid center={true} style={{ height: 'fit-content', padding: '0 0 1rem 0' }}>
              <TYPE.main area="account">Saved Accounts</TYPE.main>
            </DashGrid>
            <Divider />
            {savedAccounts?.length > 0 ? (
              savedAccounts.map(account => {
                return (
                  <DashGrid key={account} center={true} style={{ height: 'fit-content', padding: '1rem 0 0 0' }}>
                    <Flex
                      area="account"
                      justifyContent="space-between"
                      onClick={() => history.push('/account/' + account)}
                    >
                      <AccountLink>{account?.slice(0, 42)}</AccountLink>
                      <Hover onClick={() => removeAccount(account)}>
                        <X size={16} />
                      </Hover>
                    </Flex>
                  </DashGrid>
                )
              })
            ) : (
              <div style={{ marginTop: '1rem' }}>No saved accounts</div>
            )}
          </Panel>
        )}

        {small && (
          <>
            <TYPE.main>{'Accounts'}</TYPE.main>
            {savedAccounts?.length > 0 ? (
              savedAccounts.map(account => {
                return (
                  <RowBetween key={account}>
                    <ButtonFaded onClick={() => history.push('/account/' + account)}>
                      {small ? (
                        <TYPE.header>{account?.slice(0, 6) + '...' + account?.slice(38, 42)}</TYPE.header>
                      ) : (
                        <AccountLink>{account?.slice(0, 42)}</AccountLink>
                      )}
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
          </>
        )}
      </AutoColumn>
    </AutoColumn>
  )
}

export default withRouter(AccountLookup)
