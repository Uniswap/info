import React, { useEffect } from 'react'
import 'feather-icons'

import TopTokenList from '../components/TokenList'
import { TYPE } from '../Theme'
import Panel from '../components/Panel'
import { useAllTokenData } from '../contexts/TokenData'
import { PageWrapper, FullWrapper, FixedMenu } from '../components'
import { RowBetween } from '../components/Row'

function AllTokensPage() {
  const allTokens = useAllTokenData()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <PageWrapper>
      <FixedMenu>
        <RowBetween>
          <TYPE.largeHeader>Top Tokens</TYPE.largeHeader>
          <div />
        </RowBetween>
      </FixedMenu>
      <FullWrapper>
        <Panel style={{ marginTop: '6px' }}>
          <TopTokenList tokens={allTokens} itemMax={50} />
        </Panel>
      </FullWrapper>
    </PageWrapper>
  )
}

export default AllTokensPage
