import { Link } from 'react-router-dom'
import styled from 'styled-components/macro'
import { RowBetween, RowFixed } from '../Row'
import { AutoColumn } from '../Column'
import { TYPE } from '../../Theme'
import { useSavedTokens, useSavedPairs } from '../../contexts/LocalStorage'
import { useFormatPath } from 'hooks'
import { Hover } from '..'
import TokenLogo from '../TokenLogo'
import AccountSearch from '../AccountSearch'
import { Bookmark, ChevronRight, X } from 'react-feather'
import { ButtonFaded } from '../ButtonStyled'
import FormattedName from '../FormattedName'
import { useTranslation } from 'react-i18next'

const RightColumn = styled.div`
  position: fixed;
  right: 0;
  top: 0;
  height: 100vh;
  width: ${({ open }) => (open ? '12.5rem' : '4rem')};
  padding: 1.25rem;
  border-left: ${({ theme }) => '1px solid' + theme.bg3};
  background-color: ${({ theme }) => theme.bg1};
  z-index: 9999;
  overflow: auto;

  :hover {
    cursor: pointer;
  }
`

const SavedButton = styled(RowBetween)`
  padding-bottom: ${({ open }) => open && '20px'};
  border-bottom: ${({ theme, open }) => open && '1px solid' + theme.bg3};
  margin-bottom: ${({ open }) => open && '1.25rem'};

  :hover {
    cursor: pointer;
  }
`

const ScrollableDiv = styled(AutoColumn)`
  overflow: auto;
  padding-bottom: 60px;
`

const StyledIcon = styled.div`
  color: ${({ theme }) => theme.text2};
`

function PinnedData({ open, setSavedOpen }) {
  const { t } = useTranslation()
  const formatPath = useFormatPath()

  const [savedPairs, , removePair] = useSavedPairs()
  const [savedTokens, , removeToken] = useSavedTokens()

  return !open ? (
    <RightColumn open={open} onClick={() => setSavedOpen(true)}>
      <SavedButton open={open}>
        <StyledIcon>
          <Bookmark size={20} />
        </StyledIcon>
      </SavedButton>
    </RightColumn>
  ) : (
    <RightColumn gap="1rem" open={open}>
      <SavedButton onClick={() => setSavedOpen(false)} open={open}>
        <RowFixed>
          <StyledIcon>
            <Bookmark size={16} />
          </StyledIcon>
          <TYPE.main ml={'4px'}>{t('saved')}</TYPE.main>
        </RowFixed>
        <StyledIcon>
          <ChevronRight />
        </StyledIcon>
      </SavedButton>
      <AccountSearch small={true} />
      <AutoColumn gap="40px" style={{ marginTop: '2rem' }}>
        <AutoColumn gap={'12px'}>
          <TYPE.main>{t('pinnedPairs')}</TYPE.main>
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
                    <ButtonFaded as={Link} to={formatPath(`/pairs/${address}`)}>
                      <RowFixed>
                        <TYPE.header>
                          <FormattedName
                            text={pair.token0Symbol + '/' + pair.token1Symbol}
                            maxCharacters={12}
                            fontSize={'12px'}
                          />
                        </TYPE.header>
                      </RowFixed>
                    </ButtonFaded>
                    <Hover onClick={() => removePair(pair.address)}>
                      <StyledIcon>
                        <X size={16} />
                      </StyledIcon>
                    </Hover>
                  </RowBetween>
                )
              })
          ) : (
            <TYPE.light>{t('pinnedPairsHere')}</TYPE.light>
          )}
        </AutoColumn>
        <ScrollableDiv gap={'12px'}>
          <TYPE.main>{t('pinnedTokens')}</TYPE.main>
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
                    <ButtonFaded as={Link} to={formatPath(`/tokens/${address}`)}>
                      <RowFixed>
                        <TokenLogo address={address} size={'14px'} />
                        <TYPE.header ml={'6px'}>
                          <FormattedName text={token.symbol} maxCharacters={12} fontSize={'12px'} />
                        </TYPE.header>
                      </RowFixed>
                    </ButtonFaded>
                    <Hover onClick={() => removeToken(address)}>
                      <StyledIcon>
                        <X size={16} />
                      </StyledIcon>
                    </Hover>
                  </RowBetween>
                )
              })
          ) : (
            <TYPE.light>{t('pinnedTokensHere')}</TYPE.light>
          )}
        </ScrollableDiv>
      </AutoColumn>
    </RightColumn>
  )
}

export default PinnedData
