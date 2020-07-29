import React, { useState } from 'react'
import 'feather-icons'
import styled from 'styled-components'

import { TYPE } from '../Theme'
import { Search } from '../components/Search'
import { AutoColumn } from '../components/Column'
import { RowBetween, AutoRow } from '../components/Row'
import { useSavedAccounts } from '../contexts/LocalStorage'
import { ButtonFaded, ButtonLight } from '../components/ButtonStyled'
import { Hover } from '../components'
import { X } from 'react-feather'
import { isAddress } from '../utils'

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-bottom: 100px;
  width: calc(100% - 20px);
  overflow: scroll;
  & > * {
    width: 100%;
    max-width: 1240px;
  }

  @media screen and (max-width: 1080px) {
    width: calc(100% - 40px);
    padding: 0 20px;
  }
`

const FixedMenu = styled.div`
  width: 100%;
  z-index: 99;
  position: sticky;
  top: -6rem;
  padding-top: 1.5rem;
  background-color: white;
  border-bottom: 1px solid ${({ theme }) => theme.bg3};
  margin-bottom: 2rem;
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
const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
  width: 180px;
  border-radius: 12px;
  background: ${({ theme }) => theme.bg2};
`

function AccountLookup({ history }) {
  const [savedAccounts, addAccount, removeAccount] = useSavedAccounts()

  const [accountValue, setAccountValue] = useState()

  function handleAccountSearch() {
    if (isAddress(accountValue)) {
      history.push('/account/' + accountValue)
      if (!savedAccounts.includes(accountValue)) {
        addAccount(accountValue)
      }
    }
  }

  return (
    <PageWrapper>
      <FixedMenu>
        <AutoColumn gap="40px">
          <Search />
          <RowBetween>
            <TYPE.largeHeader>Account Lookup</TYPE.largeHeader>
            <div />
          </RowBetween>
        </AutoColumn>
      </FixedMenu>
      <AutoColumn gap="2rem">
        <TYPE.main>Accounts</TYPE.main>
        <AutoRow gap={'12px'}>
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
        </AutoRow>
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
        <ButtonLight onClick={handleAccountSearch} width="200px">
          Load Account Details
        </ButtonLight>
      </AutoColumn>
    </PageWrapper>
  )
}

export default AccountLookup
