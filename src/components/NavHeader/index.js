import React from 'react'
import styled from 'styled-components'

import Title from '../Title'
import { RowBetween } from '../Row'
import { AutoColumn } from '../Column'
import { useMedia } from 'react-use'

const Header = styled.div`
  width: calc(100% - 80px);
  padding: 32px 40px;
  max-width: 1240px;

  @media screen and (max-width: 640px) {
    width: calc(100% - 40px);
    padding: 32px 20px;
  }
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
      </RowBetween>
    </Header>
  )
}
