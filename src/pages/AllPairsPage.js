import { useEffect } from 'react'
import { TYPE } from '../Theme'
import { usePairs } from 'state/features/pairs/selectors'
import PairList from '../components/PairList'
import { PageWrapper, FullWrapper } from '../components'
import { RowBetween } from '../components/Row'
import Search from '../components/Search'
import { useMedia } from 'react-use'
import { DashboardWrapper } from '../Theme'
import { useTranslation } from 'react-i18next'

function AllPairsPage() {
  const { t } = useTranslation()
  const allPairs = usePairs()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const below800 = useMedia('(max-width: 800px)')

  return (
    <PageWrapper>
      <FullWrapper>
        <DashboardWrapper>
          <RowBetween>
            <TYPE.largeHeader>{t('topPairs')}</TYPE.largeHeader>
            {!below800 && <Search small={true} />}
          </RowBetween>
          <PairList pairs={allPairs} disbaleLinks={true} maxItems={50} />
        </DashboardWrapper>
      </FullWrapper>
    </PageWrapper>
  )
}

export default AllPairsPage
