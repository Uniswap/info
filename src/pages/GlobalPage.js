import React, { useState, useEffect } from "react"
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

const GridRow = styled.div`
  display: inline-grid;
  grid-template-columns: 30% 70%;
  column-gap: 6px;
  align-items: start;
  height: 500px;
`

const LeftGroup = styled.div`
  display: grid;
  grid-template-rows: min-content auto;
  row-gap: 6px;
  height: 100%;
`

const DashboardPanel = styled.div`
  border-radius: 20px;
  background-color: rgba(255, 255, 255, 0.4);
`

const PanelWrapper = styled(DashboardPanel)`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  padding: 24px;
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

const SpacedColumn = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
`

const ChartWrapper = styled.div`
  height: 100%;
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
    setColor("uniswapPink")
  }, [setColor])

  return (
    <PageWrapper>
      <ThemedBackground />
      <GlobalSearch />
      <GridRow style={{ marginTop: "40px" }}>
        <LeftGroup>
          <PanelWrapper>
            <TopPanel rounded color="black">
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
            </TopPanel>
          </PanelWrapper>
          <PanelWrapper>
            <SpacedColumn>
              <TopPanel rounded color="black">
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
              <TopPanel rounded color="black">
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
              <TopPanel rounded color="black">
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
              </TopPanel>
            </SpacedColumn>
          </PanelWrapper>
        </LeftGroup>
        <PanelWrapper>
          <ChartWrapper area="fill" rounded>
            <GlobalChart chartData={chartData} />
          </ChartWrapper>
        </PanelWrapper>
      </GridRow>
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
