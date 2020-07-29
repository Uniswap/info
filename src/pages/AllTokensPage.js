import React from 'react'
import 'feather-icons'

import TopTokenList from '../components/TokenList'
import { TYPE } from '../Theme'
import Panel from '../components/Panel'
import { useAllTokenData } from '../contexts/TokenData'
import { PageWrapper } from '../components'

function AllTokensPage() {
  const allTokens = useAllTokenData()

  return (
    <PageWrapper>
      <TYPE.main fontSize={'1.125rem'} style={{ marginTop: '2rem', marginBottom: '1rem' }}>
        All Tokens
      </TYPE.main>
      <Panel style={{ marginTop: '6px' }}>
        <TopTokenList tokens={allTokens} itemMax={50} />
      </Panel>
    </PageWrapper>
  )
}

export default AllTokensPage
