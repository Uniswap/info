import React, { useState, useEffect } from 'react'
import { useMedia } from 'react-use'
import dayjs from 'dayjs'
import LocalLoader from '../LocalLoader'
import utc from 'dayjs/plugin/utc'
import { Box, Flex, Text } from 'rebass'
import styled from 'styled-components'
import { CustomLink } from '../Link'
import { Divider } from '..'
import DoubleTokenLogo from '../DoubleLogo'
import { withRouter } from 'react-router-dom'
import { formattedNum, rawPercent, formattedPercent } from '../../helpers'
import { AutoRow, RowFixed } from '../Row'
import { AutoColumn } from '../Column'
import TokenLogo from '../TokenLogo'

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
    grid-template-columns: 2fr 1fr 1fr 1fr 1fr 0.5fr 0.5fr;
    grid-template-areas: ' name ownership market return combinded value manage ';
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

const ExpandableSection = styled.div``

const Flyout = styled.div`
  margin-bottom: 20px;
`

const StatCard = styled(AutoRow)`
  padding: 1.5rem;
  width: 200px;
  displaybackground-color: rgb(244, 245, 249);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
  border-radius: 20px;
  min-height: 280px;
  align-items: flex-start;
`

// const FIELD_TO_VALUE = {
//   [SORT_FIELD.LIQ]: 'trackedReserveETH' // sort with tracked volume only
// }

