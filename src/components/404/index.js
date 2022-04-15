import React from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import MaintenanceImg from '../../assets/404.svg'
import MaintenanceImgWhite from '../../assets/404white.svg'
import { useDarkModeManager } from '../../contexts/LocalStorage'

const StyledLink = styled(Link)`
  text-decoration: none;
  cursor: pointer;
  color: ${({ theme }) => theme.primary};
  font-weight: 500;

  :hover {
    text-decoration: underline;
  }

  :focus {
    outline: none;
    text-decoration: underline;
  }

  :active {
    text-decoration: none;
  }
`

const Wrapper = styled.div`
  max-width: 992px;
  margin: auto;
  padding: 60px 16px;

  ${'' /* ${({ theme }) => theme.mediaWidth.upToMedium`
    padding: 1rem;
  `} */}
`

const Content = styled.div`
  text-align: center;
  margin-top: 60px;
`

const Title = styled.div`
  color: ${({ theme }) => theme.warning};
  font-size: 20px;
  font-weight: 500;
  margin: 40px 0;
`

const Message = styled.div`
  color: ${({ theme }) => theme.text};
  font-size: 16px;
  max-width: 600px;
  font-weight: 400;
  margin: auto;
  margin-bottom: 40px;
`

const ButtonText = styled.span`
  font-size: 18px;
  font-weight: 500;
  color: '#3A3A3A';
`

const Page404 = ({ type, currentChainName, availableChains, redirectLink }) => {
  const [isDarkMode] = useDarkModeManager()

  let message, linkMessage
  const availableChainElement = availableChains
    ?.map(availableChain => (
      <Link to={'/' + availableChain.urlKey + '/'} key={availableChain.chainId}>
        {availableChain.name}
      </Link>
    ))
    .reduce((accu, elem) => (accu ? [elem] : [...accu, ', ', elem]), null) //join with comma
  message = (
    <>
      This {type}’s address is not available on {currentChainName}.
      {availableChainElement && (
        <>
          <br />
          This address is only available on {availableChains}
        </>
      )}
    </>
  )
  linkMessage = <>You can go back to {type}s list</>

  return (
    <Wrapper>
      <Content>
        <img src={isDarkMode ? MaintenanceImg : MaintenanceImgWhite} width='100%' alt='maintain' style={{ maxWidth: '456px' }} />
        <Title>This {type}’s address is not available</Title>

        <Message>{message}</Message>

        <StyledLink to={String(redirectLink)}>
          <ButtonText>{linkMessage}</ButtonText>
        </StyledLink>
      </Content>
    </Wrapper>
  )
}

export default Page404
