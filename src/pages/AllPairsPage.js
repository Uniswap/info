import React, { useEffect } from 'react'
import 'feather-icons'

import { TYPE } from '../Theme'
import Panel from '../components/Panel'
import PairList from '../components/PairList'
import { PageWrapper, FullWrapper } from '../components'
import { RowBetween } from '../components/Row'
import Search from '../components/Search'
import { useMedia } from 'react-use'
import { useAllMarketData } from '../contexts/Markets'
import { PARA_AUGUR_TOKENS } from '../contexts/TokenData'

function AllPairsPage() {
  const { markets } = useAllMarketData()
  let marketTokenPairObject = {}
  if (markets) {
    // TODO fix below, using mock token/market pairs
    markets.forEach(market => {
      PARA_AUGUR_TOKENS.forEach(token => {
        marketTokenPairObject[`${market.id}${token}`] = {
          id: `${market.id}`,
          token0: {
            id: token,
            symbol: token === PARA_AUGUR_TOKENS[0] ? 'ETH' : 'DAI',
            name: token === PARA_AUGUR_TOKENS[0] ? 'Ether (Wrapped)' : 'Dai Stablecoin',
            totalLiquidity: '0',
            derivedETH: '0',
            __typename: 'Token'
          },
          token1: {
            id: market.id,
            symbol: market.description,
            name: 'ParaAugur',
            totalLiquidity: '0',
            derivedETH: '0',
            __typename: 'Token'
          }
        }
      })
    })
  }

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const below800 = useMedia('(max-width: 800px)')

  return (
    <PageWrapper>
      <FullWrapper>
        <RowBetween>
          <TYPE.largeHeader>Top Pairs</TYPE.largeHeader>
          {!below800 && <Search small={true} />}
        </RowBetween>
        <Panel style={{ padding: below800 && '1rem 0 0 0 ' }}>
          <PairList pairs={marketTokenPairObject} disbaleLinks={true} maxItems={50} />
        </Panel>
      </FullWrapper>
    </PageWrapper>
  )
}

export default AllPairsPage
