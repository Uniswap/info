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

function AllPairsPage() {
  const allPairs = useAllPairData()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const below800 = useMedia('(max-width: 800px)')

  return (
    <PageWrapper>
      <FullWrapper>
        <RowBetween>
          <TYPE.largeHeader>Top Pairs</TYPE.largeHeader>
          {!below800 && <Search small={true} />}
        </RowBetween>
        <Panel style={{ padding: below800 && '1rem 0 0 0 ' }}>
          <PairList pairs={allPairs} disbaleLinks={true} maxItems={50} />
        </Panel>
      </FullWrapper>
    </PageWrapper>
  )
}

export default AllPairsPage
