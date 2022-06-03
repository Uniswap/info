import React, { useState, useEffect } from 'react'
import { useMedia } from 'react-use'
import dayjs from 'dayjs'
import LocalLoader from '../LocalLoader'
import utc from 'dayjs/plugin/utc'
import { Box, Flex, Text } from 'rebass'
import styled from 'styled-components'

import { CustomLink } from '../Link'
import { Divider } from '../../components'
import { withRouter } from 'react-router-dom'
import { formattedNum, formattedPercent } from '../../utils'
import DoubleTokenLogo from '../DoubleLogo'
import FormattedName from '../FormattedName'
import QuestionHelper from '../QuestionHelper'
import { TYPE } from '../../Theme'
import { PAIR_BLACKLIST } from '../../constants'
import { AutoColumn } from '../Column'

dayjs.extend(utc)

const PageButtons = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: 2em;
  margin-bottom: 0.5em;
`

const Arrow = styled.div`
  color: ${({ theme }) => theme.primary1};
  opacity: ${(props) => (props.faded ? 0.3 : 1)};
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
  grid-template-areas: 'name liq reserve0';
  padding: 0 1.125rem;

  opacity: ${({ fade }) => (fade ? '0.6' : '1')};

  > * {
    justify-content: flex-end;

    :first-child {
      justify-content: flex-start;
      text-align: left;
      width: 20px;
    }
  }

  @media screen and (min-width: 740px) {
    padding: 0 1.125rem;
    grid-template-columns: 1.5fr 1fr 1fr};
    grid-template-areas: ' name liq reserve0 pool ';
  }

  @media screen and (min-width: 1080px) {
    padding: 0 1.125rem;
    grid-template-columns: 1.5fr 1fr 1fr 1fr 1fr 1fr;
    grid-template-areas: ' name liq reserve0 reserve1 fees apy';
  }

  @media screen and (min-width: 1200px) {
    grid-template-columns: 1.5fr 1fr 1fr 1fr 1fr 1fr;
    grid-template-areas: ' name liq reserve0 reserve1 fees apy';
  }
`

const ListWrapper = styled.div``

const ClickableText = styled(Text)`
  color: ${({ theme }) => theme.text1};
  &:hover {
    cursor: pointer;
    opacity: 0.6;
  }
  text-align: end;
  user-select: none;
`

const DataText = styled(Flex)`
  align-items: center;
  text-align: center;
  color: ${({ theme }) => theme.text1};

  & > * {
    font-size: 14px;
  }

  @media screen and (max-width: 600px) {
    font-size: 12px;
  }
