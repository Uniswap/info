import React, { useEffect } from 'react'
import 'feather-icons'

import TopTokenList from '../components/TokenList'
import { TYPE } from '../Theme'
import Panel from '../components/Panel'
import { PageWrapper, FullWrapper } from '../components'
import { RowBetween } from '../components/Row'
import { useMedia } from 'react-use'
import { useAllTokens } from '../contexts/TokenData'

function AllTokensPage() {
  const tokens = useAllTokens()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const below600 = useMedia('(max-width: 800px)')

  return (
    <PageWrapper>
      <FullWrapper>
        <RowBetween>
          <TYPE.largeHeader>Top Assets</TYPE.largeHeader>
        </RowBetween>
        <Panel style={{ marginTop: '6px', padding: below600 && '1rem 0 0 0 ' }}>
          <TopTokenList tokens={Object.values(tokens)} itemMax={50} />
        </Panel>
      </FullWrapper>
    </PageWrapper>
  )
}

export default AllTokensPage
