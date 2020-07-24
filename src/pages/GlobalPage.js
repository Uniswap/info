import React, { useState, useRef, useEffect } from 'react'
import { withRouter } from 'react-router-dom'
import { TrendingUp, PieChart, Disc, List } from 'react-feather'
import { Box } from 'rebass'
import styled from 'styled-components'

import { AutoRow, RowBetween } from '../components/Row'
import { AutoColumn } from '../components/Column'
import PairList from '../components/PairList'
import TopTokenList from '../components/TokenList'
import TxnList from '../components/TxnList'
import GlobalChart from '../components/GlobalChart'
import { Hover, TYPE } from '../Theme'
import { formattedNum, formattedPercent, isAddress } from '../utils'
import { useGlobalData, useEthPrice, useGlobalTransactions } from '../contexts/GlobalData'
import { useAllPairData } from '../contexts/PairData'
import { Search } from '../components/Search'
import { useMedia } from 'react-use'
import Panel from '../components/Panel'
import { useAllTokenData } from '../contexts/TokenData'
import { ButtonLight } from '../components/ButtonStyled'

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-bottom: 100px;
  max-width: 1440px;
  display: grid;
  justify-content: start;
  align-items: start;
  grid-template-columns: 180px 1fr 256px;
  grid-gap: 24px;
  padding: 0 24px;
  @media screen and (max-width: 1080px) {
    width: calc(100% - 40px);
    padding: 0 20px;
  }
`

// const ThemedBackground = styled.div`
//   position: absolute;
//   top: 0;
//   left: 0;
//   right: 0;
//   height: 200vh;
//   max-width: 100vw;
//   z-index: -1;

//   transform: translateY(-70vh);
//   /* background: ${({ theme }) => theme.background}; */
// `

const ListOptions = styled(AutoRow)`
  height: 40px;
  width: 100%;
  font-size: 1.25rem;
  font-weight: 600;

  @media screen and (max-width: 640px) {
    font-size: 1rem;
  }
`

const GridRow = styled.div`
  display: inline-grid;
  width: 100%;
  grid-template-columns: 50% 50%;
  column-gap: 6px;
  align-items: start;
  justify-content: center;
`

const TopGroup = styled.div`
  grid-template-columns: 1fr 1fr 1fr 1fr;
  column-gap: 6px;
  display: inline-grid;
  width: 100%;
  align-items: start;
`

const SubNav = styled.ul`
  list-style: none;
  position: sticky;
  top: 8rem;
  padding: 0px;
  margin-top: 0px;
`
const SubNavEl = styled.li`
  list-style: none;
  display: flex;
  margin-bottom: 1rem;
  width: 100%;
  font-weight: ${({ isActive }) => (isActive ? 600 : 500)};

  :hover {
    cursor: pointer;
  }
`

const ChartWrapper = styled.div`
  height: 100%;
`

const Wrapper = styled.div`
  display: flex;
  position: relative;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
  width: 180px;
  padding: 8px 16px;
  border-radius: 12px;
  background: ${({ theme }) => theme.bg2};
`

const Input = styled.input`
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  white-space: nowrap;
  background: none;
  border: none;
  outline: none;
  color: ${({ theme }) => theme.textColor};
  background-color: ${({ theme }) => theme.bg2};
  font-size: 16px;

  ::placeholder {
    color: ${({ theme }) => theme.text3};
    font-size: 16px;
  }

  @media screen and (max-width: 640px) {
    ::placeholder {
      font-size: 1rem;
    }
  }
`

const TopPanel = styled(Panel)``

const LIST_VIEW = {
  TOKENS: 'tokens',
  PAIRS: 'pairs'
}

