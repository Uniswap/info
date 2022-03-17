import React from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import MaintenanceImg from '../../assets/404.svg'

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
  let message, linkMessage
  if (availableChains?.length) {
    const availableChainElement = availableChains
      .map(availableChain => (
        <Link to={'/' + availableChain.URL_KEY + '/'} key={availableChain.CHAIN_ID}>
          {availableChain.NAME}
        </Link>
      ))
      .reduce((accu, elem) => (accu ? [elem] : [...accu, ', ', elem]), null) //join with comma
    message = (
      <>
        This {type} is not available on {currentChainName}. This {type} is only available on these chain: {availableChainElement}
      </>
    )
    linkMessage = <>Or you can go back to {type}s list</>
  } else {
    message = <>This {type} is not available.</>
    linkMessage = <>You can go back to {type}s list</>
  }

  return (
    <Wrapper>
      <Content>
        <img src={MaintenanceImg} width='100%' alt='maintain' style={{ maxWidth: '456px' }} />
        <Title>Something went wrong!</Title>

        <Message>{message}</Message>

        <StyledLink to={String(redirectLink)}>
          <ButtonText>{linkMessage}</ButtonText>
        </StyledLink>
      </Content>
    </Wrapper>
  )
}

export default Page404
