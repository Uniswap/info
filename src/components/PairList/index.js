import React, { useState, useEffect } from "react"
import { useMedia } from "react-use"
import dayjs from "dayjs"
import LocalLoader from "../LocalLoader"
import utc from "dayjs/plugin/utc"
import { Box, Flex, Text } from "rebass"
import TokenLogo from "../TokenLogo"
import styled from "styled-components"

import Link, { CustomLink } from "../Link"
import { Divider } from "../../components"

import { formattedNum } from "../../helpers"
import { useEthPrice } from "../../contexts/GlobalData"
import { useCurrentCurrency } from "../../contexts/Application"
import { usePairData } from "../../contexts/PairData"

dayjs.extend(utc)

const PageButtons = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: 2em;
  margin-bottom: 2em;
`

const Arrow = styled.div`
  color: #2f80ed;
  opacity: ${props => (props.faded ? 0.3 : 1)};
  padding: 0 20px;
  user-select: none;
  :hover {
    cursor: pointer;
  }
`

const List = styled(Box)`
  -webkit-overflow-scrolling: touch;
`

const DashGrid = styled.div`
  display: grid;
  grid-gap: 1em;
  grid-template-columns: 100px 1fr 1fr;
  grid-template-areas: "action value Time";
  padding: 0 6px;

  > * {
    justify-content: flex-end;
    width: 100%;

    &:first-child {
      justify-content: flex-start;
      text-align: left;
      width: 100px;
    }
  }

  @media screen and (min-width: 40em) {
    max-width: 1280px;
    display: grid;
    grid-gap: 1em;
    grid-template-columns: 180px 1fr 1fr;
    grid-template-areas: "action value Time";

    > * {
      justify-content: flex-end;
      width: 100%;

      &:first-child {
        justify-content: flex-start;
      }

      &:nth-child(2) {
        justify-content: flex-start;
      }
    }
  }

  @media screen and (min-width: 64em) {
    max-width: 1320px;
    display: grid;
    padding: 0 24px;
    grid-gap: 1em;
    grid-template-columns: 20px 2.2fr 1fr 1fr 1fr 1fr;
    grid-template-areas: "number name liq vol apy supply";
  }
`

const ListWrapper = styled.div`
  @media screen and (max-width: 40em) {
    padding-right: 1rem;
    padding-left: 1rem;
  }
`

const ClickableText = styled(Text)`
  &:hover {
    cursor: pointer;
    opacity: 0.6;
  }
  user-select: none;
`

const DataText = styled(Flex)`
  @media screen and (max-width: 40em) {
    font-size: 14px;
  }

  align-items: center;
  text-align: right;

  & > * {
    font-size: 1em;
  }
