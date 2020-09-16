import React, { useEffect } from 'react'
import 'feather-icons'
import { TYPE } from '../Theme'
import { PageWrapper, ContentWrapper } from '../components'
import { RowBetween } from '../components/Row'
import { useAllMarketData } from '../contexts/Markets'

function TradePage({ pairAddress }) {
  const { markets } = useAllMarketData()
  const selectedMarket = markets.find(market => market.id === pairAddress)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <PageWrapper>
      <ContentWrapper>
        <RowBetween>
          <TYPE.largeHeader style={{ margin: '2rem  4rem', textAlign: 'center' }}>
            {selectedMarket.description}
          </TYPE.largeHeader>
        </RowBetween>
      </ContentWrapper>
    </PageWrapper>
  )
}

export default TradePage
