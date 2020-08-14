import React, { useState, useEffect } from 'react'
import { useMedia } from 'react-use'
import dayjs from 'dayjs'
import LocalLoader from '../LocalLoader'
import utc from 'dayjs/plugin/utc'
import { Box, Flex, Text } from 'rebass'
import styled from 'styled-components'
import Link, { CustomLink } from '../Link'
import { Divider } from '../../components'
import DoubleTokenLogo from '../DoubleLogo'
import { withRouter } from 'react-router-dom'
import { formattedNum, getPoolLink } from '../../utils'
import { AutoColumn } from '../Column'
import { useEthPrice } from '../../contexts/GlobalData'
import { RowFixed } from '../Row'
import { ButtonLight } from '../ButtonStyled'

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
  grid-template-columns: 5px 0.5fr 1fr 1fr;
  grid-template-areas: 'number name uniswap return';
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
    grid-template-columns: 35px 2.5fr 1fr 1fr;
    grid-template-areas: 'number name uniswap return';
  }

  @media screen and (max-width: 740px) {
    grid-template-columns: 2.5fr 1fr 1fr;
    grid-template-areas: 'name uniswap return';
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
  VALUE: 'VALUE',
  UNISWAP_RETURN: 'UNISWAP_RETURN'
}

function PositionList({ positions }) {
  const below740 = useMedia('(max-width: 740px)')

  // pagination
  const [page, setPage] = useState(1)
  const [maxPage, setMaxPage] = useState(1)
  const ITEMS_PER_PAGE = 10

  // sorting
  const [sortDirection, setSortDirection] = useState(true)
  const [sortedColumn, setSortedColumn] = useState(SORT_FIELD.VALUE)

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
        {!below740 && <DataText area="number">{index}</DataText>}
        <DataText area="name" fontWeight="500" justifyContent="flex-start" alignItems="flex-start">
          <AutoColumn gap="8px" justify="flex-start" align="flex-start">
            <DoubleTokenLogo size={16} a0={position.pair.token0.id} a1={position.pair.token1.id} margin={!below740} />
          </AutoColumn>
          <AutoColumn gap="8px" justify="flex-start" style={{ marginLeft: '20px' }}>
            <CustomLink to={'/pair/' + position.pair.id}>
              <Text style={{ whiteSpace: 'nowrap' }} to={'/pair/'}>
                {position.pair.token0.symbol + '-' + position.pair.token1.symbol}
              </Text>
            </CustomLink>
            <RowFixed gap="8px" justify="flex-start">
              <Link
                external
                href={getPoolLink(position.pair.token0.id, position.pair.token1.id)}
                style={{ marginRight: '.5rem' }}
              >
                <ButtonLight style={{ padding: '2px 4px', borderRadius: '4px' }}>Add</ButtonLight>
              </Link>
              <Link external href={getPoolLink(position.pair.token0.id, position.pair.token1.id, true)}>
                <ButtonLight style={{ padding: '2px 4px', borderRadius: '4px' }}>Remove</ButtonLight>
              </Link>
            </RowFixed>
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
            <Text fontWeight={500} color={'green'}>
              <RowFixed>{formattedNum(position?.fees.sum, true, true)}</RowFixed>
            </Text>
            <AutoColumn gap="4px" justify="flex-end">
              <Text fontSize="12px">
                {parseFloat(position.pair.token0.derivedETH)
                  ? formattedNum(
                      position?.fees.sum / (parseFloat(position.pair.token0.derivedETH) * ethPrice) / 2,
                      false,
                      true
                    )
                  : 0}{' '}
                {position.pair.token0.symbol}
              </Text>
              <Text fontSize="12px">
                {parseFloat(position.pair.token1.derivedETH)
                  ? formattedNum(
                      position?.fees.sum / (parseFloat(position.pair.token1.derivedETH) * ethPrice) / 2,
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
    positions

      .sort((p0, p1) => {
        if (sortedColumn === SORT_FIELD.PRINCIPAL) {
          return p0?.principal?.usd > p1?.principal?.usd ? (sortDirection ? -1 : 1) : sortDirection ? 1 : -1
        }
        if (sortedColumn === SORT_FIELD.HODL) {
          return p0?.hodl?.sum > p1?.hodl?.sum ? (sortDirection ? -1 : 1) : sortDirection ? 1 : -1
        }
        if (sortedColumn === SORT_FIELD.UNISWAP_RETURN) {
          return p0?.uniswap?.return > p1?.uniswap?.return ? (sortDirection ? -1 : 1) : sortDirection ? 1 : -1
        }
        if (sortedColumn === SORT_FIELD.VALUE) {
          const bal0 = (p0.liquidityTokenBalance / p0.pair.totalSupply) * p0.pair.reserveUSD
          const bal1 = (p1.liquidityTokenBalance / p1.pair.totalSupply) * p1.pair.reserveUSD
          return bal0 > bal1 ? (sortDirection ? -1 : 1) : sortDirection ? 1 : -1
        }
        return 1
      })
      .slice(ITEMS_PER_PAGE * (page - 1), page * ITEMS_PER_PAGE)
      .map((position, index) => {
        return (
          <div key={index}>
            <ListItem key={index} index={(page - 1) * 10 + index + 1} position={position} />
            <Divider />
          </div>
        )
      })

  return (
    <ListWrapper>
      <DashGrid center={true} style={{ height: '32px', padding: 0 }}>
        {!below740 && (
          <Flex alignItems="flex-start" justifyContent="flexStart">
            <Text area="number" fontWeight="500">
              #
            </Text>
          </Flex>
        )}
        <Flex alignItems="flex-start" justifyContent="flex-start">
          <Text area="name" fontWeight="500">
            Name
          </Text>
        </Flex>
        <Flex alignItems="center" justifyContent="flexEnd">
          <ClickableText
            area="uniswap"
            onClick={e => {
              setSortedColumn(SORT_FIELD.VALUE)
              setSortDirection(sortedColumn !== SORT_FIELD.VALUE ? true : !sortDirection)
            }}
          >
            {below740 ? 'Value' : 'Liquidity'} {sortedColumn === SORT_FIELD.VALUE ? (!sortDirection ? '↑' : '↓') : ''}
          </ClickableText>
        </Flex>
        <Flex alignItems="center" justifyContent="flexEnd">
          <ClickableText
            area="return"
            onClick={() => {
              setSortedColumn(SORT_FIELD.UNISWAP_RETURN)
              setSortDirection(sortedColumn !== SORT_FIELD.UNISWAP_RETURN ? true : !sortDirection)
            }}
          >
            {below740 ? 'Fees' : 'Total Fees Earned'}{' '}
            {sortedColumn === SORT_FIELD.UNISWAP_RETURN ? (!sortDirection ? '↑' : '↓') : ''}
          </ClickableText>
        </Flex>
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