`

const SORT_FIELD = {
  LIQ: "combinedBalanceETH",
  VOL: "oneDayVolumeUSD"
}

// @TODO rework into virtualized list
function PairList({ pairs }) {
  const ethPrice = useEthPrice()

  const [page, setPage] = useState(1)
  const [maxPage, setMaxPage] = useState(1)
  const ITEMS_PER_PAGE = 10

  // sorting
  const [sortDirection, setSortDirection] = useState(true)
  const [sortedColumn, setSortedColumn] = useState(SORT_FIELD.LIQ)
  const [filteredItems, setFilteredItems] = useState()

  useEffect(() => {
    setMaxPage(1) // edit this to do modular
    setPage(1)
  }, [pairs])

  useEffect(() => {
    if (pairs) {
      const pairsArray = []
      Object.keys(pairs).map(key => {
        return pairsArray.push(pairs[key])
      })
      setFilteredItems(pairsArray)
      let extraPages = 1
      if (pairsArray.length % ITEMS_PER_PAGE === 0) {
        extraPages = 0
      }
      setMaxPage(Math.floor(pairsArray.length / ITEMS_PER_PAGE) + extraPages)
    }
  }, [pairs])

  const belowMedium = useMedia("(max-width: 64em)")

  const [currency] = useCurrentCurrency()

  const filteredList =
    filteredItems &&
    filteredItems
      .sort((a, b) => {
        return parseFloat(a[sortedColumn]) > parseFloat(b[sortedColumn])
          ? (sortDirection ? -1 : 1) * 1
          : (sortDirection ? -1 : 1) * -1
      })
      .slice(ITEMS_PER_PAGE * (page - 1), page * ITEMS_PER_PAGE)

  const ListItem = ({ item, index }) => {
    const itemData = usePairData(item.id)

    const liquidity =
      currency === "ETH"
        ? "Ξ " + formattedNum(item.combinedBalanceETH)
        : formattedNum(item.combinedBalanceETH * ethPrice, true)

    const volume =
      currency === "ETH"
        ? "Ξ " + formattedNum(itemData.oneDayVolumeETH)
        : formattedNum(itemData.oneDayVolumeUSD, true)

    return (
      <DashGrid style={{ height: "60px" }}>
        <DataText area="number" fontWeight="500">
          {index}
        </DataText>
        <DataText area="name" color="text" fontWeight="500">
          <TokenLogo address={item.id} />
          <CustomLink
            style={{ marginLeft: "10px" }}
            to={"/pair/" + item.id}
            onClick={() => {
              window.scrollTo(0, 0)
            }}
          >
            {item.token0.symbol + "-" + item.token1.symbol}
          </CustomLink>
        </DataText>
        <DataText area="liq">{liquidity}</DataText>
        <>
          <DataText area="vol">{volume}</DataText>
          <DataText area="apy">12.3%</DataText>
        </>
        <DataText area="supply">
          <Link ml="3" color="button" external href={""}>
            Add Liquidity
          </Link>
        </DataText>
      </DashGrid>
    )
  }

  return (
    <ListWrapper>
      <DashGrid center={true} style={{ height: "60px" }}>
        <Flex alignItems="center">
          <Text color="text" area="number" fontWeight="500">
            #
          </Text>
        </Flex>
        <Flex alignItems="center" justifyContent="flexStart">
          <Text color="text" area="name" fontWeight="500">
            Name
          </Text>
        </Flex>
        <Flex alignItems="center">
          <ClickableText
            area="liq"
            onClick={e => {
              setSortedColumn(SORT_FIELD.LIQ)
              setSortDirection(!sortDirection)
            }}
          >
            Liquidity{" "}
            {sortedColumn === SORT_FIELD.LIQ
              ? !sortDirection
                ? "↑"
                : "↓"
              : ""}
          </ClickableText>
        </Flex>
        {!belowMedium ? (
          <>
            <Flex alignItems="center">
              <ClickableText
                area="vol"
                onClick={e => {
                  setSortedColumn(SORT_FIELD.VOL)
                  setSortDirection(!sortDirection)
                }}
              >
                Volume (24 Hours){" "}
                {sortedColumn === SORT_FIELD.VOL
                  ? !sortDirection
                    ? "↑"
                    : "↓"
                  : ""}
              </ClickableText>
            </Flex>
            <Flex alignItems="center">
              <Text
                area="apy"
                onClick={e => {
                  setSortedColumn(SORT_FIELD.VOL)
                  setSortDirection(!sortDirection)
                }}
              >
                30d APY{" "}
                {sortedColumn === SORT_FIELD.VOL
                  ? !sortDirection
                    ? "↑"
                    : "↓"
                  : ""}
              </Text>
            </Flex>
          </>
        ) : (
          ""
        )}
        <Flex alignItems="center">
          <Text area="supply">Supply</Text>
        </Flex>
      </DashGrid>
      <Divider />
      <List p={0}>
        {!filteredItems ? (
          <LocalLoader />
        ) : (
          filteredList.map((item, index) => {
            return (
              <div key={index}>
                <ListItem key={index} index={index + 1} item={item} />
                <Divider />
              </div>
            )
          })
        )}
      </List>
      <PageButtons>
        <div
          onClick={e => {
            setPage(page === 1 ? page : page - 1)
          }}
        >
          <Arrow faded={page === 1 ? true : false}>←</Arrow>
        </div>
        {"Page " + page + " of " + maxPage}
        <div
          onClick={e => {
            setPage(page === maxPage ? page : page + 1)
          }}
        >
          <Arrow faded={page === maxPage ? true : false}>→</Arrow>
        </div>
      </PageButtons>
    </ListWrapper>
  )
}

export default PairList
