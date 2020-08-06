import React, { useEffect } from 'react'
import 'feather-icons'

import { TYPE } from '../Theme'
import Panel from '../components/Panel'
import { useAllPairData } from '../contexts/PairData'
import PairList from '../components/PairList'
import { PageWrapper, FullWrapper, FixedMenu } from '../components'
import { RowBetween } from '../components/Row'

function AllPairsPage() {
  const allPairs = useAllPairData()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <PageWrapper>
      <FixedMenu>
        <RowBetween>
          <TYPE.largeHeader>Top Pairs</TYPE.largeHeader>
          <div />
        </RowBetween>
      </FixedMenu>
      <FullWrapper>
        <Panel>
          <PairList pairs={allPairs} disbaleLinks={true} maxItems={50} />
        </Panel>
      </FullWrapper>
    </PageWrapper>
  )
}

export default AllPairsPage
