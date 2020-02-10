import React, { useState } from "react"
import "feather-icons"
import styled from "styled-components"

import { Box, Text, Flex } from "rebass"
import Panel from "../components/Panel"
import TokenLogo from "../components/TokenLogo"
import { RowFlat } from "../components/Row"
import Column from "../components/Column"
import { ButtonPlusDull, ButtonCustom } from "../components/ButtonStyled"
import PairChart from "../components/PairChart"
import Link from "../components/Link"
import { Hint } from "../components"
import TxnList from "../components/TxnList"
import Loader from "../components/Loader"

import { formattedNum } from "../helpers"

import {
  usePairData,
  usePairTransactions,
  usePairChartData
} from "../contexts/PairData"
import { useCurrentCurrency } from "../contexts/Application"

const PageWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  padding-bottom: 100px;

  @media screen and (min-width: 64em) {
    max-width: 1240px;
  }
`

const DashboardWrapper = styled.div`
  width: 100%;
`

const TokenHeader = styled(Box)`
  color: black;
  font-weight: 600;
  font-size: 20px;
  width: 100%;
  padding: 2rem 0;

  @media screen and (min-width: 64em) {
    display: flex;
    flex-direction: row;
    font-size: 32px;
    align-items: center;
    justify-content: space-between;
    max-width: 1320px;
  }
`

const Row = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`

const ListHeader = styled.div`
  font-size: 24px;
  font-weight: 600;
  width: 100%;
  margin: 5rem 0 2rem 0;
`

const ListOptions = styled(Flex)`
  flex-direction: row;
  height: 40px
  justify-content: space-between;
  align-items; center;
  width: 100%;
  margin: 2rem 0;
  font-size: 20px;
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
      color: black;
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

const ButtonShadow = styled(ButtonCustom)`
  box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.04), 0px 4px 8px rgba(0, 0, 0, 0.04),
    0px 16px 24px rgba(0, 0, 0, 0.04), 0px 24px 32px rgba(0, 0, 0, 0.04);
`

const TokenDetailsLayout = styled.div`
  display: inline-grid;
  width: 100%;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
  & > :last-child {
    align-self: center;
    justify-self: end;
  }
`

const ChartWrapper = styled.div`
  margin-bottom: 40px;
`

const ThemedBackground = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1000px;
  max-width: 100vw;
  z-index: -1;
  background: linear-gradient(
    180deg,
    rgba(255, 173, 0, 0.8) 0%,
    rgba(255, 173, 0, 0) 100%
  );
`

