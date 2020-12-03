import React, { useEffect } from 'react'
import 'feather-icons'
import { withRouter } from 'react-router-dom'
import { TYPE } from '../Theme'
import { PageWrapper, FullWrapper } from '../components'
import Panel from '../components/Panel'
import LPList from '../components/LPList'
import styled from 'styled-components'
import AccountSearch from '../components/AccountSearch'
import { useTopLps } from '../contexts/GlobalData'
import LocalLoader from '../components/LocalLoader'
import { RowBetween } from '../components/Row'
import { useMedia } from 'react-use'
import Search from '../components/Search'

const AccountWrapper = styled.div`
  @media screen and (max-width: 600px) {
    width: 100%;
  }
`

function AccountLookup() {
  // scroll to top
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const topLps = useTopLps()

  const below600 = useMedia('(max-width: 600px)')

  return (
    <PageWrapper style={{ paddingBottom: below600 && 46 }}>
      <FullWrapper>
        <RowBetween>
          <TYPE.largeHeader>Wallet analytics</TYPE.largeHeader>
          {!below600 && <Search small={true} />}
        </RowBetween>
        <AccountWrapper>
          <AccountSearch />
        </AccountWrapper>
        <TYPE.main
          fontSize="18px"
          style={{ fontFamily: 'Gilroy-Medium', marginTop: below600 ? 22 : 28, marginBottom: below600 ? 10 : 6 }}
        >
          Top Liquidity Positions
        </TYPE.main>
        <Panel>{topLps && topLps.length > 0 ? <LPList lps={topLps} maxItems={200} /> : <LocalLoader />}</Panel>
      </FullWrapper>
    </PageWrapper>
  )
}

export default withRouter(AccountLookup)