function GlobalPage({ history }) {
  const [listView, setListView] = useState(LIST_VIEW.PAIRS)
  const [active, setActive] = useState(null)

  const {
    totalLiquidityUSD,
    oneDayVolumeUSD,
    volumeChangeUSD,
    liquidityChangeUSD,
    oneDayTxns,
    txnChange
  } = useGlobalData()

  const transactions = useGlobalTransactions()

  const allPairs = useAllPairData()
  const allTokens = useAllTokenData()

  const [ethPrice, ethPriceOld] = useEthPrice()

  const ethPriceChange = (parseFloat(ethPrice - ethPriceOld) / parseFloat(ethPriceOld)) * 100

  const formattedEthPrice = ethPrice ? formattedNum(ethPrice, true) : '-'

  const liquidity = totalLiquidityUSD ? formattedNum(totalLiquidityUSD, true) : '-'

  const liquidityChange = liquidityChangeUSD ? formattedPercent(liquidityChangeUSD) : '-'

  const volume = oneDayVolumeUSD ? formattedNum(oneDayVolumeUSD, true) : '-'

  const volumeChange = volumeChangeUSD ? formattedPercent(volumeChangeUSD) : '-'

  let txnChangeFormatted = txnChange ? formattedPercent(txnChange) : '-'

  const below1080 = useMedia('(max-width: 1080px)')
  const below600 = useMedia('(max-width: 600px)')

  const [accountValue, setAccountValue] = useState()

  const OverviewRef = useRef()
  const PairsRef = useRef()
  const TokensRef = useRef()
  const TransactionsRef = useRef()

  useEffect(() => {
    setActive(OverviewRef)
  }, [])

  const handleScroll = ref => {
    setActive(ref.current)
    document.querySelector('body').scrollTo({
      behavior: 'smooth',
      top: ref.current.offsetTop - 120
    })
  }

  return (
    <PageWrapper>
      <SubNav>
        <SubNavEl onClick={() => handleScroll(OverviewRef)} isActive={active === OverviewRef}>
          <TrendingUp size={20} style={{ marginRight: '1rem' }} />
          <TYPE.main>Overview</TYPE.main>
        </SubNavEl>
        <SubNavEl onClick={() => handleScroll(PairsRef)} isActive={active === OverviewRef}>
          <PieChart size={20} style={{ marginRight: '1rem' }} />
          <TYPE.main>Top Pairs</TYPE.main>
        </SubNavEl>
        <SubNavEl onClick={() => handleScroll(TokensRef)} isActive={active === OverviewRef}>
          <Disc size={20} style={{ marginRight: '1rem' }} />
          <TYPE.main>Top Tokens</TYPE.main>
        </SubNavEl>
        <SubNavEl onClick={() => handleScroll(TransactionsRef)} isActive={active === OverviewRef}>
          <List size={20} style={{ marginRight: '1rem' }} />
          <TYPE.main>Transactions</TYPE.main>
        </SubNavEl>
      </SubNav>
      <div>
        <Box mb={20}>
          <Search small={!!below600} />
        </Box>
        <span ref={OverviewRef}></span>
        {below1080 && ( // mobile card
          <Box mb={20}>
            <Box mb={20} mt={'1.5rem'}>
              <Panel>
                <Box>
                  <AutoColumn gap="40px">
                    <AutoColumn gap="20px">
                      <RowBetween>
                        <TYPE.main>Volume (24hrs)</TYPE.main>
                        <div />
                      </RowBetween>
                      <RowBetween align="flex-end">
                        <TYPE.main fontSize={'1.5rem'} lineHeight={1} fontWeight={600}>
                          {volume}
                        </TYPE.main>
                        <TYPE.main fontSize={12}>{volumeChange}</TYPE.main>
                      </RowBetween>
                    </AutoColumn>
                    <AutoColumn gap="20px">
                      <RowBetween>
                        <TYPE.main>Total Liquidity</TYPE.main>
                        <div />
                      </RowBetween>
                      <RowBetween align="flex-end">
                        <TYPE.main fontSize={'1.5rem'} lineHeight={1} fontWeight={600}>
                          {liquidity && liquidity}
                        </TYPE.main>
                        <TYPE.main fontSize={12}>{liquidityChange && liquidityChange}</TYPE.main>
                      </RowBetween>
                    </AutoColumn>
                  </AutoColumn>
                </Box>
              </Panel>
            </Box>
            <Box>
              <Panel>
                <ChartWrapper area="fill" rounded>
                  <GlobalChart />
                </ChartWrapper>
              </Panel>
            </Box>
          </Box>
        )}

        {!below1080 && (
          <GridRow style={{ marginTop: '6px' }}>
            <Panel style={{ height: '100%', minHeight: '300px' }}>
              <ChartWrapper area="fill" rounded>
                <GlobalChart display="liquidity" />
              </ChartWrapper>
            </Panel>
            <Panel style={{ height: '100%' }}>
              <ChartWrapper area="fill" rounded>
                <GlobalChart display="volume" />
              </ChartWrapper>
            </Panel>
          </GridRow>
        )}

        <ListOptions ref={PairsRef} gap="10px" style={{ marginTop: '2rem', marginBottom: '.5rem' }}>
          <TYPE.main fontSize={'1.125rem'}>Top Pairs</TYPE.main>
        </ListOptions>

        <Panel style={{ marginTop: '6px' }}>
          <PairList pairs={allPairs} />
        </Panel>

        <ListOptions ref={TokensRef} gap="10px" style={{ marginTop: '2rem', marginBottom: '.5rem' }}>
          <TYPE.main fontSize={'1.125rem'}>Top Tokens</TYPE.main>
        </ListOptions>

        <Panel style={{ marginTop: '6px' }}>
          <TopTokenList tokens={allTokens} />
        </Panel>

        <span ref={TransactionsRef}>
          <TYPE.main fontSize={'1.125rem'} style={{ marginTop: '2rem' }}>
            Transactions
          </TYPE.main>
        </span>
        <Panel style={{ margin: '1rem 0' }}>
          <TxnList transactions={transactions} />
        </Panel>
      </div>

      {!below1080 && (
        <Panel>
          <AutoColumn gap={'12px'}>
            <TYPE.main>Wallet Analytics</TYPE.main>
            <TYPE.small>Input an address to view liqudiity provider statistics.</TYPE.small>
            <AutoRow>
              <Wrapper>
                <Input
                  placeholder="0x.."
                  onChange={e => {
                    setAccountValue(e.target.value)
                  }}
                />
              </Wrapper>
            </AutoRow>

            <ButtonLight
              style={{ marginRight: '1rem' }}
              disabled={isAddress(accountValue)}
              onClick={() => history.push('/account/' + accountValue)}
            >
              Load Account Details
            </ButtonLight>
          </AutoColumn>
        </Panel>
      )}
    </PageWrapper>
  )
}

export default withRouter(GlobalPage)
