import React, { useState, useEffect } from 'react'
import { useMedia } from 'react-use'
import dayjs from 'dayjs'
import LocalLoader from '../LocalLoader'
import utc from 'dayjs/plugin/utc'
import { Box, Flex, Text } from 'rebass'
import styled from 'styled-components'

import Link, { CustomLink } from '../Link'
import { Divider } from '../../components'

import { formattedNum, getPoolLink, getSwapLink } from '../../helpers'
import DoubleTokenLogo from '../DoubleLogo'
import { ButtonLight, ButtonDark } from '../ButtonStyled'
import { withRouter } from 'react-router-dom'

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
  grid-template-areas: 'name liq vol';

  :hover {
    cursor: ${({ focus }) => focus && 'pointer'};
    background-color: ${({ focus, theme }) => focus && theme.bg3};
  }

  > * {
    justify-content: flex-end;
    width: 100%;

    :first-child {
      justify-content: flex-start;
      text-align: left;
      width: 20px;
    }
  }

  @media screen and (min-width: 740px) {
    grid-template-columns: 1.5fr 1fr 1fr 300px;
    grid-template-areas: ' name liq vol pool ';
  }

  @media screen and (min-width: 1080px) {
    grid-template-columns: 1.5fr 1fr 1fr 1fr 1fr 300px;
    grid-template-areas: ' name liq vol volWeek fees pool ';
  }

  @media screen and (min-width: 1200px) {
    grid-template-columns: 1.5fr 1fr 1fr 1fr 1fr 300px;
    grid-template-areas: ' name liq vol volWeek fees pool';
  }
`

const ListWrapper = styled.div``

const ClickableText = styled(Text)`
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

  & > * {
    font-size: 1em;
  }

  @media screen and (max-width: 600px) {
    font-size: 13px;
  }
