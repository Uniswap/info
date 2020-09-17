import React, { useState, useEffect } from 'react'
import 'feather-icons'
import dayjs from 'dayjs'

import { withRouter } from 'react-router-dom'
import styled from 'styled-components'
import Panel from '../components/Panel'

import Loader from '../components/LocalLoader'
import { RowBetween, RowFixed } from '../components/Row'
import { OptionButton } from '../components/ButtonStyled'
import { TYPE, ThemedBackground } from '../Theme'
import { transparentize } from 'polished'

import { useMedia } from 'react-use'

import { PageWrapper, ContentWrapper } from '../components'

import RewardsList from '../components/RewardsList'

import { useRewards } from '../contexts/Rewards'

const REWARDS_WINDOW = {
  ALL: 'ALL',
  DAYS_14: 'DAYS_14'
}

const START_DAY = '2020-09-03'

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

  const [rewardsWindow, setRewardsWindow] = useState(REWARDS_WINDOW.ALL)

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
    if (rewardsWindow === REWARDS_WINDOW.ALL) {
      setData(rewards)
    } else {
      let startDate = dayjs(START_DAY)
      let endDate = startDate.add(14, 'day')

      const result = rewards
        .sort((a, b) => {
          return dayjs(a.date).valueOf() - dayjs(b.date).valueOf()
        })
        .reduce((summary, currentRecord) => {
          if (!dayjs(currentRecord.date).isBefore(endDate)) {
            startDate = endDate
            endDate = startDate.add(14, 'day')
          }
          return getReward(startDate, endDate, currentRecord, summary)
        }, {})

      setData(Object.values(result))
    }
  }, [rewards, rewardsWindow])

  return (
    <PageWrapper>
      <ThemedBackground backgroundColor={transparentize(0.6, '#ff007a')} />

      <ContentWrapper>
        <WarningGrouping>
          <DashboardWrapper style={{ marginTop: below1080 ? '0' : '1rem' }}>
            <RowBetween mt={40} mb={'1rem'}>
              <TYPE.main fontSize={'1.125rem'}>Rewards</TYPE.main> <div />
            </RowBetween>

            <RowFixed style={{ marginBottom: '1rem' }}>
              <OptionButton
                active={rewardsWindow === REWARDS_WINDOW.ALL}
                onClick={() => setRewardsWindow(REWARDS_WINDOW.ALL)}
                style={{ marginRight: '0.1rem' }}
              >
                <TYPE.body>ALL</TYPE.body>
              </OptionButton>{' '}
              <OptionButton
                active={rewardsWindow === REWARDS_WINDOW.DAYS_14}
                onClick={() => setRewardsWindow(REWARDS_WINDOW.DAYS_14)}
              >
                <TYPE.body>2 Weeks</TYPE.body>
              </OptionButton>
            </RowFixed>

            <Panel rounded>{data ? <RewardsList color={'#ff007a'} rewards={data} /> : <Loader />}</Panel>
          </DashboardWrapper>
        </WarningGrouping>
      </ContentWrapper>
    </PageWrapper>
  )
}

export default withRouter(RewardsPage)

const getReward = (startDate, endDate, currentRecord, summary) => {
  const period = `From ${dayjs(startDate).format('YYYY-MM-DD')} to ${dayjs(endDate).format('YYYY-MM-DD')}`
  const key = `${currentRecord.name}_${period}`
  const result = { ...summary }

  if (result[key]) {
    result[key] = {
      ...result[key],
      reward: result[key].reward + currentRecord.reward,
      usd: result[key].usd + currentRecord.usd,
      date: period
    }
  } else {
    result[key] = {
      ...currentRecord,
      date: period
    }
  }

  return result
}
