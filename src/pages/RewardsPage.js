import React, { useState, useEffect } from 'react'
import 'feather-icons'
import { withRouter } from 'react-router-dom'
import { Text } from 'rebass'
import styled from 'styled-components'
import Panel from '../components/Panel'
import TokenLogo from '../components/TokenLogo'

import Loader from '../components/LocalLoader'
import { AutoRow, RowBetween, RowFixed } from '../components/Row'
import { AutoColumn } from '../components/Column'
import TxnList from '../components/TxnList'
import TokenChart from '../components/TokenChart'
import { BasicLink } from '../components/Link'
import Search from '../components/Search'
import { safeAccess } from '../utils'

import { TYPE, ThemedBackground } from '../Theme'
import { transparentize } from 'polished'

import { useMedia } from 'react-use'

import { PageWrapper, ContentWrapper } from '../components'

import FormattedName from '../components/FormattedName'
import { useToken } from '../contexts/TokenData2'
import { useHistoryForAsset } from '../contexts/History'
import { useLiquidityForAsset } from '../contexts/Liquidity'
import { useProviders } from '../contexts/Providers'
import ProvidersList from '../components/ProvidersList'
import RewardsList from '../components/RewardsList'

import { useRewards } from '../contexts/Rewards'

const DashboardWrapper = styled.div`
  width: 100%;
`

const PanelWrapper = styled.div`
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: max-content;
  gap: 6px;
  display: inline-grid;
  width: 100%;
  align-items: start;
  @media screen and (max-width: 1024px) {
    grid-template-columns: 1fr;
    align-items: stretch;
    > * {
      grid-column: 1 / 4;
    }

    > * {
      &:first-child {
        width: 100%;
      }
    }
  }
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
