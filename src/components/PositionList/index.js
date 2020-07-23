import React, { useState, useEffect } from 'react'
import { useMedia } from 'react-use'
import dayjs from 'dayjs'
import LocalLoader from '../LocalLoader'
import utc from 'dayjs/plugin/utc'
import { Box, Flex, Text } from 'rebass'
import styled from 'styled-components'
import Link from '../Link'
import { Divider } from '../../components'
import DoubleTokenLogo from '../DoubleLogo'
import { withRouter } from 'react-router-dom'
import { formattedNum } from '../../utils'
import { AutoColumn } from '../Column'
import { useEthPrice } from '../../contexts/GlobalData'
import { RowFixed } from '../Row'

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
  align-items: flex-start;
  padding: 20px 0;

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
    grid-template-columns: 35px 1.5fr 1fr 1fr 1fr 1fr;
    grid-template-areas: 'number name principal hodl uniswap return';
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

function PositionList({ positions }) {
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
      setMaxPage(Math.floor(positions.length / ITEMS_PER_PAGE) + extraPages || 1)
    }
  }, [positions])

  const [ethPrice] = useEthPrice()

  const ListItem = ({ position, index }) => {
    const poolOwnership = position.liquidityTokenBalance / position.pair.totalSupply
    const valueUSD = poolOwnership * position.pair.reserveUSD

    return (
      <DashGrid focus={true}>
        <DataText area="number">{index}</DataText>
        <DataText area="name" fontWeight="500" justifyContent="flex-start" alignItems="flex-start">
          <AutoColumn gap="8px" justify="flex-start" align="flex-start">
            <DoubleTokenLogo size={16} a0={position.pair.token0.id} a1={position.pair.token1.id} margin={!below740} />
          </AutoColumn>
          <AutoColumn gap="8px" justify="flex-start" style={{ marginLeft: '20px' }}>
            <Text style={{ whiteSpace: 'nowrap' }} to={'/pair/'}>
              {position.pair.token0.symbol + '-' + position.pair.token1.symbol}
            </Text>
            <AutoColumn gap="8px" justify="flex-start">
              <Link>Add</Link>
              <Link>Remove</Link>
            </AutoColumn>
          </AutoColumn>
        </DataText>
        <DataText area="principal">
          <AutoColumn gap="12px" justify="flex-end">
            <Text fontWeight={500}>
              <RowFixed>{formattedNum(position?.principal.usd, true, true)}</RowFixed>
            </Text>
            <AutoColumn gap="4px" justify="flex-end">
              <Text fontSize="12px">
                {position?.principal.amount0 ? formattedNum(position?.principal.amount0, false, true) : 0}{' '}
                {position.pair.token0.symbol}
              </Text>
              <Text fontSize="12px">
                {position?.principal.amount1 ? formattedNum(position?.principal.amount1, false, true) : 0}{' '}
                {position.pair.token1.symbol}
              </Text>
            </AutoColumn>
          </AutoColumn>
        </DataText>
        <DataText area="hodl">
          <AutoColumn gap="12px" justify="flex-end">
            <Text fontWeight={500}>
              <RowFixed>{formattedNum(position?.hodl.sum, true, true)}</RowFixed>
            </Text>
            <AutoColumn gap="4px" justify="flex-end">
              <Text fontSize="12px">
                {position?.principal.amount0 ? formattedNum(position?.principal.amount0, false, true) : 0}{' '}
                {position.pair.token0.symbol}
              </Text>
              <Text fontSize="12px">
                {position?.principal.amount1 ? formattedNum(position?.principal.amount1, false, true) : 0}{' '}
                {position.pair.token1.symbol}
              </Text>
            </AutoColumn>
          </AutoColumn>
        </DataText>
        <DataText area="uniswap">
          <AutoColumn gap="12px" justify="flex-end">
            <Text fontWeight={500}>{formattedNum(valueUSD, true, true)}</Text>
            <AutoColumn gap="4px" justify="flex-end">
              <Text fontSize="12px">
                {formattedNum(poolOwnership * parseFloat(position.pair.reserve0))} {position.pair.token0.symbol}
              </Text>
              <Text fontSize="12px">
                {formattedNum(poolOwnership * parseFloat(position.pair.reserve1))} {position.pair.token1.symbol}
              </Text>
            </AutoColumn>
          </AutoColumn>
        </DataText>
        <DataText area="return">
          <AutoColumn gap="12px" justify="flex-end">
            <Text
              fontWeight={500}
              color={position?.uniswap.return > 0 ? 'green' : position?.uniswap.return === 0 ? 'black' : 'red'}
            >
              <RowFixed>
                {position?.uniswap.return > 0 ? '+' : position?.uniswap.return === 0 ? '' : '-'}
                {formattedNum(position?.uniswap.return, true, true)}
              </RowFixed>
            </Text>
            <AutoColumn gap="4px" justify="flex-end">
              <Text fontSize="12px">
                {parseFloat(position.pair.token0.derivedETH)
                  ? formattedNum(
                      position?.uniswap.return / (parseFloat(position.pair.token0.derivedETH) * ethPrice) / 2,
                      false,
                      true
                    )
                  : 0}{' '}
                {position.pair.token0.symbol}
              </Text>
              <Text fontSize="12px">
                {parseFloat(position.pair.token1.derivedETH)
                  ? formattedNum(
                      position?.uniswap.return / (parseFloat(position.pair.token1.derivedETH) * ethPrice) / 2,
                      false,
                      true
                    )
                  : 0}{' '}
                {position.pair.token1.symbol}
              </Text>
            </AutoColumn>
          </AutoColumn>
        </DataText>
      </DashGrid>
    )
  }

  const positionsSorted =
    positions &&
    Object.keys(positions)
      .sort((addressA, addressB) => {
        return 1
      })
      .slice(ITEMS_PER_PAGE * (page - 1), page * ITEMS_PER_PAGE)
      .filter(id => {
        return positions[id].liquidityTokenBalance > 0
      })
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
      <DashGrid center={true} style={{ height: 'fit-content', padding: 0 }}>
        <Flex alignItems="flex-start" justifyContent="flexStart">
          <Text area="number" fontWeight="500">
            #
          </Text>
        </Flex>
        <Flex alignItems="flex-start" justifyContent="flex-start">
          <Text area="name" fontWeight="500">
            Name
          </Text>
        </Flex>
        <Flex alignItems="center">
          <ClickableText
            area="principal"
            onClick={e => {
              setSortedColumn(SORT_FIELD.VOL)
              setSortDirection(sortedColumn !== SORT_FIELD.VOL ? true : !sortDirection)
            }}
          >
            Principal (Cost Basis)
            {sortedColumn === SORT_FIELD.VOL ? (!sortDirection ? '↑' : '↓') : ''}
          </ClickableText>
        </Flex>
        {!below1080 && (
          <Flex alignItems="center" justifyContent="flexEnd">
            <ClickableText
              area="hodl"
              onClick={e => {
                setSortedColumn(SORT_FIELD.VOL_7DAYS)
                setSortDirection(sortedColumn !== SORT_FIELD.VOL_7DAYS ? true : !sortDirection)
              }}
            >
              HODL Performance {sortedColumn === SORT_FIELD.VOL_7DAYS ? (!sortDirection ? '↑' : '↓') : ''}
            </ClickableText>
          </Flex>
        )}
        {!below1080 && (
          <Flex alignItems="center" justifyContent="flexEnd">
            <ClickableText
              area="uniswap"
              onClick={e => {
                setSortedColumn(SORT_FIELD.VOL_7DAYS)
                setSortDirection(sortedColumn !== SORT_FIELD.VOL_7DAYS ? true : !sortDirection)
              }}
            >
              Uniswap Performance {sortedColumn === SORT_FIELD.VOL_7DAYS ? (!sortDirection ? '↑' : '↓') : ''}
            </ClickableText>
          </Flex>
        )}
        {!below1080 && (
          <Flex alignItems="center" justifyContent="flexEnd">
            <ClickableText
              area="return"
              onClick={e => {
                setSortedColumn(SORT_FIELD.FEES)
                setSortDirection(sortedColumn !== SORT_FIELD.FEES ? true : !sortDirection)
              }}
            >
              Uniswap Return {sortedColumn === SORT_FIELD.FEES ? (!sortDirection ? '↑' : '↓') : ''}
            </ClickableText>
          </Flex>
        )}
        <ClickableText area="manage" color="#FF007A"></ClickableText>
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
