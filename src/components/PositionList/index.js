import React, { useState, useEffect } from 'react'
import { useMedia } from 'react-use'
import dayjs from 'dayjs'
import LocalLoader from '../LocalLoader'
import utc from 'dayjs/plugin/utc'
import { Box, Flex, Text } from 'rebass'
import styled from 'styled-components'
import { CustomLink } from '../Link'
import { Divider } from '../../components'
import DoubleTokenLogo from '../DoubleLogo'
import { withRouter } from 'react-router-dom'
import { formattedNum, rawPercent } from '../../helpers'

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
  grid-template-areas: 'name usd ownership';

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

  @media screen and (min-width: 1200px) {
    grid-template-columns: 1.5fr 1fr 1fr 1fr 1fr;
    grid-template-areas: ' name usd ownership token0 token1 ';
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
  LIQ: 0
}

// const FIELD_TO_VALUE = {
//   [SORT_FIELD.LIQ]: 'trackedReserveETH' // sort with tracked volume only
// }

function PositionList({ positions, history }) {
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
  }, [positions])

  useEffect(() => {
    if (positions) {
      let extraPages = 1
      if (positions.length % ITEMS_PER_PAGE === 0) {
        extraPages = 0
      }
      setMaxPage(Math.floor(positions.length / ITEMS_PER_PAGE) + extraPages)
    }
  }, [positions])

  const ListItem = ({ position, index }) => {
    if (position) {
      const poolOwnership = position.liquidityTokenBalance / position.pair.totalSupply
      const valueUSD = poolOwnership * position.pair.reserveUSD
      const token0 = position.pair.reserve0 * poolOwnership
      const token1 = position.pair.reserve1 * poolOwnership
      return (
        <DashGrid style={{ height: '60px' }} focus={true}>
          <DataText area="name" fontWeight="500">
            {!below600 && <div style={{ marginRight: '20px' }}>{index}</div>}
            <DoubleTokenLogo
              size={below600 ? 16 : 20}
              a0={position.pair.token0.id}
              a1={position.pair.token1.id}
              margin={!below740}
            />
            <CustomLink style={{ marginLeft: '20px', whiteSpace: 'nowrap' }} to={'/pair/'}>
              {position.pair.token0.symbol + '-' + position.pair.token1.symbol}
            </CustomLink>
          </DataText>
          <DataText area="usd">{formattedNum(valueUSD, true)}</DataText>
          <DataText area="ownership">{rawPercent(poolOwnership)}</DataText>
          <DataText area="token0">{`${formattedNum(token0)}  ${position.pair.token0.symbol}`}</DataText>
          <DataText area="toke10">{`${formattedNum(token1)}  ${position.pair.token1.symbol}`}</DataText>
        </DashGrid>
      )
    } else {
      return ''
    }
  }

  const positionsSorted =
    positions &&
    Object.keys(positions)
      .sort((addressA, addressB) => {
        return 1
      })
      .slice(ITEMS_PER_PAGE * (page - 1), page * ITEMS_PER_PAGE)
      .map((id, index) => {
        return (
          <div key={index}>
            <ListItem key={index} index={(page - 1) * 10 + index + 1} position={positions[id]} />
            <Divider />
          </div>
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
            area="usd"
            onClick={e => {
              setSortedColumn(SORT_FIELD.LIQ)
              setSortDirection(sortedColumn !== SORT_FIELD.LIQ ? true : !sortDirection)
            }}
          >
            Value {sortedColumn === SORT_FIELD.LIQ ? (!sortDirection ? '↑' : '↓') : ''}
          </ClickableText>
        </Flex>
        <Flex alignItems="center">
          <ClickableText
            area="ownership"
            onClick={e => {
              setSortedColumn(SORT_FIELD.VOL)
              setSortDirection(sortedColumn !== SORT_FIELD.VOL ? true : !sortDirection)
            }}
          >
            Pool Ownership
            {sortedColumn === SORT_FIELD.VOL ? (!sortDirection ? '↑' : '↓') : ''}
          </ClickableText>
        </Flex>
        {!below1080 && (
          <Flex alignItems="center" justifyContent="flexEnd">
            <ClickableText
              area="token0"
              onClick={e => {
                setSortedColumn(SORT_FIELD.VOL_7DAYS)
                setSortDirection(sortedColumn !== SORT_FIELD.VOL_7DAYS ? true : !sortDirection)
              }}
            >
              Token 0 {sortedColumn === SORT_FIELD.VOL_7DAYS ? (!sortDirection ? '↑' : '↓') : ''}
            </ClickableText>
          </Flex>
        )}
        {!below1080 && (
          <Flex alignItems="center" justifyContent="flexEnd">
            <ClickableText
              area="token1"
              onClick={e => {
                setSortedColumn(SORT_FIELD.FEES)
                setSortDirection(sortedColumn !== SORT_FIELD.FEES ? true : !sortDirection)
              }}
            >
              Token 1 {sortedColumn === SORT_FIELD.FEES ? (!sortDirection ? '↑' : '↓') : ''}
            </ClickableText>
          </Flex>
        )}
      </DashGrid>
      <Divider />
      <List p={0}>{!positionsSorted ? <LocalLoader /> : positionsSorted}</List>
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

export default withRouter(PositionList)
