import React, { useState, useEffect, useMemo } from 'react'
import styled from 'styled-components'
import { Flex, Text } from 'rebass'
import { ChevronUp, ChevronDown } from 'react-feather'
import { useMedia } from 'react-use'

import { ButtonEmpty } from '../ButtonStyled'
import InfoHelper from '../InfoHelper'
import Loader from '../LocalLoader'
import { getHealthFactor } from '../../utils/dmm'
import ListItem, { ItemCard } from './ListItem'

const TableHeader = styled.div`
  display: grid;
  grid-gap: 1em;
  grid-template-columns: repeat(8, 1fr);
  grid-template-areas: 'pool ratio liq vol';
  padding: 15px 36px 13px 26px;
  font-size: 12px;
  align-items: center;
  height: fit-content;
  position: relative;
  opacity: ${({ fade }) => (fade ? '0.6' : '1')};
  background-color: ${({ theme }) => theme.evenRow};
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
`

const ClickableText = styled(Text)`
  display: flex;
  align-items: center;
  color: ${({ theme }) => theme.text6};
  &:hover {
    cursor: pointer;
    opacity: 0.6;
  }
  user-select: none;
  text-transform: uppercase;
`

const DataText = styled(Flex)`
  color: ${({ theme }) => theme.text7};
  flex-direction: column;
`

const LoadMoreButtonContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  background-color: ${({ theme }) => theme.oddRow};
  font-size: 12px;
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
`

const getOneYearFL = (liquidity, feeOneDay) => {
  return parseFloat(liquidity) === 0 ? 0 : (parseFloat(feeOneDay) * 365 * 100) / parseFloat(liquidity)
}

const SORT_FIELD = {
  NONE: -1,
  LIQ: 0,
  VOL: 1,
  FEES: 2,
  ONE_YEAR_FL: 3,
}

const PoolList = ({ pools, maxItems = 10 }) => {
  const above1200 = useMedia('(min-width: 1200px)') // Extra large screen

  // pagination
  const [page, setPage] = useState(1)
  const [maxPage, setMaxPage] = useState(1)
  const ITEMS_PER_PAGE = maxItems

  // sorting
  const [sortDirection, setSortDirection] = useState(true)
  const [sortedColumn, setSortedColumn] = useState(SORT_FIELD.NONE)

  const sortList = (poolA, poolB) => {
    if (sortedColumn === SORT_FIELD.NONE) {
      if (!poolA) {
        return 1
      }

      if (!poolB) {
        return -1
      }

      // Pool with AMP = 1 will be on top
      // AMP from contract is 10000 (real value is 1)å
      if (parseFloat(poolA.amp) === 10000) {
        return -1
      }

      if (parseFloat(poolB.amp) === 10000) {
        return 1
      }

      const poolAHealthFactor = getHealthFactor(poolA)
      const poolBHealthFactor = getHealthFactor(poolB)

      // Pool with better health factor will be prioritized higher
      if (poolAHealthFactor > poolBHealthFactor) {
        return -1
      }

      if (poolAHealthFactor < poolBHealthFactor) {
        return 1
      }

      return 0
    }

    switch (sortedColumn) {
      case SORT_FIELD.LIQ:
        return parseFloat(poolA.reserveUSD) > parseFloat(poolB.reserveUSD)
          ? (sortDirection ? -1 : 1) * 1
          : (sortDirection ? -1 : 1) * -1
      case SORT_FIELD.VOL:
        return parseFloat(poolA.volumeUSD) > parseFloat(poolB.volumeUSD)
          ? (sortDirection ? -1 : 1) * 1
          : (sortDirection ? -1 : 1) * -1
      case SORT_FIELD.FEES:
        return parseFloat(poolA.feeUSD) > parseFloat(poolB.feeUSD)
          ? (sortDirection ? -1 : 1) * 1
          : (sortDirection ? -1 : 1) * -1
      case SORT_FIELD.ONE_YEAR_FL:
        const oneYearFLPoolA = getOneYearFL(poolA.reserveUSD, poolA.feeUSD)
        const oneYearFLPoolB = getOneYearFL(poolB.reserveUSD, poolB.feeUSD)

        return oneYearFLPoolA > oneYearFLPoolB ? (sortDirection ? -1 : 1) * 1 : (sortDirection ? -1 : 1) * -1
      default:
        break
    }

    return 0
  }

  const renderHeader = () => {
    return above1200 ? (
      <TableHeader>
        <Flex alignItems="center" justifyContent="flexStart">
          <ClickableText>Pool</ClickableText>
        </Flex>
        <Flex alignItems="center" justifyContent="flexEnd">
          <ClickableText>Ratio</ClickableText>
          <InfoHelper
            text={
              'Current token pair ratio of the pool. Ratio changes depending on pool trades. Add liquidity according to this ratio.'
            }
          />
        </Flex>
        <Flex alignItems="center" justifyContent="flexEnd">
          <ClickableText
            onClick={() => {
              setSortedColumn(SORT_FIELD.LIQ)
              setSortDirection(sortedColumn !== SORT_FIELD.LIQ ? true : !sortDirection)
            }}
          >
            Liquidity
            {sortedColumn === SORT_FIELD.LIQ ? (
              !sortDirection ? (
                <ChevronUp size="14" style={{ marginLeft: '2px' }} />
              ) : (
                <ChevronDown size="14" style={{ marginLeft: '2px' }} />
              )
            ) : (
              ''
            )}
          </ClickableText>
        </Flex>
        <Flex alignItems="center">
          <ClickableText
            onClick={() => {
              setSortedColumn(SORT_FIELD.VOL)
              setSortDirection(sortedColumn !== SORT_FIELD.VOL ? true : !sortDirection)
            }}
          >
            Volume (24h)
            {sortedColumn === SORT_FIELD.VOL ? (
              !sortDirection ? (
                <ChevronUp size="14" style={{ marginLeft: '2px' }} />
              ) : (
                <ChevronDown size="14" style={{ marginLeft: '2px' }} />
              )
            ) : (
              ''
            )}
          </ClickableText>
        </Flex>

        <Flex alignItems="center" justifyContent="flexEnd">
          <ClickableText
            onClick={() => {
              setSortedColumn(SORT_FIELD.FEES)
              setSortDirection(sortedColumn !== SORT_FIELD.FEES ? true : !sortDirection)
            }}
          >
            Fee (24h)
            {sortedColumn === SORT_FIELD.FEES ? (
              !sortDirection ? (
                <ChevronUp size="14" style={{ marginLeft: '2px' }} />
              ) : (
                <ChevronDown size="14" style={{ marginLeft: '2px' }} />
              )
            ) : (
              ''
            )}
          </ClickableText>
        </Flex>

        <Flex alignItems="center" justifyContent="flexEnd">
          <ClickableText>AMP</ClickableText>
          <InfoHelper
            text={
              'Amplification Factor. Higher AMP, higher capital efficiency within a price range. Higher AMP recommended for more stable pairs, lower AMP for more volatile pairs.'
            }
          />
        </Flex>

        <Flex alignItems="center" justifyContent="flexEnd">
          <ClickableText
            onClick={() => {
              setSortedColumn(SORT_FIELD.ONE_YEAR_FL)
              setSortDirection(sortedColumn !== SORT_FIELD.ONE_YEAR_FL ? true : !sortDirection)
            }}
          >
            1y F/L
            {sortedColumn === SORT_FIELD.ONE_YEAR_FL ? (
              !sortDirection ? (
                <ChevronUp size="14" style={{ marginLeft: '2px' }} />
              ) : (
                <ChevronDown size="14" style={{ marginLeft: '2px' }} />
              )
            ) : (
              ''
            )}
          </ClickableText>
          <InfoHelper text={'1Yr Fees Collected/Liquidity based on 24H volume annualized'} />
        </Flex>

        <Flex alignItems="center" justifyContent="flexEnd">
          <ClickableText>Add Liquidity</ClickableText>
        </Flex>
      </TableHeader>
    ) : null
  }

  const poolsList =
    pools &&
    Object.keys(pools)
      .sort((addressA, addressB) => {
        const poolA = pools[addressA]
        const poolB = pools[addressB]
        return sortList(poolA, poolB)
      })
      .slice(0, page * ITEMS_PER_PAGE)
      .map((poolAddress) => {
        return poolAddress && pools[poolAddress]
      })

  useEffect(() => {
    setMaxPage(1) // edit this to do modular
    setPage(1)
  }, [pools])

  useEffect(() => {
    if (pools) {
      let extraPages = 1
      if (Object.keys(pools).length % ITEMS_PER_PAGE === 0) {
        extraPages = 0
      }
      setMaxPage(Math.floor(Object.keys(pools).length / ITEMS_PER_PAGE) + extraPages)
    }
  }, [ITEMS_PER_PAGE, pools])

  return (
    <div>
      {renderHeader()}
      {!poolsList ? (
        <Loader />
      ) : (
        poolsList.map((pool, index) => {
          if (pool) {
            return above1200 ? (
              <ListItem key={pool.id} pool={pool} oddRow={(index + 1) % 2 !== 0} />
            ) : (
              <ItemCard key={pool.id} pool={pool} />
            )
          }

          return null
        })
      )}
      <LoadMoreButtonContainer>
        <ButtonEmpty
          onClick={() => {
            setPage(page === maxPage ? page : page + 1)
          }}
          disabled={page >= maxPage}
          style={{ padding: '18px' }}
        >
          Show more pools
        </ButtonEmpty>
      </LoadMoreButtonContainer>
    </div>
  )
}

export default PoolList
