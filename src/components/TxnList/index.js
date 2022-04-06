import { useState, useEffect } from 'react'
import styled from 'styled-components/macro'

import { formatTime, formattedNum, urls } from '../../utils'
import { useMedia } from 'react-use'
import { useCurrentCurrency } from '../../contexts/Application'
import { RowFixed, RowBetween } from '../Row'

import LocalLoader from '../LocalLoader'
import { Box, Flex, Text } from 'rebass'
import Link from '../Link'
import { Divider, EmptyCard } from '..'
import DropdownSelect from '../DropdownSelect'
import FormattedName from '../FormattedName'
import { TYPE } from '../../Theme'
import { transparentize } from 'polished'
import Panel from '../Panel'
import { useTranslation } from 'react-i18next'

const PageButtons = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: 2em;

  @media screen and (max-width: 440px) {
    margin-top: 0.75rem;
  }
`

const Arrow = styled.div`
  color: #6681a7;
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
  grid-template-areas: 'txn value time';
  border-top: 1px solid ${({ theme }) => theme.bg7};
  padding: 1rem 2rem;

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
    grid-template-columns: 1.2fr 1fr 1fr 1fr 1fr;
    grid-template-areas: 'txn value amountToken amountOther time';

    > * {
      &:first-child {
        width: 180px;
      }
    }
  }

  @media screen and (min-width: 1080px) {
    max-width: 1320px;
    grid-template-columns: 1.2fr 1fr 1fr 1fr 1fr 1fr;
    grid-template-areas: 'txn value amountToken amountOther account time';
  }

  @media screen and (max-width: 440px) {
    padding: 0.75rem;
  }
`

const CustomLink = styled(Link)`
  color: ${({ theme }) => theme.blueGrey};
  font-weight: 600;

  @media screen and (max-width: 440px) {
    font-size: 10px;
  }
`

const ClickableText = styled(Text)`
  color: ${({ theme }) => transparentize(0.3, theme.text6)};
  user-select: none;
  text-align: end;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;

  &:hover {
    opacity: 0.6;
  }

  @media screen and (max-width: 440px) {
    font-size: 10px;
  }
`

const DataText = styled(Flex)`
  align-items: center;
  text-align: right;
  color: ${({ theme }) => transparentize(0.5, theme.text6)};

  & > * {
    font-size: 1em;
  }

  @media screen and (max-width: 40em) {
    font-size: 0.85rem;
  }

  @media screen and (max-width: 440px) {
    font-size: 10px;
  }
`

const SortText = styled.button`
  cursor: pointer;
  font-weight: ${({ active }) => (active ? 500 : 400)};
  margin-right: 0.75rem !important;
  border: none;
  background-color: transparent;
  font-size: 1rem;
  padding: 0px;
  color: ${({ active, theme }) => (active ? theme.text1 : theme.text3)};
  outline: none;

  @media screen and (max-width: 600px) {
    font-size: 14px;
  }

  @media screen and (max-width: 440px) {
    font-size: 10px;
  }
