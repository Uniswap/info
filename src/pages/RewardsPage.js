import React, { useState, useEffect } from 'react'
import 'feather-icons'
import { withRouter } from 'react-router-dom'
import styled from 'styled-components'
import Panel from '../components/Panel'

import Loader from '../components/LocalLoader'
import { RowBetween } from '../components/Row'

import { TYPE, ThemedBackground } from '../Theme'
import { transparentize } from 'polished'

import { useMedia } from 'react-use'

import { PageWrapper, ContentWrapper } from '../components'

import RewardsList from '../components/RewardsList'

import { useRewards } from '../contexts/Rewards'

const DashboardWrapper = styled.div`
  width: 100%;
`

const WarningGrouping = styled.div`
  opacity: ${({ disabled }) => disabled && '0.4'};
  pointer-events: ${({ disabled }) => disabled && 'none'};
`

function RewardsPage() {
  useEffect(() => {
    document.querySelector('body').scrollTo(0, 0)
  }, [])
  const [data, setData] = useState([])

  const rewards = useRewards()

  const below1080 = useMedia('(max-width: 1080px)')

  useEffect(() => {
    window.scrollTo({
      behavior: 'smooth',
      top: 0
    })
  }, [])

  useEffect(() => {
    setData(rewards)
  }, [rewards])

  return (
    <PageWrapper>
      <ThemedBackground backgroundColor={transparentize(0.6, '#ff007a')} />

      <ContentWrapper>
        <WarningGrouping>
          <DashboardWrapper style={{ marginTop: below1080 ? '0' : '1rem' }}>
            <RowBetween mt={40} mb={'1rem'}>
              <TYPE.main fontSize={'1.125rem'}>Providers</TYPE.main> <div />
            </RowBetween>
            <Panel rounded>{data ? <RewardsList color={'#ff007a'} rewards={data} /> : <Loader />}</Panel>
          </DashboardWrapper>
        </WarningGrouping>
      </ContentWrapper>
    </PageWrapper>
  )
}

export default withRouter(RewardsPage)
