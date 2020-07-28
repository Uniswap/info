import React from 'react'
import 'feather-icons'
import styled from 'styled-components'

import { TYPE } from '../Theme'
import { Search } from '../components/Search'
import { useMedia } from 'react-use'
import Panel from '../components/Panel'
import { useAllPairData } from '../contexts/PairData'
import PairList from '../components/PairList'

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

function AllPairsPage() {
  const allPairs = useAllPairData()
  const below1080 = useMedia('(max-width: 1080px)')
  const below600 = useMedia('(max-width: 600px)')

  return (
    <PageWrapper>
      <Search small={!!below600} />
      {!below1080 && (
        <TYPE.main fontSize={'1.125rem'} style={{ marginTop: '3rem', marginBottom: '1rem' }}>
          All Pairs
        </TYPE.main>
      )}
      <Panel style={{ marginTop: '6px' }}>
        <PairList pairs={allPairs} disbaleLinks={true} maxItems={50} />
      </Panel>
    </PageWrapper>
  )
}

export default AllPairsPage
