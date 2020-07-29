import React from 'react'
import 'feather-icons'

import { TYPE } from '../Theme'
import Panel from '../components/Panel'
import { useAllPairData } from '../contexts/PairData'
import PairList from '../components/PairList'
import { PageWrapper } from '../components'

function AllPairsPage() {
  const allPairs = useAllPairData()

  return (
    <PageWrapper>
      <TYPE.main fontSize={'1.125rem'} style={{ marginTop: '2rem', marginBottom: '1rem' }}>
        All Pairs
      </TYPE.main>
      <Panel style={{ marginTop: '6px' }}>
        <PairList pairs={allPairs} disbaleLinks={true} maxItems={50} />
      </Panel>
    </PageWrapper>
  )
}

export default AllPairsPage
