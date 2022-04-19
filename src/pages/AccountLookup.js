import { useEffect } from 'react'
import { DashboardWrapper, TYPE } from '../Theme'
import { PageWrapper, FullWrapper } from '../components'
import LPList from '../components/LPList'
import styled from 'styled-components/macro'
import AccountSearch from '../components/AccountSearch'
import { useTopLps } from '../contexts/GlobalData'
import LocalLoader from '../components/LocalLoader'
import { RowBetween } from '../components/Row'
import { useMedia } from 'react-use'
import Search from '../components/Search'
import { useTranslation } from 'react-i18next'

const AccountWrapper = styled.div`
  margin-top: 2rem;

  @media screen and (max-width: 600px) {
    width: 100%;
  }
`

function AccountLookup() {
  const { t } = useTranslation()

  // scroll to top
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const topLps = useTopLps()

  const below600 = useMedia('(max-width: 600px)')

  return (
    <PageWrapper>
      <FullWrapper>
        <DashboardWrapper>
          <RowBetween>
            <TYPE.largeHeader>{t('walletAnalytics')}</TYPE.largeHeader>
            {!below600 && <Search small={true} />}
          </RowBetween>
          <AccountWrapper>
            <AccountSearch />
          </AccountWrapper>
        </DashboardWrapper>

        <DashboardWrapper>
          <TYPE.main fontSize={22} fontWeight={500}>
            {t('topLiquidityPositions')}
          </TYPE.main>
          {topLps && topLps.length > 0 ? <LPList lps={topLps} maxItems={200} /> : <LocalLoader />}
        </DashboardWrapper>
      </FullWrapper>
    </PageWrapper>
  )
}

export default AccountLookup
