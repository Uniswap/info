import React, { useEffect, useState } from 'react'
import 'feather-icons'

import { TYPE } from '../Theme'
import Panel from '../components/Panel'
import { useAllPairData } from '../contexts/PairData'
import PairList from '../components/PairList'
import { PageWrapper, FullWrapper } from '../components'
import { RowBetween, AutoRow } from '../components/Row'
import Search from '../components/Search'
import { useMedia } from 'react-use'
import styled from 'styled-components'
import QuestionHelper from '../components/QuestionHelper'

const TextSwitch = styled(TYPE.main)`
  cursor: pointer;

  color: ${({ theme, active }) => (active ? theme.text1 : theme.text3)} 

  :hover {
    opacity: 0.6;
  }
`

function AllPairsPage() {
  const allPairs = useAllPairData()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const below800 = useMedia('(max-width: 800px)')

  const [useTracked, setUseTracked] = useState(true)

  return (
    <PageWrapper>
      <FullWrapper>
        <RowBetween>
          <TYPE.largeHeader>Top Pairs</TYPE.largeHeader>
          {!below800 && <Search small={true} />}
        </RowBetween>
        <AutoRow gap="4px">
          <TextSwitch active={useTracked} onClick={() => setUseTracked(true)}>
            Tracked
          </TextSwitch>
          <TYPE.main>/</TYPE.main>{' '}
          <TextSwitch active={!useTracked} onClick={() => setUseTracked(false)}>
            Untracked
          </TextSwitch>
          <QuestionHelper text="Untracked USD values may be inaccurate due to low liquidity ETH or stablecoin pairs." />
        </AutoRow>
        <Panel style={{ padding: below800 && '1rem 0 0 0 ' }}>
          <PairList pairs={allPairs} disbaleLinks={true} maxItems={50} useTracked={useTracked} />
        </Panel>
      </FullWrapper>
    </PageWrapper>
  )
}

export default AllPairsPage
