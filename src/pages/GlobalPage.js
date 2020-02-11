import React, { useState, useEffect } from "react"
import "feather-icons"
import { Text, Flex } from "rebass"
import styled from "styled-components"

import { GlobalSearch } from "../components/Search"
import { RowFlat } from "../components/Row"
import Column from "../components/Column"
import { Hint } from "../components"
import PairList from "../components/PairList"
import TopTokenList from "../components/TopTokenList"
import TxnList from "../components/TxnList"
import GlobalChart from "../components/GlobalChart"

import { formattedNum } from "../helpers"
import { useColor } from "../contexts/Application"
import { useGlobalData, useEthPrice } from "../contexts/GlobalData"
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
  height: 500px;
  max-width: 100vw;
  z-index: -1;
  background: ${({ theme }) => theme.background};
`

const ListOptions = styled(Flex)`
  flex-direction: row;
  height: 40px
  justify-content: space-betwearen;
  align-items; center;
  width: 100%;
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

const GridRow = styled.div`
  display: inline-grid;
  width: 100%;
  min-height: 500px;
  grid-template-columns: 30% 70%;
  column-gap: 6px;
  align-items: start;
`

const LeftGroup = styled.div`
  display: grid;
  grid-template-rows: min-content auto;
  row-gap: 6px;
  height: 100%;
`

const Panel = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  border-radius: 20px;
  background-color: ${({ theme }) => theme.panelColor};
`

const SpacedColumn = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  height: 100%;
  padding: 24px;
`

const ChartWrapper = styled.div`
  height: 100%;
  padding: 24px;
`

const PaddedGroup = styled.div`
  padding: 24px;
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

  const ethPrice = useEthPrice()
  const formattedEthPrice = formattedNum(ethPrice, true)

  const [, setColor] = useColor()

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

  useEffect(() => {
    setColor("#FE6DDE")
  }, [setColor])

  return (
    <PageWrapper>
      <ThemedBackground />
      <GlobalSearch />
      <GridRow style={{ marginTop: "40px" }}>
        <LeftGroup>
          <Panel>
            <PaddedGroup>
              <Column>
                <RowFlat>
                  <Text fontSize={36} lineHeight={1} fontWeight={600}>
                    {formattedEthPrice}
                  </Text>
                  <Text marginLeft="10px">{liquidityChange}</Text>
                </RowFlat>
                <RowFlat style={{ marginTop: "10px" }}>
                  <Hint>ETH Uniprice</Hint>
                </RowFlat>
              </Column>
            </PaddedGroup>
          </Panel>
          <Panel>
            <SpacedColumn>
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
              <Column>
                <RowFlat>
                  <Text fontSize={36} lineHeight={1} fontWeight={600}>
                    {0}
                  </Text>
                  <Text marginLeft="10px">{volumeChange}</Text>
                </RowFlat>
                <RowFlat style={{ marginTop: "10px" }}>
                  <Hint>Transactions (24hrs)</Hint>
                </RowFlat>
              </Column>
            </SpacedColumn>
          </Panel>
        </LeftGroup>
        <Panel>
          <ChartWrapper area="fill" rounded>
            <GlobalChart chartData={chartData} />
          </ChartWrapper>
        </Panel>
      </GridRow>
      <Panel style={{ marginTop: "6px" }}>
        <PaddedGroup>
          <ListOptions>
            <OptionsWrappper>
              <Text
                onClick={() => {
                  setTokenFilter("TOKENS")
                }}
                color={tokenFilter === "TOKENS" ? "black" : "#aeaeae"}
              >
                Top Tokens
              </Text>
              <Text
                onClick={() => {
                  setTokenFilter("PAIRS")
                }}
                color={tokenFilter === "PAIRS" ? "black" : "#aeaeae"}
              >
                Top Pairs
              </Text>
            </OptionsWrappper>
          </ListOptions>
        </PaddedGroup>
        {allTokenData && tokenFilter === "TOKENS" && (
          <TopTokenList tokens={allTokenData} />
        )}
        {allTokenData && tokenFilter === "PAIRS" && <PairList pairs={pairs} />}
      </Panel>
      <Panel style={{ marginTop: "6px" }}>
        <PaddedGroup>
          <ListOptions>
            <OptionsWrappper>
              <Text
                onClick={() => {
                  setTxFilter("ALL")
                }}
                color={txFilter !== "ALL" ? "#aeaeae" : "black"}
              >
                All
              </Text>
              <Text
                onClick={() => {
                  setTxFilter("SWAP")
                }}
                color={txFilter !== "SWAP" ? "#aeaeae" : "black"}
              >
                Swaps
              </Text>
              <Text
                onClick={() => {
                  setTxFilter("ADD")
                }}
                color={txFilter !== "ADD" ? "#aeaeae" : "black"}
              >
                Add
              </Text>
              <Text
                onClick={() => {
                  setTxFilter("REMOVE")
                }}
                color={txFilter !== "REMOVE" ? "#aeaeae" : "black"}
              >
                Remove
              </Text>
            </OptionsWrappper>
          </ListOptions>
        </PaddedGroup>
        <TxnList txns={txns} txFilter={txFilter} />
      </Panel>
    </PageWrapper>
  )
}

export default GlobalPage
