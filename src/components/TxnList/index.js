import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'

import { formatDate } from '../../utils'
import { useMedia } from 'react-use'

import LocalLoader from '../LocalLoader'
import { Box, Flex, Text } from 'rebass'
import Link from '../Link'
import { Divider, EmptyCard } from '..'
import FormattedName from '../FormattedName'
import { TYPE } from '../../Theme'
import { ASSETS_MAP } from '../../constants/assets'

dayjs.extend(utc)

const PageButtons = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: 2em;
  margin-bottom: 0.5em;
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
  grid-template-areas: 'txn amountToken time';

  > * {
    justify-content: flex-end;
    width: 100%;

    &:first-child {
      justify-content: flex-start;
      text-align: left;
      width: 100px;
    }
  }

  @media screen and (min-width: 500px) {
    > * {
      &:first-child {
        width: 180px;
      }
    }
  }

  @media screen and (min-width: 780px) {
    max-width: 1320px;
    grid-template-columns: 1.2fr 1fr 1fr 1fr;
    grid-template-areas: 'txn amountToken amountOther time';

    > * {
      &:first-child {
        width: 180px;
      }
    }
  }

  @media screen and (min-width: 1080px) {
    max-width: 1320px;
    grid-template-columns: 1.2fr 1fr 1fr 1fr 1fr 1fr;
    grid-template-areas: 'txn amountToken amountOther from to time';
  }
`

const ClickableText = styled(Text)`
  color: ${({ theme }) => theme.text1};
  user-select: none;
  text-align: end;

  &:hover {
    cursor: pointer;
    opacity: 0.6;
  }

  @media screen and (max-width: 640px) {
    font-size: 14px;
  }
`

const DataText = styled(Flex)`
  align-items: center;
  text-align: right;
  color: ${({ theme }) => theme.text1};

  & > * {
    font-size: 1em;
  }

  @media screen and (max-width: 40em) {
    font-size: 0.85rem;
  }
