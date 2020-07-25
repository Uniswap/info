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

import { ButtonDark } from '../ButtonStyled'
import Link from '../Link'

const Header = styled.div`
  width: 100%;
  background-color: ${({ theme }) => theme.bg1};
  margin-bottom: 2rem;
  position: sticky;
  top: 0;
  z-index: 99;
`

const CombinedWrapper = styled(RowFixed)`
  border-radius: 16px;
  justify-content: flex-end;
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

export default function NavHeader({ token, pair, account }) {
  const isHome = !token && !pair && !account

  const below1024 = useMedia('(max-width: 1024px)')
  const below600 = useMedia('(max-width: 600px)')

  const [showPriceCard, setShowPriceCard] = useState(false)

  const { totalLiquidityUSD, oneDayVolumeUSD, oneDayTxns, v1Data, txnChange } = useGlobalData()
  const [ethPrice] = useEthPrice()
  const formattedEthPrice = ethPrice ? formattedNum(ethPrice, true) : '-'
  let txnChangeFormatted = txnChange ? formattedPercent(txnChange) : '-'

  const liquidity =
    totalLiquidityUSD && v1Data?.totalLiquidityUSD
      ? '$' + toK(parseFloat(totalLiquidityUSD) + parseFloat(v1Data?.totalLiquidityUSD), true)
      : ''
  const volume =
    oneDayVolumeUSD && v1Data?.dailyVolumeUSD ? '$' + toK(oneDayVolumeUSD + v1Data?.dailyVolumeUSD, true) : ''
  return below600 ? (
    <Header>
      <AutoColumn gap="20px">
        <Title token={token} pair={pair} />
        {!isHome && <Search small={true} />}
      </AutoColumn>
    </Header>
  ) : (
    <Header>
      <Polling>
        {/* <Spinner /> */}
        <PollingDot />
        <TYPE.small>
          Last Updated 2s ago <a href="/">(refresh)</a>
        </TYPE.small>
      </Polling>
      <RowBetween style={{ padding: '0.5rem 1rem', backgroundColor: '#f7f8fa', borderBottom: '1px solid #edeef2' }}>
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
          <HeaderText>
            Combined Liquidity: <b>{liquidity}</b>
          </HeaderText>
          <HeaderText>
            Combined Volume: <b>{volume}</b>
          </HeaderText>
          <HeaderText>
            Pairs: <b>{volume}</b>
          </HeaderText>
          <HeaderText>
            Transactions (24H): <b>{oneDayTxns}</b>&nbsp;{txnChangeFormatted && txnChangeFormatted}
          </HeaderText>
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
      <RowBetween style={{ padding: '1rem 1rem', borderBottom: '1px solid #edeef2' }}>
        <Title token={token} pair={pair} account={account} />
        <RowFixed>
          {!isHome && (
            <div style={{ width: '370px' }}>
              {' '}
              <Search small={true} />
            </div>
          )}
          {isHome && (
            <CombinedWrapper>
              {!below1024 && (
                <>
                  <HeaderText>Protocol Stats</HeaderText>
                  <HeaderText>Tokens</HeaderText>
                  <HeaderText>Pairs</HeaderText>
                  <HeaderText>Transactions</HeaderText>
                </>
              )}
              <Link href="https://migrate.uniswap.info" target="_blank">
                <ButtonDark style={{ minWidth: 'initial' }}>Launch App</ButtonDark>
              </Link>
            </CombinedWrapper>
          )}
        </RowFixed>
      </RowBetween>
    </Header>
  )
}
