import React, { useEffect } from 'react'
import 'feather-icons'

import { TYPE } from '../Theme'
import Panel from '../components/Panel'
import { useAllPairData } from '../contexts/PairData'
import PairList from '../components/PairList'
import { PageWrapper, FullWrapper } from '../components'
import { RowBetween } from '../components/Row'
import Search from '../components/Search'
import { useMedia } from 'react-use'
import { useParams } from 'react-router-dom'

function AllPairsPage() {
  const allPairs = useAllPairData()
  const { network: currentNetworkURL } = useParams()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const below800 = useMedia('(max-width: 800px)')

  return (
    <PageWrapper>
      <FullWrapper>
        <RowBetween>
          <TYPE.largeHeader>Top Pairs</TYPE.largeHeader>
          {currentNetworkURL && !below800 && <Search small={true} />}
        </RowBetween>
        <Panel style={{ padding: '0' }}>
          <PairList pairs={allPairs} disbaleLinks={true} maxItems={15} />
        </Panel>
      </FullWrapper>
    </PageWrapper>
  )
}

export default AllPairsPage