function PositionList({ positions, transactions }) {
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
      setMaxPage(Math.floor(positions.length / ITEMS_PER_PAGE) + extraPages || 1)
    }
  }, [positions])

  const [openPool, setOpenPool] = useState()

  const [costBasis, setCostBasis] = useState()

  useEffect(() => {
    let cbTotal = 0
    if (transactions?.mints) {
      cbTotal =
        cbTotal +
        transactions.mints.reduce((total, mint) => {
          return mint.pair.id === openPool ? total + parseFloat(mint.amountUSD) : total
        }, 0)
    }
    if (transactions?.burns) {
      cbTotal =
        cbTotal -
        transactions.burns.reduce((total, burn) => {
          return burn.pair.id === openPool ? total + parseFloat(burn.amountUSD) : total
        }, 0)
    }
    setCostBasis(cbTotal)
  }, [openPool, transactions])

  const ListItem = ({ position, index }) => {
    const showFlyout = openPool === position.pair.id
    if (position) {
      const poolOwnership = position.liquidityTokenBalance / position.pair.totalSupply
      const valueUSD = poolOwnership * position.pair.reserveUSD
      return (
        <ExpandableSection>
          <DashGrid
            style={{ height: '60px' }}
            focus={true}
            onClick={() => setOpenPool(showFlyout ? null : position.pair.id)}
          >
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
            {!showFlyout && <DataText area="ownership">{rawPercent(poolOwnership)}</DataText>}{' '}
            {!showFlyout && (
              <DataText area="market">
                {formattedNum(position?.assetReturn, true, true)} ({formattedPercent(position?.assetPercentChange)})
              </DataText>
            )}{' '}
            {!showFlyout && (
              <DataText area="return">
                {formattedNum(position?.mooniswapReturn, true, true)} ({formattedPercent(position?.mooniswapPercentChange)})
              </DataText>
            )}{' '}
            {!showFlyout && (
              <DataText area="combined">
                {formattedNum(position?.netReturn, true, true)} ({formattedPercent(position?.netPercentChange)})
              </DataText>
            )}{' '}
            {!showFlyout && <DataText area="value">{formattedNum(valueUSD, true)}</DataText>}{' '}
            {!showFlyout && (
              <DataText area="manage" color="#FF007A" onClick={() => setOpenPool(position.pair.id)}>
                See More
              </DataText>
            )}
          </DashGrid>
          {showFlyout && (
            <Flyout>
              <AutoRow gap="20px" align="flext-start">
                <StatCard>
                  <AutoColumn gap="20px">
                    <AutoColumn gap="10px">
                      <Text fontSize={16} color={'#888D9B'} fontWeight={500}>
                        Current Value
                      </Text>
                      <Text fontWeight={500}>{formattedNum(valueUSD, true)}</Text>
                    </AutoColumn>
                    <AutoColumn gap="10px">
                      <Text fontSize={16} color={'#888D9B'} fontWeight={500}>
                        Pool Ownership
                      </Text>
                      <Text fontWeight={500}>{rawPercent(poolOwnership)}</Text>
                    </AutoColumn>
                    <AutoColumn gap="10px">
                      <Text fontSize={16} color={'#888D9B'} fontWeight={500}>
                        Token Supplied
                      </Text>
                      <RowFixed gap="10px">
                        <TokenLogo address={position.pair.token0.id} />
                        <Text fontWeight={500} ml={'6px'}>
                          {formattedNum(poolOwnership * position.pair.reserve0)} {position.pair.token0.symbol}
                        </Text>
                      </RowFixed>
                      <RowFixed gap="10px">
                        <TokenLogo address={position.pair.token1.id} />
                        <Text fontWeight={500} ml={'6px'}>
                          {formattedNum(poolOwnership * position.pair.reserve1)} {position.pair.token1.symbol}
                        </Text>
                      </RowFixed>
                    </AutoColumn>
                  </AutoColumn>
                </StatCard>
                <StatCard>
                  <AutoColumn gap="20px">
                    <AutoColumn gap="10px">
                      <Text fontSize={16} color={'#888D9B'} fontWeight={500}>
                        Combined Return
                      </Text>
                      <Text fontWeight={500}>
                        <RowFixed>
                          {formattedNum(position?.netReturn, true, true)} (
                          {formattedPercent(position?.netPercentChange)})
                        </RowFixed>
                      </Text>
                    </AutoColumn>
                    <AutoColumn gap="10px">
                      <Text fontSize={16} color={'#888D9B'} fontWeight={500}>
                        Asset Return
                      </Text>
                      <Text fontWeight={500}>
                        <RowFixed>
                          {formattedNum(position?.assetReturn, true, true)} (
                          {formattedPercent(position?.assetPercentChange)})
                        </RowFixed>
                      </Text>
                    </AutoColumn>
                    <AutoColumn gap="10px">
                      <Text fontSize={16} color={'#888D9B'} fontWeight={500}>
                        Mooniswap Return
                      </Text>
                      <Text fontWeight={500}>
                        <RowFixed>
                          {formattedNum(position?.mooniswapReturn, true, true)} (
                          {formattedPercent(position?.mooniswapPercentChange)})
                        </RowFixed>
                      </Text>
                    </AutoColumn>
                  </AutoColumn>
                </StatCard>
                <StatCard>
                  <AutoColumn gap="10px">
                    <Text fontSize={16} color={'#888D9B'} fontWeight={500}>
                      Cost Basis
                    </Text>
                    <Text fontWeight={500}>
                      <RowFixed>{formattedNum(costBasis, true, true)}</RowFixed>
                    </Text>
                  </AutoColumn>
                </StatCard>
              </AutoRow>
            </Flyout>
          )}
        </ExpandableSection>
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
            area="ownership"
            onClick={e => {
              setSortedColumn(SORT_FIELD.LIQ)
              setSortDirection(sortedColumn !== SORT_FIELD.LIQ ? true : !sortDirection)
            }}
          >
            Pool Ownership {sortedColumn === SORT_FIELD.LIQ ? (!sortDirection ? '↑' : '↓') : ''}
          </ClickableText>
        </Flex>
        <Flex alignItems="center">
          <ClickableText
            area="market"
            onClick={e => {
              setSortedColumn(SORT_FIELD.VOL)
              setSortDirection(sortedColumn !== SORT_FIELD.VOL ? true : !sortDirection)
            }}
          >
            Asset Return
            {sortedColumn === SORT_FIELD.VOL ? (!sortDirection ? '↑' : '↓') : ''}
          </ClickableText>
        </Flex>
        {!below1080 && (
          <Flex alignItems="center" justifyContent="flexEnd">
            <ClickableText
              area="return"
              onClick={e => {
                setSortedColumn(SORT_FIELD.VOL_7DAYS)
                setSortDirection(sortedColumn !== SORT_FIELD.VOL_7DAYS ? true : !sortDirection)
              }}
            >
              Mooniswap Return {sortedColumn === SORT_FIELD.VOL_7DAYS ? (!sortDirection ? '↑' : '↓') : ''}
            </ClickableText>
          </Flex>
        )}
        {!below1080 && (
          <Flex alignItems="center" justifyContent="flexEnd">
            <ClickableText
              area="combined"
              onClick={e => {
                setSortedColumn(SORT_FIELD.VOL_7DAYS)
                setSortDirection(sortedColumn !== SORT_FIELD.VOL_7DAYS ? true : !sortDirection)
              }}
            >
              Combined Return {sortedColumn === SORT_FIELD.VOL_7DAYS ? (!sortDirection ? '↑' : '↓') : ''}
            </ClickableText>
          </Flex>
        )}
        {!below1080 && (
          <Flex alignItems="center" justifyContent="flexEnd">
            <ClickableText
              area="value"
              onClick={e => {
                setSortedColumn(SORT_FIELD.FEES)
                setSortDirection(sortedColumn !== SORT_FIELD.FEES ? true : !sortDirection)
              }}
            >
              Value{sortedColumn === SORT_FIELD.FEES ? (!sortDirection ? '↑' : '↓') : ''}
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
