import React, { useState } from 'react'
import 'feather-icons'
import { useParams, withRouter } from 'react-router-dom'
import styled from 'styled-components'
import { ButtonDark } from '../ButtonStyled'
import { isAddress } from '../../utils'
import { useSavedAccounts } from '../../contexts/LocalStorage'
import { AutoColumn } from '../Column'
import { TYPE } from '../../Theme'
import { Hover, StyledIcon } from '..'
import Panel from '../Panel'
import { Divider } from '..'
import { Flex, Text } from 'rebass'

import { X } from 'react-feather'
import { NETWORK_INFOS } from '../../constants/networks'
import { useNetworksInfo } from '../../contexts/NetworkInfo'
import { BasicLink } from '../Link'
import { RowFixed } from '../Row'

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
  border-radius: 8px;
  color: ${({ theme }) => theme.text};
  background-color: ${({ theme }) => theme.background};
  font-size: 16px;
  border: 1px solid ${({ theme }) => theme.border};

  ::placeholder {
    color: ${({ theme }) => theme.text3};
    font-size: 12px;
  }
`
const Wrapper = styled.div`
  ${({ isWrap, theme }) =>
    isWrap
      ? `
  justify-content: space-between;
  background-color: ${theme.bg4};
  border-radius: 24px;
  padding: 8px;
  `
      : ''}
  color: ${({ theme }) => theme.text10};
`

const AccountLink = styled.span`
  cursor: pointer;
  ${({ isSmall, theme }) => !isSmall && `color: ${theme.primary};`}
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

function AccountSearch({ history, small, shortenAddress }) {
  const [accountValue, setAccountValue] = useState()
  const [savedAccounts, addAccount, removeAccount] = useSavedAccounts()
  const [[networkInfo]] = useNetworksInfo()

  function handleAccountSearch() {
    if (isAddress(accountValue.trim())) {
      history.push('/' + networkInfo.urlKey + '/account/' + accountValue.trim())
      addAccount(accountValue.trim(), networkInfo.chainId)
    }
  }

  return (
    <AutoColumn gap={'1rem'}>
      {!small && (
        <Flex sx={{ gap: '1rem' }}>
          <Input
            placeholder='Search Wallet/Account...'
            onChange={e => {
              setAccountValue(e.target.value)
            }}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                handleAccountSearch(e.target.value.trim())
              }
            }}
          />
          <ButtonDark onClick={handleAccountSearch} style={{ height: '44px' }}>
            <Text>Analyze</Text>
          </ButtonDark>
        </Flex>
      )}

      <AutoColumn gap={'12px'}>
        <Panel
          style={{
            ...(small && {
              padding: 0,
              border: 'none',
            }),
          }}
        >
          <DashGrid center={true} style={{ height: 'fit-content', padding: '0 0 1rem 0' }}>
            <TYPE.main area='account'>Saved Accounts</TYPE.main>
          </DashGrid>
          {!small && <Divider />}
          {savedAccounts?.length > 0 ? (
            savedAccounts.map(account => {
              return (
                <DashGrid key={account.address} center={true} style={{ height: 'fit-content', padding: '1rem 0 0 0' }}>
                  <Flex area='account' justifyContent='space-between'>
                    <Wrapper isWrap={small}>
                      <BasicLink to={'/' + NETWORK_INFOS[account.chainId]?.urlKey + '/account/' + account.address}>
                        <RowFixed>
                          {small && <img src={NETWORK_INFOS[account.chainId].icon} width='16px' style={{ marginRight: '4px' }} />}
                          <AccountLink isSmall={small}>
                            {shortenAddress || small
                              ? `${account.address?.slice(0, 6) + '...' + account.address?.slice(38, 42)}`
                              : account.address?.slice(0, 42)}
                          </AccountLink>
                        </RowFixed>
                      </BasicLink>
                    </Wrapper>

                    <Hover
                      onClick={e => {
                        e.stopPropagation()
                        removeAccount(account.address, account.chainId)
                      }}
                    >
                      <StyledIcon>
                        <X size={16} />
                      </StyledIcon>
                    </Hover>
                  </Flex>
                </DashGrid>
              )
            })
          ) : (
            <TYPE.light style={{ marginTop: '1rem' }}>No saved accounts</TYPE.light>
          )}
        </Panel>
      </AutoColumn>
    </AutoColumn>
  )
}

export default withRouter(AccountSearch)