function PairPage({ address }) {
  const [txFilter, setTxFilter] = useState("ALL")
  const [currency] = useCurrentCurrency()
  const {
    token0,
    token1,
    token0Balance,
    token1Balance,
    combinedBalanceETH,
    combinedBalanceUSD,
    oneDayVolumeETH,
    oneDayVolumeUSD,
    volumeChangeUSD,
    volumeChangeETH,
    liquidityChangeUSD,
    liquidityChangeETH
  } = usePairData(address)
  const chartData = usePairChartData(address)
  const txns = usePairTransactions(address)

  const liquidity =
    currency === "ETH"
      ? "Ξ " + formattedNum(combinedBalanceETH)
      : "$" + formattedNum(combinedBalanceUSD)

  const liquidityChange =
    currency === "ETH"
      ? formattedNum(liquidityChangeETH) + "%"
      : formattedNum(liquidityChangeUSD) + "%"

  const volume =
    currency === "ETH"
      ? "Ξ " + formattedNum(oneDayVolumeETH)
      : "$" + formattedNum(oneDayVolumeUSD)

  const volumeChange =
    currency === "ETH"
      ? formattedNum(volumeChangeETH) + "%"
      : formattedNum(volumeChangeUSD) + "%"

  return (
    <PageWrapper>
      <ThemedBackground />
      <TokenHeader>
        <Row>
          <TokenLogo
            address={"0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"}
            size="32px"
          />
          <Text mx={"18px"}>
            {token0 && token1
              ? token0.symbol + "-" + token1.symbol + " Pool"
              : ""}
          </Text>
        </Row>
        <Row>
          <ButtonPlusDull mx="1rem">Add Liquidity</ButtonPlusDull>
          <ButtonShadow bgColor="#f5ba3f">Trade</ButtonShadow>
        </Row>
      </TokenHeader>
      <DashboardWrapper>
        <ChartWrapper>
          <PairChart chartData={chartData} />
        </ChartWrapper>
        <PanelWrapper>
          <TopPanel rounded color="black" p={24}>
            <Column>
              <RowFlat>
                <Text fontSize={24} lineHeight={1} fontWeight={600}>
                  {volume}
                </Text>
                <Text marginLeft={10}>{volumeChange}</Text>
              </RowFlat>
              <RowFlat style={{ marginTop: "10px" }}>
                <Hint>Volume (24hrs)</Hint>
              </RowFlat>
            </Column>
          </TopPanel>
          <TopPanel rounded color="black" p={24}>
            <Column>
              <RowFlat>
                <Text fontSize={24} lineHeight={1} fontWeight={600}>
                  {liquidity}
                </Text>
                <Text marginLeft={10}>{liquidityChange}</Text>
              </RowFlat>
              <RowFlat style={{ marginTop: "10px" }}>
                <Hint>Total Liquidity</Hint>
              </RowFlat>
            </Column>
          </TopPanel>
          <TopPanel rounded color="black" p={24}>
            <Column>
              <RowFlat>
                <Text fontSize={24} lineHeight={1} fontWeight={600}>
                  {token0Balance ? formattedNum(token0Balance) : ""}
                </Text>
              </RowFlat>
              <RowFlat style={{ marginTop: "10px" }}>
                <Hint>{token0 ? token0.symbol + " balance" : ""}</Hint>
              </RowFlat>
            </Column>
          </TopPanel>
          <TopPanel rounded color="black" p={24}>
            <Column>
              <RowFlat>
                <Text fontSize={24} lineHeight={1} fontWeight={600}>
                  {token1Balance ? formattedNum(token1Balance) : ""}
                </Text>
              </RowFlat>
              <RowFlat style={{ marginTop: "10px" }}>
                <Hint>{token1 ? token1.symbol + " balance" : ""}</Hint>
              </RowFlat>
            </Column>
          </TopPanel>
        </PanelWrapper>
        <ListHeader>Pool Details</ListHeader>
        <Panel
          rounded
          style={{
            border: "1px solid rgba(43, 43, 43, 0.05)",
            marginBottom: "60px"
          }}
          p={20}
        >
          <TokenDetailsLayout>
            <Column>
              <Text color="#888D9B">Pool Name</Text>
              <Text
                style={{ marginTop: "1rem" }}
                fontSize={24}
                fontWeight="500"
              >
                {token0 && token1
                  ? token0.symbol + "-" + token1.symbol + " Pool"
                  : ""}
              </Text>
            </Column>
            <Column>
              <Text color="#888D9B">Address</Text>
              <Text
                style={{ marginTop: "1rem" }}
                fontSize={24}
                fontWeight="500"
              >
                {address.slice(0, 6) + "..." + address.slice(38, 42)}
              </Text>
            </Column>
            <Column>
              <Text color="#888D9B">
                {token0 && token0.symbol + " address"}
              </Text>
              <Text
                style={{ marginTop: "1rem" }}
                fontSize={24}
                fontWeight="500"
              >
                {token0 &&
                  token0.id.slice(0, 6) + "..." + token0.id.slice(38, 42)}
              </Text>
            </Column>
            <Column>
              <Text color="#888D9B">
                {token1 && token1.symbol + " address"}
              </Text>
              <Text
                style={{ marginTop: "1rem" }}
                fontSize={24}
                fontWeight="500"
              >
                {token1 &&
                  token1.id.slice(0, 6) + "..." + token1.id.slice(38, 42)}
              </Text>
            </Column>
            <Link
              color="button"
              external
              href={"https://etherscan.io/address/" + address}
            >
              View on Etherscan
            </Link>
          </TokenDetailsLayout>
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
          {txns ? <TxnList txns={txns} txFilter={txFilter} /> : <Loader />}
        </Panel>
      </DashboardWrapper>
    </PageWrapper>
  )
}

export default PairPage