`

const SORT_FIELD = {
  LIQ: 'reserveUSD',
  VOL: 'oneDayVolumeUSD',
  TXNS: 'oneDayTxns',
  VOL_7DAYS: 'oneWeekVolumeUSD',
  FEES: 'oneDayVolumeUSD'
}

function PairList({ pairs, color, history }) {
  const below600 = useMedia('(max-width: 600px)')
  const below740 = useMedia('(max-width: 740px)')
  const below1080 = useMedia('(max-width: 1080px)')

  // pagination
  const [page, setPage] = useState(1)
  const [maxPage, setMaxPage] = useState(1)
  const ITEMS_PER_PAGE = 10

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
  }, [pairs])

  const ListItem = ({ item, index }) => {
    const pairData = item

    if (pairData && pairData.token0 && pairData.token1) {
      const liquidity = formattedNum(pairData.reserveUSD, true)
      const volume = formattedNum(pairData.oneDayVolumeUSD, true)

      if (pairData.token0.id === '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2') {
        pairData.token0.name = 'ETH (Wrapped)'
        pairData.token0.symbol = 'ETH'
      }

      if (pairData.token1.id === '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2') {
        pairData.token1.name = 'ETH (Wrapped)'
        pairData.token1.symbol = 'ETH'
      }

      return (
        <DashGrid style={{ height: '60px' }} focus={true} onClick={() => history.push('/pair/' + item.id)}>
          <DataText area="name" fontWeight="500">
            {!below600 && <div style={{ marginRight: '20px' }}>{index}</div>}
            <DoubleTokenLogo
              size={below600 ? 16 : 20}
              a0={pairData.token0.id}
              a1={pairData.token1.id}
              margin={!below740}
            />
            <CustomLink
              style={{ marginLeft: '20px', whiteSpace: 'nowrap' }}
              to={'/pair/' + item.id}
              onClick={() => {
                window.scrollTo(0, 0)
              }}
              color={color}
            >
              {pairData.token0.symbol + '-' + pairData.token1.symbol}
            </CustomLink>
          </DataText>
          <DataText area="liq">{liquidity}</DataText>
          <DataText area="vol">{volume}</DataText>
          {!below1080 && <DataText area="volWeek">{formattedNum(pairData.oneWeekVolumeUSD, true)}</DataText>}
          {!below1080 && <DataText area="fees">{formattedNum(pairData.oneDayVolumeUSD * 0.003, true)}</DataText>}
          {!below740 && (
            <Flex area="pool" justifyContent="flex-end" alignItems="center">
              <Link color={color} external href={getPoolLink(pairData.token0?.id, pairData.token1?.id)}>
                <ButtonLight color={color} style={{ marginRight: '10px' }}>
                  + Add Liquidity
                </ButtonLight>
              </Link>
              <Link color={'white'} external href={getSwapLink(pairData.token0?.id, pairData.token1?.id)}>
                <ButtonDark color={color}>Trade</ButtonDark>
              </Link>
            </Flex>
          )}
        </DashGrid>
      )
    } else {
      return ''
    }
  }

  const pairList =
    pairs &&
    pairs
      .sort((pairA, pairB) => {
        return parseFloat(pairA[sortedColumn]) > parseFloat(pairB[sortedColumn])
          ? (sortDirection ? -1 : 1) * 1
          : (sortDirection ? -1 : 1) * -1
      })
      .slice(ITEMS_PER_PAGE * (page - 1), page * ITEMS_PER_PAGE)
      .map((item, index) => {
        return (
          item && (
            <div key={index}>
              <ListItem key={index} index={(page - 1) * 10 + index + 1} item={item} />
              <Divider />
            </div>
          )
        )
      })

  return (
    <ListWrapper>
      <DashGrid center={true} style={{ height: 'fit-content', padding: '0 0 1rem 0' }}>
        <Flex alignItems="center" justifyContent="flexStart">
          <Text area="name" fontWeight="500">
            Name
          </Text>
        </Flex>
        <Flex alignItems="center" justifyContent="flexEnd">
          <ClickableText
            area="liq"
            onClick={e => {
              setSortedColumn(SORT_FIELD.LIQ)
              setSortDirection(sortedColumn !== SORT_FIELD.LIQ ? true : !sortDirection)
            }}
          >
            Liquidity {sortedColumn === SORT_FIELD.LIQ ? (!sortDirection ? '↑' : '↓') : ''}
          </ClickableText>
        </Flex>
        <Flex alignItems="center">
          <ClickableText
            area="vol"
            onClick={e => {
              setSortedColumn(SORT_FIELD.VOL)
              setSortDirection(sortedColumn !== SORT_FIELD.VOL ? true : !sortDirection)
            }}
          >
            Volume (24hrs)
            {sortedColumn === SORT_FIELD.VOL ? (!sortDirection ? '↑' : '↓') : ''}
          </ClickableText>
        </Flex>
        {!below1080 && (
          <Flex alignItems="center" justifyContent="flexEnd">
            <ClickableText
              area="volWeek"
              onClick={e => {
                setSortedColumn(SORT_FIELD.VOL_7DAYS)
                setSortDirection(sortedColumn !== SORT_FIELD.VOL_7DAYS ? true : !sortDirection)
              }}
            >
              Volume (7d) {sortedColumn === SORT_FIELD.VOL_7DAYS ? (!sortDirection ? '↑' : '↓') : ''}
            </ClickableText>
          </Flex>
        )}
        {!below1080 && (
          <Flex alignItems="center" justifyContent="flexEnd">
            <ClickableText
              area="fees"
              onClick={e => {
                setSortedColumn(SORT_FIELD.FEES)
                setSortDirection(sortedColumn !== SORT_FIELD.FEES ? true : !sortDirection)
              }}
            >
              Fees (24hr) {sortedColumn === SORT_FIELD.FEES ? (!sortDirection ? '↑' : '↓') : ''}
            </ClickableText>
          </Flex>
        )}
        {!below740 && (
          <Flex alignItems="center" justifyContent="center">
            <Text area="pool"></Text>
          </Flex>
        )}
      </DashGrid>
      <Divider />
      <List p={0}>{!pairList ? <LocalLoader /> : pairList}</List>
      <PageButtons>
        <div
          onClick={e => {
            setPage(page === 1 ? page : page - 1)
          }}
        >
          <Arrow faded={page === 1 ? true : false}>←</Arrow>
        </div>
        {'Page ' + page + ' of ' + maxPage}
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

export default withRouter(PairList)
