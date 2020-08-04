import React, { useEffect, useState } from 'react'
import 'feather-icons'
import { withRouter } from 'react-router-dom'
import { TYPE } from '../Theme'
import { PageWrapper, FullWrapper } from '../components'
import { useAllPairData } from '../contexts/PairData'
import { client } from '../apollo/client'
import { TOP_LPS_PER_PAIRS } from '../apollo/queries'
import Panel from '../components/Panel'
import LPList from '../components/LPList'
import styled from 'styled-components'
import AccountSearch from '../components/AccountSearch'

const AccountWrapper = styled.div`
  width: 400px;

  @media screen and (max-width: 600px) {
    width: 100%;
  }
`

function AccountLookup({ history }) {
  // scroll to top
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // get data about all pairs
  const allPairs = useAllPairData()
  const [topLps, setTopLps] = useState()

  /**
   * Given the top 20 pools by size, fetch top 10 LPs in each one,
   * then sort them by USD position size
   */
  useEffect(() => {
    async function fetchData() {
      // get top 20 by reserves
      let top200Pairs = Object.keys(allPairs)
        ?.sort((a, b) => parseFloat(allPairs[a].reserveUSD > allPairs[b].reserveUSD ? -1 : 1))
        ?.slice(0, 199)
        .map(pair => pair)

      let topLpLists = await Promise.all(
        top200Pairs.map(async pair => {
          // for each one, fetch top LPs
          const { data: lps } = await client.query({
            query: TOP_LPS_PER_PAIRS,
            variables: {
              pair: pair.toString()
            },
            fetchPolicy: 'cache-first'
          })
          return lps.liquidityPositions
        })
      )

      // get the top lps from the results formatted
      const topLps = []
      topLpLists.map(list => {
        return list.map(entry => {
          const pairData = allPairs[entry.pair.id]
          return topLps.push({
            user: entry.user,
            pairName: pairData.token0.symbol + '-' + pairData.token1.symbol,
            pairAddress: entry.pair.id,
            token0: pairData.token0.id,
            token1: pairData.token1.id,
            usd:
              (parseFloat(entry.liquidityTokenBalance) / parseFloat(pairData.totalSupply)) *
              parseFloat(pairData.reserveUSD)
          })
        })
      })

      topLps.sort((a, b) => (a.usd > b.usd ? -1 : 1))

      setTopLps(topLps)
    }

    fetchData()
  }, [allPairs])

  return (
    <PageWrapper>
      <FullWrapper>
        <TYPE.main fontSize={'1.125rem'} style={{ marginTop: '2rem', marginBottom: '1rem' }}>
          Account Lookup
        </TYPE.main>
        <AccountWrapper>
          <AccountSearch />
        </AccountWrapper>
        <TYPE.main fontSize={'1.125rem'} style={{ marginTop: '2rem' }}>
          Top LPs Per Pair
        </TYPE.main>
        <Panel>{topLps && <LPList lps={topLps} maxItems={200} />}</Panel>
      </FullWrapper>
    </PageWrapper>
  )
}

export default withRouter(AccountLookup)
