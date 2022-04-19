import { useEffect } from 'react'
import TopTokenList from '../components/TokenList'
import { TYPE } from '../Theme'
import { useAllTokenData } from '../contexts/TokenData'
import { PageWrapper, FullWrapper } from '../components'
import { RowBetween } from '../components/Row'
import Search from '../components/Search'
import { useMedia } from 'react-use'
import { DashboardWrapper } from '../Theme'
import { useTranslation } from 'react-i18next'

function AllTokensPage() {
  const { t } = useTranslation()
  const allTokens = useAllTokenData()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const below600 = useMedia('(max-width: 800px)')

  return (
    <PageWrapper>
      <FullWrapper>
        <DashboardWrapper>
          <RowBetween>
            <TYPE.largeHeader>{t('topTokens')}</TYPE.largeHeader>
            {!below600 && <Search small={true} />}
          </RowBetween>
          <TopTokenList tokens={allTokens} itemMax={50} />
        </DashboardWrapper>
      </FullWrapper>
    </PageWrapper>
  )
}

export default AllTokensPage
