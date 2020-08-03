import React, { useEffect } from 'react'
import 'feather-icons'

import { TYPE } from '../Theme'
import Panel from '../components/Panel'
import { useAllPairData } from '../contexts/PairData'
import PairList from '../components/PairList'
import { PageWrapper, FullWrapper } from '../components'

function AllPairsPage() {
  const allPairs = useAllPairData()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <PageWrapper>
      <FullWrapper>
        <span>
          <TYPE.main fontSize={'1.125rem'} style={{ marginTop: '2rem', marginBottom: '1rem' }}>
            All Pairs
          </TYPE.main>
          <Panel style={{ marginTop: '6px' }}>
            <PairList pairs={allPairs} disbaleLinks={true} maxItems={50} />
          </Panel>
        </span>
      </FullWrapper>
    </PageWrapper>
  )
}

export default AllPairsPage
