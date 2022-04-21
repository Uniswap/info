import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ButtonLight, ButtonFaded } from 'components/ButtonStyled'
import { AutoRow, RowBetween } from 'components/Row'
import { isAddress } from 'utils'
import { useSavedAccounts } from 'state/features/user/hooks'
import { AutoColumn } from 'components/Column'
import { TYPE } from 'Theme'
import { Hover, StyledIcon, Divider } from 'components'
import Panel from 'components/Panel'
import { useFormatPath } from 'hooks'
import { Flex } from 'rebass'
import { X } from 'react-feather'
import { useMedia } from 'react-use'
import { useTranslation } from 'react-i18next'
import { AccountLink, DashGrid, Input, Wrapper } from './styled'

type Props = {
  small?: boolean
}

function AccountSearch({ small }: Props) {
  const { t } = useTranslation()
  const formatPath = useFormatPath()
  const navigate = useNavigate()
  const [accountValue, setAccountValue] = useState<string | undefined>()
  const [savedAccounts, addAccount, removeAccount] = useSavedAccounts()
  const below440 = useMedia('(max-width: 440px)')

  function handleAccountSearch() {
    if (accountValue && isAddress(accountValue)) {
      navigate(formatPath(`/accounts/${accountValue}`))
      if (!savedAccounts.includes(accountValue)) {
        addAccount(accountValue)
      }
    }
  }

  return (
    <AutoColumn gap={'1rem'}>
      {!small && (
        <AutoRow style={below440 ? { flexDirection: 'column' } : {}}>
          <Wrapper>
            <Input
              style={below440 ? { marginRight: '0px' } : {}}
              placeholder="0x..."
              onChange={(e: any) => {
                setAccountValue(e.target.value)
              }}
            />
          </Wrapper>
          <ButtonLight style={below440 ? { width: '100%', marginTop: '1rem' } : {}} onClick={handleAccountSearch}>
            {t('loadAccountDetails')}
          </ButtonLight>
        </AutoRow>
      )}

      <AutoColumn gap={'12px'}>
        {!small && (
          <Panel>
            <DashGrid>
              <TYPE.main area="account">{t('savedAccounts')}</TYPE.main>
            </DashGrid>
            <Divider />
            {savedAccounts?.length > 0 ? (
              savedAccounts.map(account => {
                return (
                  <DashGrid key={account} padding="1rem 0 0 0">
                    <Flex justifyContent="space-between">
                      <AccountLink as={Link} to={formatPath(`/accounts/${account}`)}>
                        {account?.slice(0, 42)}
                      </AccountLink>
                      <Hover onClick={() => removeAccount(account)}>
                        <StyledIcon>
                          <X size={16} />
                        </StyledIcon>
                      </Hover>
                    </Flex>
                  </DashGrid>
                )
              })
            ) : (
              <TYPE.light style={{ marginTop: '1rem' }}>{t('noSavedAccounts')}</TYPE.light>
            )}
          </Panel>
        )}

        {small && (
          <>
            <TYPE.main>{t('accounts')}</TYPE.main>
            {savedAccounts?.length > 0 ? (
              savedAccounts.map(account => {
                return (
                  <RowBetween key={account}>
                    <ButtonFaded as={Link} to={formatPath(`/accounts/${account}`)}>
                      {small ? (
                        <TYPE.header>{account?.slice(0, 6) + '...' + account?.slice(38, 42)}</TYPE.header>
                      ) : (
                        <AccountLink>{account?.slice(0, 42)}</AccountLink>
                      )}
                    </ButtonFaded>
                    <Hover onClick={() => removeAccount(account)}>
                      <StyledIcon>
                        <X size={16} />
                      </StyledIcon>
                    </Hover>
                  </RowBetween>
                )
              })
            ) : (
              <TYPE.light>{t('noPinnedWallets')}</TYPE.light>
            )}
          </>
        )}
      </AutoColumn>
    </AutoColumn>
  )
}

export default AccountSearch