`

const SORT_FIELD = {
  NETWORK: 'network',
  AMOUNT0: 'inputAmount',
  AMOUNT1: 'outputAmount',
  TIMESTAMP: 'expiration'
}

const TXN_TYPE = {
  ALL: 'All',
  SWAP: 'Swaps',
  ADD: 'Adds',
  REMOVE: 'Removes'
}

const ITEMS_PER_PAGE = 10

// @TODO rework into virtualized list
function TxnList({ history, color }) {
  // page state
  const [page, setPage] = useState(1)
  const [maxPage, setMaxPage] = useState(1)

  // sorting
  const [sortDirection, setSortDirection] = useState(true)
  const [sortedColumn, setSortedColumn] = useState(SORT_FIELD.TIMESTAMP)
  const [txFilter] = useState(TXN_TYPE.ALL)

  useEffect(() => {
    setMaxPage(1) // edit this to do modular
    setPage(1)
  }, [history])

  // parse the txns and format for UI
  useEffect(() => {
    let extraPages = 1
    if (history.length % ITEMS_PER_PAGE === 0) {
      extraPages = 0
    }
    if (history.length === 0) {
      setMaxPage(1)
    } else {
      setMaxPage(Math.floor(history.length / ITEMS_PER_PAGE) + extraPages)
    }
  }, [history, txFilter])

  useEffect(() => {
    setPage(1)
  }, [txFilter])

  const filteredList =
    history &&
    history
      .sort((a, b) => {
        return parseFloat(a[sortedColumn]) > parseFloat(b[sortedColumn])
          ? (sortDirection ? -1 : 1) * 1
          : (sortDirection ? -1 : 1) * -1
      })
      .slice(ITEMS_PER_PAGE * (page - 1), page * ITEMS_PER_PAGE)

  const below1080 = useMedia('(max-width: 1080px)')
  const below780 = useMedia('(max-width: 780px)')

  const ListItem = ({ item }) => {
    return (
      <DashGrid style={{ height: '48px' }}>
        <DataText area="txn" fontWeight="500">
          <Link color={color} external href={`${ASSETS_MAP[item.network].txExplorer}${item.transactionHash}`}>
            {`Swap ${item.network} for ${item.outputNetwork}`}
          </Link>
        </DataText>

        <DataText area="amountToken">
          {item.inputAmountNum} <FormattedName text={item.network} maxCharacters={5} margin={true} />
        </DataText>

        {!below780 && (
          <DataText area="amountOther">
            {item.outputAmountNum}
            <FormattedName text={item.outputNetwork} maxCharacters={5} margin={true} />
          </DataText>
        )}

        {!below1080 && (
          <>
            <DataText area="from">
              <Link color={color} external href={`${ASSETS_MAP[item.network].addressExplorer}${item.sender}`}>
                {item.sender && item.sender.slice(0, 6) + '...' + item.sender.slice(38, 42)}
              </Link>
            </DataText>
          </>
        )}

        {!below1080 && (
          <DataText area="to">
            <Link
              color={color}
              external
              href={`${ASSETS_MAP[item.outputNetwork].addressExplorer}${item.outputAddress}`}
            >
              {item.outputAddress && item.outputAddress.slice(0, 6) + '...' + item.outputAddress.slice(38, 42)}
            </Link>
          </DataText>
        )}

        <DataText area="time">{formatDate(item.expiration)}</DataText>
      </DashGrid>
    )
  }

  return (
    <>
      <DashGrid center={true} style={{ height: 'fit-content', padding: '0 0 1rem 0' }}>
        <Flex alignItems="center" justifyContent="flexStart">
          <TYPE.main area="txn">Pair</TYPE.main>
        </Flex>

        <Flex alignItems="center">
          <ClickableText
            area="amountToken"
            color="textDim"
            onClick={() => {
              setSortedColumn(SORT_FIELD.AMOUNT0)
              setSortDirection(sortedColumn !== SORT_FIELD.AMOUNT0 ? true : !sortDirection)
            }}
          >
            Coin Amount
            {sortedColumn === SORT_FIELD.AMOUNT0 ? (sortDirection ? '↑' : '↓') : ''}
          </ClickableText>
        </Flex>

        <>
          {!below780 && (
            <Flex alignItems="center">
              <ClickableText
                area="amountOther"
                color="textDim"
                onClick={() => {
                  setSortedColumn(SORT_FIELD.AMOUNT1)
                  setSortDirection(sortedColumn !== SORT_FIELD.AMOUNT1 ? true : !sortDirection)
                }}
              >
                Coin Amount
                {sortedColumn === SORT_FIELD.AMOUNT1 ? (sortDirection ? '↑' : '↓') : ''}
              </ClickableText>
            </Flex>
          )}

          {!below1080 && (
            <Flex alignItems="center">
              <TYPE.body area="account">From</TYPE.body>
            </Flex>
          )}

          {!below1080 && (
            <Flex alignItems="center">
              <TYPE.body area="account">To</TYPE.body>
            </Flex>
          )}

          <Flex alignItems="center">
            <ClickableText
              area="time"
              color="textDim"
              onClick={() => {
                setSortedColumn(SORT_FIELD.TIMESTAMP)
                setSortDirection(sortedColumn !== SORT_FIELD.TIMESTAMP ? true : !sortDirection)
              }}
            >
              Expiration {sortedColumn === SORT_FIELD.TIMESTAMP ? (!sortDirection ? '↑' : '↓') : ''}
            </ClickableText>
          </Flex>
        </>
      </DashGrid>
      <Divider />
      <List p={0}>
        {!filteredList ? (
          <LocalLoader />
        ) : filteredList.length === 0 ? (
          <EmptyCard>No recent transactions found.</EmptyCard>
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
        <TYPE.body>{'Page ' + page + ' of ' + maxPage}</TYPE.body>
        <div
          onClick={e => {
            setPage(page === maxPage ? page : page + 1)
          }}
        >
          <Arrow faded={page === maxPage ? true : false}>→</Arrow>
        </div>
      </PageButtons>
    </>
  )
}

export default TxnList
