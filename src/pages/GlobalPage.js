import React, { useState } from "react"
import "feather-icons"
import { Text, Flex } from "rebass"
import styled from "styled-components"

import Panel from "../components/Panel"
import { GlobalSearch } from "../components/Search"
import { RowFlat } from "../components/Row"
import Column from "../components/Column"
import { Hint } from "../components"
import PairList from "../components/PairList"
import TopTokenList from "../components/TopTokenList"
import TxnList from "../components/TxnList"
import GlobalChart from "../components/GlobalChart"

import { formattedNum } from "../helpers"
import { useGlobalData } from "../contexts/GlobalData"
import { useAllTokenData } from "../contexts/TokenData"
import { useCurrentCurrency } from "../contexts/Application"
import { useAllPairs } from "../contexts/PairData"

const PageWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-bottom: 100px;

  @media screen and (min-width: 64em) {
    & > * {
      width: 100%;
      max-width: 1240px;
    }
  }
`

const ThemedBackground = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 600px;
  max-width: 100vw;
  z-index: -1;
  background: linear-gradient(
    180deg,
    rgba(254, 109, 222, 0.6) 0%,
    rgba(254, 109, 222, 0) 100%
  );
`

const ListOptions = styled(Flex)`
  flex-direction: row;
  height: 40px
  justify-content: space-between;
  align-items; center;
  width: 100%;
  margin: 2rem 0;
  margin-top: 80px;
  font-size: 24px;
  font-weight: 600;

  @media screen and (max-width: 64em) {
    display: none;
  }
`

const OptionsWrappper = styled(Flex)`
  align-items: center;
  & > * {
    margin-right: 1em;
    &:hover {
      cursor: pointer;
    }
  }
`

const PanelWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  width: 100%;
  margin: 40px 0;
`

const TopPanel = styled(Panel)`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: fit-content;

  @media screen and (max-width: 64em) {
    width: 100%;
    border-radius: 0

    &:nth-of-type(3) {
      margin-bottom: 20px;
      border-radius: 0 0 1em 1em;
    }

    &:first-of-type {
      border-radius: 1em 1em 0 0;
    }
  }
`

const ChartWrapper = styled.div`
  /* min-width: 100vw; */
`

function GlobalPage() {
  const [txFilter, setTxFilter] = useState("ALL")
  const [tokenFilter, setTokenFilter] = useState("TOKENS")

  const {
    totalLiquidityUSD,
    totalLiquidityETH,
    oneDayVolumeUSD,
    oneDayVolumeETH,
    volumeChangeUSD,
    volumeChangeETH,
    liquidityChangeUSD,
    liquidityChangeETH,
    txns,
    chartData
  } = useGlobalData()

  const allTokenData = useAllTokenData()
  const pairs = useAllPairs()
  const [currency] = useCurrentCurrency()

  const liquidity =
    currency === "ETH"
      ? formattedNum(totalLiquidityETH)
      : formattedNum(totalLiquidityUSD, true)

  const liquidityChange =
    currency === "ETH"
      ? formattedNum(liquidityChangeETH) + "%"
      : formattedNum(liquidityChangeUSD) + "%"

  const volume =
    currency === "ETH"
      ? formattedNum(oneDayVolumeETH, true)
      : formattedNum(oneDayVolumeUSD, true)

  const volumeChange =
    currency === "ETH"
      ? formattedNum(volumeChangeETH) + "%"
      : formattedNum(volumeChangeUSD) + "%"

  return (
    <PageWrapper>
      <ThemedBackground />
      <GlobalSearch />
      <PanelWrapper>
        <TopPanel rounded color="black" p={24}>
          <Column>
            <RowFlat>
              <Text fontSize={36} lineHeight={1} fontWeight={600}>
                {liquidity}
              </Text>
              <Text marginLeft="10px">{liquidityChange}</Text>
            </RowFlat>
            <RowFlat style={{ marginTop: "10px" }}>
              <Hint>Total Liquidity</Hint>
            </RowFlat>
          </Column>
        </TopPanel>
        <TopPanel rounded color="black" p={24}>
          <Column>
            <RowFlat>
              <Text fontSize={36} lineHeight={1} fontWeight={600}>
                {volume}
              </Text>
              <Text marginLeft="10px">{volumeChange}</Text>
            </RowFlat>
            <RowFlat style={{ marginTop: "10px" }}>
              <Hint>Volume (24hrs)</Hint>
            </RowFlat>
          </Column>
        </TopPanel>
      </PanelWrapper>
      <ChartWrapper area="fill" rounded>
        <GlobalChart chartData={chartData} />
      </ChartWrapper>
      <ListOptions>
        <OptionsWrappper>
          <Text
            onClick={() => {
              setTokenFilter("TOKENS")
            }}
            color={tokenFilter === "TOKENS" ? "black" : "textDim"}
          >
            Top Tokens
          </Text>
          <Text
            onClick={() => {
              setTokenFilter("PAIRS")
            }}
            color={tokenFilter === "PAIRS" ? "black" : "textDim"}
          >
            Top Pairs
          </Text>
        </OptionsWrappper>
      </ListOptions>
      <Panel
        rounded
        style={{
          border: "1px solid rgba(43, 43, 43, 0.05)"
        }}
      >
        {allTokenData && tokenFilter === "TOKENS" && (
          <TopTokenList tokens={allTokenData} />
        )}
        {allTokenData && tokenFilter === "PAIRS" && <PairList pairs={pairs} />}
      </Panel>
      <ListOptions>
        <OptionsWrappper>
          <Text
            onClick={() => {
              setTxFilter("ALL")
            }}
            color={txFilter !== "ALL" ? "textDim" : "black"}
          >
            All
          </Text>
          <Text
            onClick={() => {
              setTxFilter("SWAP")
            }}
            color={txFilter !== "SWAP" ? "textDim" : "black"}
          >
            Swaps
          </Text>
          <Text
            onClick={() => {
              setTxFilter("ADD")
            }}
            color={txFilter !== "ADD" ? "textDim" : "black"}
          >
            Add
          </Text>
          <Text
            onClick={() => {
              setTxFilter("REMOVE")
            }}
            color={txFilter !== "REMOVE" ? "textDim" : "black"}
          >
            Remove
          </Text>
        </OptionsWrappper>
      </ListOptions>
      <Panel
        rounded
        style={{
          border: "1px solid rgba(43, 43, 43, 0.05)"
        }}
      >
        <TxnList txns={txns} txFilter={txFilter} />
      </Panel>
    </PageWrapper>
  )
}

export default GlobalPage
