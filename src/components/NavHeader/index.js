import React from 'react'
import styled from 'styled-components'

import Title from '../Title'
import { RowBetween, RowFixed } from '../Row'
import { AutoColumn } from '../Column'
import { useMedia } from 'react-use'
import { Text } from 'rebass'
import { Link } from '../../Theme'

const Header = styled.div`
  width: calc(100% - 80px);
  padding: 32px 40px;
  max-width: 1000px;

  @media screen and (max-width: 640px) {
    width: calc(100% - 40px);
    padding: 32px 20px;
  }
`

const DarkButton = styled.div`
  padding: 12px 24px;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  margin-right: 20px;

  :hover {
    cursor: pointer;
    opacity: 0.8;
  }
`

const PinkButton = styled(DarkButton)`
  background-color: #ff007a;
`

export default function NavHeader({ token, pair }) {
  const below600 = useMedia('(max-width: 600px)')

  return below600 ? (
    <Header>
      <AutoColumn gap="20px">
        <Title token={token} pair={pair} />
      </AutoColumn>
    </Header>
  ) : (
    <Header>
      <RowBetween>
        <Title token={token} pair={pair} />
        <RowFixed>
          <Link href="https://v1.uniswap.info">
            <DarkButton>
              <Text fontWeight={600} color="white">
                V1 Analytics →
              </Text>
            </DarkButton>
          </Link>
          <Link href="https://www.uniswap.info">
            <PinkButton>
              <Text fontWeight={600} color="white">
                Launch V2 Analytics →
              </Text>
            </PinkButton>
          </Link>
        </RowFixed>
      </RowBetween>
    </Header>
  )
}
