import React, { useEffect } from 'react'
import 'feather-icons'

import TopTokenList from '../components/TokenList'
import { TYPE } from '../Theme'
import Panel from '../components/Panel'
import { PageWrapper, FullWrapper } from '../components'
import { RowBetween } from '../components/Row'
import Search from '../components/Search'
import { useMedia } from 'react-use'
import { useParams } from 'react-router-dom'

function AllTokensPage() {
  const { network: currentNetworkURL } = useParams()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const below600 = useMedia('(max-width: 800px)')

  return (
    <PageWrapper>
      <FullWrapper>
        <RowBetween>
          <TYPE.largeHeader>Top Tokens</TYPE.largeHeader>
          {currentNetworkURL && !below600 && <Search small={true} />}
        </RowBetween>
        <Panel style={{ padding: '0' }}>
          <TopTokenList itemMax={15} />
        </Panel>
      </FullWrapper>
    </PageWrapper>
  )
}

export default AllTokensPage
