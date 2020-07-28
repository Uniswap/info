import React, { useState } from 'react'
import { withRouter } from 'react-router-dom'
import styled from 'styled-components'
import { AutoRow, RowBetween, RowFixed } from '../Row'
import { AutoColumn } from '../Column'
import { TYPE } from '../../Theme'
import { ButtonLight, ButtonFaded } from '../ButtonStyled'
import { useSavedAccounts, useSavedPairs, useSavedTokens } from '../../contexts/LocalStorage'
import { isAddress } from '../../utils'
import { X, Bookmark, ChevronRight } from 'react-feather'
import { Hover } from '..'
import TokenLogo from '../TokenLogo'

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
  width: 180px;
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

const SavedButton = styled(RowBetween)`
  padding-bottom: 20px;
  border-bottom: ${({ theme, open }) => open && '1px solid' + theme.bg3};
  margin-bottom: 2rem;

  :hover {
    cursor: pointer;
  }
`

function PinnedData({ history, open, setSavedOpen }) {
  const [accountValue, setAccountValue] = useState()

  const [savedAccounts, addAccount, removeAccount] = useSavedAccounts()

  const [savedPairs, , removePair] = useSavedPairs()

  const [savedTokens, , removeToken] = useSavedTokens()

  function handleAccountSearch() {
    if (isAddress(accountValue)) {
      history.push('/account/' + accountValue)
      if (!savedAccounts.includes(accountValue)) {
        addAccount(accountValue)
      }
    }
  }

  return !open ? (
    <SavedButton open={open} onClick={() => setSavedOpen(true)}>
      <Bookmark />
      <TYPE.main ml={'4px'}>Saved</TYPE.main>
    </SavedButton>
  ) : (
    <AutoColumn gap="1rem">
      <SavedButton onClick={() => setSavedOpen(false)} open={open}>
        <RowFixed>
          <Bookmark />
          <TYPE.main ml={'4px'}>Saved</TYPE.main>
        </RowFixed>
        <ChevronRight />
      </SavedButton>
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
      <AutoColumn gap="40px" style={{ marginTop: '2rem' }}>
        <AutoColumn gap={'12px'}>
          <TYPE.main>Pinned Pairs</TYPE.main>
          {Object.keys(savedPairs).filter(key => {
            return !!savedPairs[key]
          }).length > 0 ? (
            Object.keys(savedPairs)
              .filter(address => {
                return !!savedPairs[address]
              })
              .map(address => {
                const pair = savedPairs[address]
                return (
                  <RowBetween key={pair.address}>
                    <ButtonFaded onClick={() => history.push('/pair/' + address)}>
                      <RowFixed>
                        <TYPE.header>
                          {pair.token0Symbol} / {pair.token1Symbol}
                        </TYPE.header>
                      </RowFixed>
                    </ButtonFaded>
                    <Hover onClick={() => removePair(pair.address)}>
                      <X size={16} />
                    </Hover>
                  </RowBetween>
                )
              })
          ) : (
            <TYPE.light>Pinned pairs will appear here.</TYPE.light>
          )}
        </AutoColumn>
        <AutoColumn gap={'12px'}>
          <TYPE.main>Pinned Tokens</TYPE.main>
          {Object.keys(savedTokens).filter(key => {
            return !!savedTokens[key]
          }).length > 0 ? (
            Object.keys(savedTokens)
              .filter(address => {
                return !!savedTokens[address]
              })
              .map(address => {
                const token = savedTokens[address]
                return (
                  <RowBetween key={address}>
                    <ButtonFaded onClick={() => history.push('/token/' + address)}>
                      <RowFixed>
                        <TokenLogo address={address} size={'14px'} />
                        <TYPE.header ml={'6px'}>{token.symbol}</TYPE.header>
                      </RowFixed>
                    </ButtonFaded>
                    <Hover onClick={() => removeToken(address)}>
                      <X size={16} />
                    </Hover>
                  </RowBetween>
                )
              })
          ) : (
            <TYPE.light>Pinned pairs will appear here.</TYPE.light>
          )}
        </AutoColumn>
      </AutoColumn>
    </AutoColumn>
  )
}

export default withRouter(PinnedData)
