import styled from 'styled-components/macro'

import { Flex } from 'rebass'
import { RowFixed } from '../Row'
import { Link } from 'react-router-dom'
import { useFormatPath } from 'hooks'
import Logo from '../../assets/logo_full.svg'

const TitleWrapper = styled(Link)`
  text-decoration: none;
  margin: 1.25rem 1.5rem;

  &:hover {
    cursor: pointer;
  }

  z-index: 10;
`

export default function Title() {
  const formatPath = useFormatPath()

  return (
    <TitleWrapper to={formatPath('/')}>
      <Flex alignItems="center">
        <RowFixed>
          <img src={Logo} alt="logo" />
        </RowFixed>
      </Flex>
    </TitleWrapper>
  )
}
