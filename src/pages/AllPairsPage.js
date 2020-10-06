import React, { Fragment, useEffect, useState } from 'react'
import 'feather-icons'

import { TYPE } from '../Theme'
import Panel from '../components/Panel'
import { useAllPairData } from '../contexts/PairData'
import PairList from '../components/PairList'
import { PageWrapper, FullWrapper } from '../components'
import { RowBetween, RowFixed } from '../components/Row'
import Search from '../components/Search'
import { useMedia } from 'react-use'
import { OptionButton } from '../components/ButtonStyled'
import { PERIODS } from '../constants'

function AllPairsPage() {
  const allPairs = useAllPairData()
  const [period, setPeriod] = useState(PERIODS.DAY)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const below800 = useMedia('(max-width: 800px)')

  return (
    <PageWrapper>
      <FullWrapper>
        <RowBetween>
          <RowFixed>
            <TYPE.largeHeader style={{ marginRight: '1rem' }}>Top Pairs</TYPE.largeHeader>
            <RowFixed>
              <OptionButton active={period === PERIODS.DAY} onClick={() => setPeriod(PERIODS.DAY)}>
                <TYPE.body>24hrs</TYPE.body>
              </OptionButton>
              <OptionButton
                style={{ marginLeft: '4px' }}
                active={period === PERIODS.WEEKLY}
                onClick={() => setPeriod(PERIODS.WEEKLY)}
              >
                <TYPE.body>Week</TYPE.body>
              </OptionButton>
            </RowFixed>
          </RowFixed>
          {!below800 && <Search small={true} />}
        </RowBetween>
        <Panel style={{ padding: below800 && '1rem 0 0 0 ' }}>
          <PairList pairs={allPairs} disbaleLinks={true} maxItems={50} period={period} />
        </Panel>
      </FullWrapper>
    </PageWrapper>
  )
}

export default AllPairsPage
