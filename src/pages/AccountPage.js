import React from 'react'
import styled from 'styled-components'

import { PageWrapper, ContentWrapper } from '../components'

const DashboardWrapper = styled.div`
  width: 100%;
`

function AccountPage({ account }) {
  return (
    <PageWrapper>
      <ContentWrapper>
        <DashboardWrapper></DashboardWrapper>
      </ContentWrapper>
    </PageWrapper>
  )
}

export default AccountPage
