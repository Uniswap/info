import React, { useState } from 'react'
import styled from 'styled-components'

import Title from '../Title'
import Search from '../Search'
import { RowFixed, RowBetween } from '../Row'
import { AutoColumn } from '../Column'
import { useMedia } from 'react-use'
import { useGlobalData, useEthPrice } from '../../contexts/GlobalData'
import { formattedNum, formattedPercent, toK } from '../../utils'
import { TYPE } from '../../Theme'

import UniPrice from '../UniPrice'

import Link from '../Link'
import { useSessionStart } from '../../contexts/Application'

const Header = styled.div`
  width: 100%;
  background-color: ${({ theme }) => theme.text1};
  color: ${({ theme }) => theme.bg1};
  position: sticky;
  top: 0;
  z-index: 9999;
`

const HeaderText = styled.div`
  margin-right: 0.75rem;
  font-size: 0.825rem;
  font-weight: 500;
  display: inline-box;
  display: -webkit-inline-box;
`

const Polling = styled.div`
  position: fixed;
  display: flex;
  align-items: center;
  left: 0;
  bottom: 0;
  padding: 1rem;
`
const PollingDot = styled.div`
  width: 8px;
  height: 8px;
  margin-right: 0.5rem;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.green1};
`
const SearchContainer = styled.div`
  @media screen and (max-width: 640px) {
    padding: 0 20px;
  }
`

export default function NavHeader({ token, pair, account }) {
  const isHome = !token && !pair && !account

  const below1280 = useMedia('(max-width: 1280px)')
  const below1180 = useMedia('(max-width: 1180px)')
  const below1024 = useMedia('(max-width: 1024px)')
  const below600 = useMedia('(max-width: 600px)')
  const below816 = useMedia('(max-width: 816px)')

  const [showPriceCard, setShowPriceCard] = useState(false)

  const { totalLiquidityUSD, oneDayVolumeUSD, oneDayTxns, v1Data, txnChange, pairCount } = useGlobalData()
  const [ethPrice] = useEthPrice()
  const formattedEthPrice = ethPrice ? formattedNum(ethPrice, true) : '-'
  let txnChangeFormatted = txnChange ? formattedPercent(txnChange) : '-'

  const liquidity =
    totalLiquidityUSD && v1Data?.totalLiquidityUSD
      ? '$' + toK(parseFloat(totalLiquidityUSD) + parseFloat(v1Data?.totalLiquidityUSD), true)
      : ''
  const volume =
    oneDayVolumeUSD && v1Data?.dailyVolumeUSD ? '$' + toK(oneDayVolumeUSD + v1Data?.dailyVolumeUSD, true) : ''

  const seconds = useSessionStart()

  const oneDayFees = oneDayVolumeUSD ? formattedNum(oneDayVolumeUSD * 0.003, true) : ''

  return below600 ? (
    <Header style={{ paddingBottom: '1rem', borderBottom: '1px solid #edeef2' }}>
      <AutoColumn gap="20px">
        <Title token={token} pair={pair} />
        {!isHome && (
          <SearchContainer>
            <Search small={true} />
          </SearchContainer>
        )}
      </AutoColumn>
    </Header>
  ) : (
    <Header>
      {!below1180 && (
        <Polling>
          <PollingDot />
          <TYPE.small>
            Last Updated {!!seconds ? seconds + 's' : '-'} ago <a href="/">(refresh)</a>
          </TYPE.small>
        </Polling>
      )}
      <RowBetween style={{ padding: '0.5rem 1rem' }}>
        <RowFixed>
          <HeaderText
            onMouseEnter={() => {
              setShowPriceCard(true)
            }}
            onMouseLeave={() => {
              setShowPriceCard(false)
            }}
          >
            ETH Price: <b>{formattedEthPrice}</b>
            {showPriceCard && <UniPrice />}
          </HeaderText>
          {!below816 && (
            <HeaderText>
              Combined Liquidity: <b>{liquidity}</b>
            </HeaderText>
          )}
          {!below816 && (
            <HeaderText>
              Combined Volume: <b>{volume}</b>
            </HeaderText>
          )}
          {!below1024 && (
            <HeaderText>
              Pairs: <b>{pairCount}</b>
            </HeaderText>
          )}
          {!below1180 && (
            <HeaderText>
              Transactions (24H): <b>{oneDayTxns}</b>&nbsp;{txnChangeFormatted && txnChangeFormatted}
            </HeaderText>
          )}
          {!below1280 && (
            <HeaderText>
              Fees (24H): <b>{oneDayFees}</b>&nbsp;
            </HeaderText>
          )}
        </RowFixed>

        <RowFixed style={{}}>
          <HeaderText>
            <Link href="https://migrate.uniswap.info" target="_blank">
              V1 Analytics
            </Link>
          </HeaderText>
          <HeaderText>
            <Link href="https://migrate.uniswap.info" target="_blank">
              Docs
            </Link>
          </HeaderText>
          <HeaderText>
            <Link href="https://migrate.uniswap.info" target="_blank">
              Discord
            </Link>
          </HeaderText>
          <HeaderText>
            <Link href="https://twitter.com/UniswapProtocol" target="_blank">
              Twitter
            </Link>
          </HeaderText>
        </RowFixed>
      </RowBetween>
    </Header>
  )
}
