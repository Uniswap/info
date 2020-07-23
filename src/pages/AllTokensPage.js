import React from 'react'
import 'feather-icons'
import styled from 'styled-components'

import TopTokenList from '../components/TokenList'
import { TYPE } from '../Theme'
import { Search } from '../components/Search'
import { useMedia } from 'react-use'
import Panel from '../components/Panel'
import { useAllTokenData } from '../contexts/TokenData'

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-bottom: 100px;
  width: calc(100% - 20px);
  overflow: scroll;
  & > * {
    width: 100%;
    max-width: 1240px;
  }

  @media screen and (max-width: 1080px) {
    width: calc(100% - 40px);
    padding: 0 20px;
  }
`

const ThemedBackground = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 200vh;
  max-width: 100vw;
  z-index: -1;

  transform: translateY(-70vh);
  background: ${({ theme }) => theme.background};
`

function AllTokensPage() {
  const allTokens = useAllTokenData()
  const below1080 = useMedia('(max-width: 1080px)')
  const below600 = useMedia('(max-width: 600px)')

  return (
    <PageWrapper>
      <ThemedBackground />
      <Search small={!!below600} />
      {!below1080 && (
        <TYPE.main fontSize={'1.125rem'} style={{ marginTop: '3rem', marginBottom: '1rem' }}>
          All Tokens
        </TYPE.main>
      )}
      <Panel style={{ marginTop: '6px' }}>
        <TopTokenList tokens={allTokens} itemMax={50} />
      </Panel>
    </PageWrapper>
  )
}

export default AllTokensPage