`

const SORT_FIELD = {
  LIQ: 0,
  RESERVE0: 1,
  RESERVE1: 3,
  FEES: 4,
  APY: 5,
}

const FIELD_TO_VALUE = (field, useTracked) => {
  switch (field) {
    case SORT_FIELD.LIQ:
      return useTracked ? 'trackedReserveUSD' : 'reserveUSD'
    case SORT_FIELD.RESERVE0:
      return useTracked ? 'oneDayVolumeUSD' : 'oneDayVolumeUntracked'
    case SORT_FIELD.RESERVE1:
      return useTracked ? 'oneWeekVolumeUSD' : 'oneWeekVolumeUntracked'
    case SORT_FIELD.FEES:
      return useTracked ? 'oneDayVolumeUSD' : 'oneDayVolumeUntracked'
    default:
      return 'trackedReserveUSD'
  }
}

const formatDataText = (value, trackedValue, supressWarning = false) => {
  const showUntracked = value !== '$0' && !trackedValue & !supressWarning
  return (
    <AutoColumn gap="2px" style={{ opacity: showUntracked ? '0.7' : '1' }}>
      <div style={{ textAlign: 'right' }}>{value}</div>
      <TYPE.light fontSize={'9px'} style={{ textAlign: 'right' }}>
        {showUntracked ? 'untracked' : '  '}
      </TYPE.light>
    </AutoColumn>
  )
}

function PairList({ pairs, color, disbaleLinks, maxItems = 10, useTracked = false }) {
  const below600 = useMedia('(max-width: 600px)')
  const below740 = useMedia('(max-width: 740px)')
  const below1080 = useMedia('(max-width: 1080px)')

  // pagination
  const [page, setPage] = useState(1)
  const [maxPage, setMaxPage] = useState(1)
  const ITEMS_PER_PAGE = maxItems

  // sorting
  const [sortDirection, setSortDirection] = useState(true)
  const [sortedColumn, setSortedColumn] = useState(SORT_FIELD.LIQ)

  useEffect(() => {
    setMaxPage(1) // edit this to do modular
    setPage(1)
  }, [pairs])

  useEffect(() => {
    if (pairs) {
      let extraPages = 1
      if (Object.keys(pairs).length % ITEMS_PER_PAGE === 0) {
        extraPages = 0
      }
      setMaxPage(Math.floor(Object.keys(pairs).length / ITEMS_PER_PAGE) + extraPages)
    }
  }, [ITEMS_PER_PAGE, pairs])

  const ListItem = ({ pairAddress, index }) => {
    const pairData = pairs[pairAddress]
    console.log("pairDatapairData", pairData);
    if (pairData && pairData.token0 && pairData.token1) {
      const liquidity = formattedNum(
        !!pairData.trackedReserveUSD ? pairData.trackedReserveUSD : pairData.reserveUSD,
        true
      )

      const volume = formattedNum(
        pairData.oneDayVolumeUSD ? pairData.oneDayVolumeUSD : pairData.oneDayVolumeUntracked,
        true
      )

      const apy = formattedPercent(
        ((pairData.oneDayVolumeUSD ? pairData.oneDayVolumeUSD : pairData.oneDayVolumeUntracked) * 0.003 * 365 * 100) /
        (pairData.oneDayVolumeUSD ? pairData.trackedReserveUSD : pairData.reserveUSD)
      )

      const weekVolume = formattedNum(
        pairData.oneWeekVolumeUSD ? pairData.oneWeekVolumeUSD : pairData.oneWeekVolumeUntracked,
        true
      )

      const fees = formattedNum(
        pairData.oneDayVolumeUSD ? pairData.oneDayVolumeUSD * 0.003 : pairData.oneDayVolumeUntracked * 0.003,
        true
      )

      // const volume = formattedNum(
      //   pairData.oneDayVolumeUSD ? pairData.oneDayVolumeUSD : pairData.oneDayVolumeUntracked,
      //   true
      // )


      const reserve1 = formattedNum(
        pairData.reserve1 ? pairData.reserve1 : 0,
        true
      )

      const reserve0 = formattedNum(
        pairData.reserve0 ? pairData.reserve0 : 0,
        true
      )

      return (
        <DashGrid style={{ height: '48px' }} disbaleLinks={disbaleLinks} focus={true}>
          <DataText area="name" fontWeight="500">
            {!below600 && <div style={{ marginRight: '20px', width: '10px' }}>{index}</div>}
            <DoubleTokenLogo
              size={below600 ? 16 : 20}
              a0={pairData.token0.id}
              a1={pairData.token1.id}
              margin={!below740}
            />
            <CustomLink style={{ marginLeft: '20px', whiteSpace: 'nowrap' }} to={'/pair/' + pairAddress} color={color}>
              <FormattedName
                text={pairData.token0.symbol + '-' + pairData.token1.symbol}
                maxCharacters={below600 ? 8 : 16}
                adjustSize={true}
                link={true}
              />
            </CustomLink>
          </DataText>
          <DataText area="liq">{formatDataText(liquidity, pairData.trackedReserveUSD)}</DataText>
          <DataText area="reserve0">{formatDataText(reserve0, pairData.reserve0)}</DataText>
          {!below1080 && <DataText area="reserve1">{formatDataText(reserve1, pairData.reserve1)}</DataText>}
          {!below1080 && <DataText area="fees">{formatDataText(fees, pairData.fees)}</DataText>}
          {!below1080 && (
            <DataText area="apy">
              {formatDataText(apy, pairData.oneDayVolumeUSD, pairData.oneDayVolumeUSD === 0)}
            </DataText>
          )}
        </DashGrid>
      )
    } else {
      return ''
    }
  }

  const pairList =
    pairs &&
    Object.keys(pairs)
      .filter(
        (address) => !PAIR_BLACKLIST.includes(address) && (useTracked ? !!pairs[address].trackedReserveUSD : true)
      )
      .sort((addressA, addressB) => {
        const pairA = pairs[addressA]
        const pairB = pairs[addressB]
        if (sortedColumn === SORT_FIELD.APY) {
          const apy0 = parseFloat(pairA.oneDayVolumeUSD * 0.003 * 356 * 100) / parseFloat(pairA.reserveUSD)
          const apy1 = parseFloat(pairB.oneDayVolumeUSD * 0.003 * 356 * 100) / parseFloat(pairB.reserveUSD)
          return apy0 > apy1 ? (sortDirection ? -1 : 1) * 1 : (sortDirection ? -1 : 1) * -1
        }
        return parseFloat(pairA[FIELD_TO_VALUE(sortedColumn, useTracked)]) >
          parseFloat(pairB[FIELD_TO_VALUE(sortedColumn, useTracked)])
          ? (sortDirection ? -1 : 1) * 1
          : (sortDirection ? -1 : 1) * -1
      })
      .slice(ITEMS_PER_PAGE * (page - 1), page * ITEMS_PER_PAGE)
      .map((pairAddress, index) => {
        return (
          pairAddress && (
            <div key={index}>
              <ListItem key={index} index={(page - 1) * ITEMS_PER_PAGE + index + 1} pairAddress={pairAddress} />
              <Divider />
            </div>
          )
        )
      })
  // console.log("pairList", pairList);
  return (
    <ListWrapper>
      <DashGrid
        center={true}
        disbaleLinks={disbaleLinks}
        style={{ height: 'fit-content', padding: '0 1.125rem 1rem 1.125rem' }}
      >
        <Flex alignItems="center" justifyContent="flexStart">
          <TYPE.main area="name">Name</TYPE.main>
        </Flex>
        <Flex alignItems="center" justifyContent="flexEnd">
          <ClickableText
            area="liq"
            onClick={(e) => {
              setSortedColumn(SORT_FIELD.LIQ)
              setSortDirection(sortedColumn !== SORT_FIELD.LIQ ? true : !sortDirection)
            }}
          >
            Liquidity {sortedColumn === SORT_FIELD.LIQ ? (!sortDirection ? '↑' : '↓') : ''}
          </ClickableText>
        </Flex>
        <Flex alignItems="center">
          <ClickableText
            area="reserve0"
            onClick={(e) => {
              setSortedColumn(SORT_FIELD.RESERVE0)
              setSortDirection(sortedColumn !== SORT_FIELD.RESERVE0 ? true : !sortDirection)
            }}
          >
            Reserve 0
            {sortedColumn === SORT_FIELD.RESERVE0 ? (!sortDirection ? '↑' : '↓') : ''}
          </ClickableText>
        </Flex>
        {!below1080 && (
          <Flex alignItems="center" justifyContent="flexEnd">
            <ClickableText
              area="reserve1"
              onClick={(e) => {
                setSortedColumn(SORT_FIELD.RESERVE1)
                setSortDirection(sortedColumn !== SORT_FIELD.RESERVE1 ? true : !sortDirection)
              }}
            >
              Reserve 1 {sortedColumn === SORT_FIELD.RESERVE1 ? (!sortDirection ? '↑' : '↓') : ''}
            </ClickableText>
          </Flex>
        )}
        {!below1080 && (
          <Flex alignItems="center" justifyContent="flexEnd">
            <ClickableText
              area="fees"
              onClick={(e) => {
                setSortedColumn(SORT_FIELD.FEES)
                setSortDirection(sortedColumn !== SORT_FIELD.FEES ? true : !sortDirection)
              }}
            >
              Fees {sortedColumn === SORT_FIELD.FEES ? (!sortDirection ? '↑' : '↓') : ''}
            </ClickableText>
          </Flex>
        )}
        {!below1080 && (
          <Flex alignItems="center" justifyContent="flexEnd">
            <ClickableText
              area="apy"
              onClick={(e) => {
                setSortedColumn(SORT_FIELD.APY)
                setSortDirection(sortedColumn !== SORT_FIELD.APY ? true : !sortDirection)
              }}
            >
              1y Fees / Liquidity {sortedColumn === SORT_FIELD.APY ? (!sortDirection ? '↑' : '↓') : ''}
            </ClickableText>
            <QuestionHelper text={'Based on 24hr volume annualized'} />
          </Flex>
        )}
      </DashGrid>
      <Divider />
      <List p={0}>{!pairList ? <LocalLoader /> : pairList}</List>
      <PageButtons>
        <div
          onClick={(e) => {
            setPage(page === 1 ? page : page - 1)
          }}
        >
          <Arrow faded={page === 1 ? true : false}>←</Arrow>
        </div>
        <TYPE.body>{'Page ' + page + ' of ' + maxPage}</TYPE.body>
        <div
          onClick={(e) => {
            setPage(page === maxPage ? page : page + 1)
          }}
        >
          <Arrow faded={page === maxPage ? true : false}>→</Arrow>
        </div>
      </PageButtons>
    </ListWrapper>
  )
}

export default withRouter(PairList)
