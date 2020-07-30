import React from 'react'
import { withRouter } from 'react-router-dom'
import styled from 'styled-components'
import { RowBetween, AutoRow, RowFixed } from '../Row'
import Title from '../Title'
import Search from '../Search'
import { BasicLink } from '../Link'
import { useMedia } from 'react-use'
import Logo from '../../assets/logo.svg'

const Wrapper = styled.div`
  background-color: ${({ theme }) => theme.bg1};
  color: ${({ theme }) => theme.text1};
  padding: 1.5rem 2rem;
  position: sticky;
  top: 32px;
  z-index: 9999;
  border-bottom: 1px solid ${({ theme }) => theme.bg3};

  @media screen and (max-width: 800px) {
    grid-template-columns: 1fr;
  }

  @media screen and (max-width: 600px) {
    padding: 1rem;
  }
`

const Option = styled.div`
  font-weight: 500;
  color: ${({ theme, activeText }) => (activeText ? theme.text1 : theme.text3)};
`

const MobileWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`

function SubHeader({ history }) {
  const below1080 = useMedia('(max-width: 1080px)')
  const below600 = useMedia('(max-width: 600px)')

  return (
    <Wrapper>
      {!below600 ? (
        <RowBetween>
          <RowFixed>
            <Title />
            {!below1080 && (
              <AutoRow gap="0.5rem" style={{ marginLeft: '1rem' }}>
                <BasicLink to="/home">
                  <Option activeText={history.location.pathname === '/home' ?? undefined}>Overview</Option>
                </BasicLink>
                <BasicLink to="/all-pairs">
                  <Option activeText={history.location.pathname === '/all-pairs' ?? undefined}>Pairs</Option>
                </BasicLink>
                <BasicLink to="/all-tokens">
                  <Option activeText={history.location.pathname === '/all-tokens' ?? undefined}>Tokens</Option>
                </BasicLink>
                <BasicLink to="/account-lookup">
                  <Option activeText={history.location.pathname === '/account-lookup' ?? undefined}>Accounts</Option>
                </BasicLink>
              </AutoRow>
            )}
          </RowFixed>
          {!below600 && <Search small={true} />}
        </RowBetween>
      ) : (
        <MobileWrapper>
          <img src={Logo} alt={'logo'} onClick={() => history.push('/home')} />
          <Search small={true} />
        </MobileWrapper>
      )}
    </Wrapper>
  )
}

export default withRouter(SubHeader)