`

const SORT_FIELD = {
  VALUE: 'amountUSD',
  AMOUNT0: 'token0Amount',
  AMOUNT1: 'token1Amount',
  TIMESTAMP: 'timestamp'
}

const TXN_TYPE = {
  ALL: 'All',
  SWAP: 'Swaps',
  ADD: 'Adds',
  REMOVE: 'Removes'
}

const ITEMS_PER_PAGE = 10

function getTransactionType(event, symbol0, symbol1) {
  const formattedS0 = symbol0?.length > 8 ? symbol0.slice(0, 7) + '...' : symbol0
  const formattedS1 = symbol1?.length > 8 ? symbol1.slice(0, 7) + '...' : symbol1
  switch (event) {
    case TXN_TYPE.ADD:
      return 'Add ' + formattedS0 + ' and ' + formattedS1
    case TXN_TYPE.REMOVE:
      return 'Remove ' + formattedS0 + ' and ' + formattedS1
    case TXN_TYPE.SWAP:
      return 'Swap ' + formattedS0 + ' for ' + formattedS1
    default:
      return ''
  }
}

// @TODO rework into virtualized list
function TxnList({ transactions, symbol0Override, symbol1Override, color }) {
  const { t } = useTranslation()

  // page state
  const [page, setPage] = useState(1)
  const [maxPage, setMaxPage] = useState(1)

  // sorting
  const [sortDirection, setSortDirection] = useState(true)
  const [sortedColumn, setSortedColumn] = useState(SORT_FIELD.TIMESTAMP)
  const [filteredItems, setFilteredItems] = useState()
  const [txFilter, setTxFilter] = useState(TXN_TYPE.ALL)

  const [currency] = useCurrentCurrency()

  useEffect(() => {
    setMaxPage(1) // edit this to do modular
    setPage(1)
  }, [transactions])

  // parse the txns and format for UI
  useEffect(() => {
    if (transactions && transactions.mints && transactions.burns && transactions.swaps) {
      let newTxns = []
      if (transactions.mints.length > 0) {
        transactions.mints.map(mint => {
          let newTxn = {}
          newTxn.hash = mint.transaction.id
          newTxn.timestamp = mint.transaction.timestamp
          newTxn.type = TXN_TYPE.ADD
          newTxn.token0Amount = mint.amount0
          newTxn.token1Amount = mint.amount1
          newTxn.account = mint.to
          newTxn.token0Symbol = mint.pair.token0.symbol
          newTxn.token1Symbol = mint.pair.token1.symbol
          newTxn.amountUSD = mint.amountUSD
          return newTxns.push(newTxn)
        })
      }
      if (transactions.burns.length > 0) {
        transactions.burns.map(burn => {
          let newTxn = {}
          newTxn.hash = burn.transaction.id
          newTxn.timestamp = burn.transaction.timestamp
          newTxn.type = TXN_TYPE.REMOVE
          newTxn.token0Amount = burn.amount0
          newTxn.token1Amount = burn.amount1
          newTxn.account = burn.sender
          newTxn.token0Symbol = burn.pair.token0.symbol
          newTxn.token1Symbol = burn.pair.token1.symbol
          newTxn.amountUSD = burn.amountUSD
          return newTxns.push(newTxn)
        })
      }
      if (transactions.swaps.length > 0) {
        transactions.swaps.map(swap => {
          const netToken0 = swap.amount0In - swap.amount0Out
          const netToken1 = swap.amount1In - swap.amount1Out

          let newTxn = {}

          if (netToken0 < 0) {
            newTxn.token0Symbol = swap.pair.token0.symbol
            newTxn.token1Symbol = swap.pair.token1.symbol
            newTxn.token0Amount = Math.abs(netToken0)
            newTxn.token1Amount = Math.abs(netToken1)
          } else if (netToken1 < 0) {
            newTxn.token0Symbol = swap.pair.token1.symbol
            newTxn.token1Symbol = swap.pair.token0.symbol
            newTxn.token0Amount = Math.abs(netToken1)
            newTxn.token1Amount = Math.abs(netToken0)
          }

          newTxn.hash = swap.transaction.id
          newTxn.timestamp = swap.transaction.timestamp
          newTxn.type = TXN_TYPE.SWAP

          newTxn.amountUSD = swap.amountUSD
          newTxn.account = swap.to
          return newTxns.push(newTxn)
        })
      }

      const filtered = newTxns.filter(item => {
        if (txFilter !== TXN_TYPE.ALL) {
          return item.type === txFilter
        }
        return true
      })
      setFilteredItems(filtered)
      let extraPages = 1
      if (filtered.length % ITEMS_PER_PAGE === 0) {
        extraPages = 0
      }
      if (filtered.length === 0) {
        setMaxPage(1)
      } else {
        setMaxPage(Math.floor(filtered.length / ITEMS_PER_PAGE) + extraPages)
      }
    }
  }, [transactions, txFilter])

  useEffect(() => {
    setPage(1)
  }, [txFilter])

  const filteredList =
    filteredItems &&
    filteredItems
      .sort((a, b) => {
        return parseFloat(a[sortedColumn]) > parseFloat(b[sortedColumn])
          ? (sortDirection ? -1 : 1) * 1
          : (sortDirection ? -1 : 1) * -1
      })
      .slice(ITEMS_PER_PAGE * (page - 1), page * ITEMS_PER_PAGE)

  const below1080 = useMedia('(max-width: 1080px)')
  const below780 = useMedia('(max-width: 780px)')
  const below440 = useMedia('(max-width: 440px)')

  const ListItem = ({ item }) => {
    if (item.token0Symbol === 'WETH') {
      item.token0Symbol = 'ETH'
    }

    if (item.token1Symbol === 'WETH') {
      item.token1Symbol = 'ETH'
    }

    return (
      <DashGrid>
        <DataText area="txn" fontWeight="500">
          <CustomLink external href={urls.showTransaction(item.hash)} style={{ fontWeight: 700 }}>
            {getTransactionType(item.type, item.token1Symbol, item.token0Symbol)}
          </CustomLink>
        </DataText>
        <DataText area="value">
          {currency === 'ETH' ? 'Ξ ' + formattedNum(item.valueETH) : formattedNum(item.amountUSD, true)}
        </DataText>
        {!below780 && (
          <>
            <DataText area="amountOther">
              {formattedNum(item.token1Amount) + ' '}{' '}
              <FormattedName text={item.token1Symbol} maxCharacters={5} margin={true} />
            </DataText>
            <DataText area="amountToken">
              {formattedNum(item.token0Amount) + ' '}{' '}
              <FormattedName text={item.token0Symbol} maxCharacters={5} margin={true} />
            </DataText>
          </>
        )}
        {!below1080 && (
          <DataText area="account">
            <CustomLink external href={'https://etherscan.io/address/' + item.account}>
              {item.account && item.account.slice(0, 6) + '...' + item.account.slice(38, 42)}
            </CustomLink>
          </DataText>
        )}
        <DataText area="time">{formatTime(item.timestamp)}</DataText>
      </DashGrid>
    )
  }

  return (
    <>
      <Panel
        style={{
          marginTop: below440 ? '.75rem' : '1.5rem',
          padding: 0
        }}
      >
        <DashGrid center={true} style={{ height: 'fit-content', border: 'unset' }}>
          {below780 ? (
            <RowBetween area="txn">
              <DropdownSelect options={TXN_TYPE} active={txFilter} setActive={setTxFilter} color={color} />
            </RowBetween>
          ) : (
            <RowFixed area="txn" gap="10px" pl={4}>
              <SortText
                onClick={() => {
                  setTxFilter(TXN_TYPE.ALL)
                }}
                active={txFilter === TXN_TYPE.ALL}
              >
                {t('all')}
              </SortText>
              <SortText
                onClick={() => {
                  setTxFilter(TXN_TYPE.SWAP)
                }}
                active={txFilter === TXN_TYPE.SWAP}
              >
                {t('swaps')}
              </SortText>
              <SortText
                onClick={() => {
                  setTxFilter(TXN_TYPE.ADD)
                }}
                active={txFilter === TXN_TYPE.ADD}
              >
                {t('adds')}
              </SortText>
              <SortText
                onClick={() => {
                  setTxFilter(TXN_TYPE.REMOVE)
                }}
                active={txFilter === TXN_TYPE.REMOVE}
              >
                {t('removes')}
              </SortText>
            </RowFixed>
          )}

          <Flex alignItems="center" justifyContent="flexStart">
            <ClickableText
              color="textDim"
              area="value"
              onClick={() => {
                setSortedColumn(SORT_FIELD.VALUE)
                setSortDirection(sortedColumn !== SORT_FIELD.VALUE ? true : !sortDirection)
              }}
            >
              {t('totalValue')} {sortedColumn === SORT_FIELD.VALUE ? (!sortDirection ? '↑' : '↓') : ''}
            </ClickableText>
          </Flex>
          {!below780 && (
            <Flex alignItems="center">
              <ClickableText
                area="amountToken"
                color="textDim"
                onClick={() => {
                  setSortedColumn(SORT_FIELD.AMOUNT0)
                  setSortDirection(sortedColumn !== SORT_FIELD.AMOUNT0 ? true : !sortDirection)
                }}
              >
                {symbol0Override ? symbol0Override + ` ${t('amount')}` : t('tokenAmount')}{' '}
                {sortedColumn === SORT_FIELD.AMOUNT0 ? (sortDirection ? '↑' : '↓') : ''}
              </ClickableText>
            </Flex>
          )}
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
                  {symbol1Override ? symbol1Override + ` ${t('amount')}` : t('tokenAmount')}{' '}
                  {sortedColumn === SORT_FIELD.AMOUNT1 ? (sortDirection ? '↑' : '↓') : ''}
                </ClickableText>
              </Flex>
            )}
            {!below1080 && (
              <Flex alignItems="center">
                <TYPE.body area="account">{t('account')}</TYPE.body>
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
                {t('time')} {sortedColumn === SORT_FIELD.TIMESTAMP ? (!sortDirection ? '↑' : '↓') : ''}
              </ClickableText>
            </Flex>
          </>
        </DashGrid>
        <Divider />
        <List p={0}>
          {!filteredList ? (
            <LocalLoader />
          ) : filteredList.length === 0 ? (
            <EmptyCard>{t('noRecentTransactions')}</EmptyCard>
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
      </Panel>
      <PageButtons>
        <div
          onClick={() => {
            setPage(page === 1 ? page : page - 1)
          }}
        >
          <Arrow faded={page === 1 ? true : false}>←</Arrow>
        </div>
        <TYPE.body>{`${t('page')} ${page} ${t('of')} ${maxPage}`}</TYPE.body>
        <div
          onClick={() => {
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
