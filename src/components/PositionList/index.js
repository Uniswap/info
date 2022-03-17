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
import { useParams, withRouter } from 'react-router-dom'
import { formattedNum, getPoolLink, shortenAddress } from '../../utils'
import { AutoColumn } from '../Column'
import { ButtonLight } from '../ButtonStyled'
import { TYPE } from '../../Theme'
import FormattedName from '../FormattedName'
import useTheme from '../../hooks/useTheme'
import { useNetworksInfo } from '../../contexts/NetworkInfo'

dayjs.extend(utc)

const PageButtons = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  margin: 1.25em 0;
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
  grid-gap: 1rem;
  grid-template-columns: 2.5fr 2fr 2fr 2fr 2fr 2fr;
  grid-template-areas: 'pair pool liquidity tokenAmount tokenAmount2 action';
  align-items: center;
  padding: 20px;

  > * {
    justify-content: flex-end;
    width: 100%;

    :first-child {
      justify-content: flex-start;
    }
  }

  @media screen and (max-width: 900px) {
    grid-template-columns: 3fr 2fr 2fr 2fr 2fr;
    grid-template-areas: 'pair pool liquidity tokenAmount action';
  }

  @media screen and (max-width: 740px) {
    grid-template-columns: 2fr 2fr;
    grid-template-areas: 'pool liquidity ';
  }
`

const TableHeader = styled(DashGrid)`
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  background: ${({ theme }) => theme.tableHeader};
  text-transform: uppercase;
  font-size: 12px;
  font-weight: 500;
  color: ${({ theme }) => theme.subText};
`

const ListWrapper = styled.div``

const ClickableText = styled(Text)`
  &:hover {
    cursor: pointer;
    opacity: 0.6;
  }
  user-select: none;
`

const DataText = styled(Flex)`
  align-items: center;
  color: ${({ theme }) => theme.text1};
  font-size: 14px;
`

const RemoveBtn = styled(ButtonLight)`
  background: ${({ theme }) => `${theme.subText}33`};
`

const SORT_FIELD = {
  VALUE: 'VALUE',
  UNISWAP_RETURN: 'UNISWAP_RETURN',
}

function PositionList({ positions }) {
  const below740 = useMedia('(max-width: 740px)')
  const below900 = useMedia('(max-width: 900px)')
  const [networksInfo] = useNetworksInfo()

  // pagination
  const [page, setPage] = useState(1)
  const [maxPage, setMaxPage] = useState(1)
  const ITEMS_PER_PAGE = 5

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

  const theme = useTheme()
  const { network: currentNetworkURL } = useParams()
  const prefixNetworkURL = currentNetworkURL ? `/${currentNetworkURL}` : ''

  const ListItem = ({ position }) => {
    const poolOwnership = position.liquidityTokenBalance / position.pool.totalSupply
    const valueUSD = poolOwnership * position.pool.reserveUSD

    return (
      <>
        <DashGrid style={{ opacity: poolOwnership > 0 ? 1 : 0.6 }} focus={true}>
          {!below740 && (
            <DataText grid-area='pair' justifyContent='flex-start' alignItems='flex-start'>
              <AutoColumn gap='8px' justify='flex-start' align='flex-start'>
                <DoubleTokenLogo size={16} a0={position.pair.token0.id} a1={position.pair.token1.id} margin={!below740} />
              </AutoColumn>
              <AutoColumn gap='8px' justify='flex-end' style={{ marginLeft: '8px' }}>
                <CustomLink to={prefixNetworkURL + '/pair/' + position.pair.id}>
                  <TYPE.main style={{ whiteSpace: 'nowrap' }} to={prefixNetworkURL + '/pair/'}>
                    <FormattedName
                      text={position.pair.token0.symbol + '-' + position.pair.token1.symbol}
                      maxCharacters={below740 ? 10 : 18}
                      style={{ color: theme.primary }}
                    />
                  </TYPE.main>
                </CustomLink>
              </AutoColumn>
            </DataText>
          )}

          <DataText
            grid-area='pool'
            justifyContent='flex-end'
            alignItems={below740 ? 'flex-start' : 'flex-end'}
            flexDirection='column'
          >
            <CustomLink to={prefixNetworkURL + '/pool/' + position.pool.id}>
              <TYPE.main style={{ whiteSpace: 'nowrap' }} to={prefixNetworkURL + '/pair/'}>
                <FormattedName
                  text={shortenAddress(position.pool.id, 3)}
                  maxCharacters={below740 ? 14 : 18}
                  style={{ color: theme.primary }}
                />
              </TYPE.main>
            </CustomLink>
            {below740 && (
              <Flex marginTop='12px'>
                <AutoColumn gap='8px' justify='flex-start' align='flex-start'>
                  <DoubleTokenLogo size={16} a0={position.pair.token0.id} a1={position.pair.token1.id} margin={!below740} />
                </AutoColumn>
                <AutoColumn gap='8px' justify='flex-end' style={{ marginLeft: '8px' }}>
                  <CustomLink to={prefixNetworkURL + '/pair/' + position.pair.id}>
                    <TYPE.main style={{ whiteSpace: 'nowrap' }} to={prefixNetworkURL + '/pair/'}>
                      <FormattedName
                        text={position.pair.token0.symbol + '-' + position.pair.token1.symbol}
                        maxCharacters={below740 ? 10 : 18}
                        style={{ color: theme.primary }}
                      />
                    </TYPE.main>
                  </CustomLink>
                </AutoColumn>
              </Flex>
            )}
          </DataText>

          <DataText grid-area='liquidity' justifyContent='flex-end' alignItems={'flex-end'} flexDirection='column'>
            <TYPE.main>{formattedNum(valueUSD, true, true)}</TYPE.main>
          </DataText>

          {!below740 && (
            <DataText grid-area='tokenAmount' justifyContent='flex-end'>
              <AutoColumn justify='flex-end'>
                <Flex justifyContent='flex-end'>
                  <TYPE.main fontWeight={400}>{formattedNum(poolOwnership * parseFloat(position.pool.reserve1))} </TYPE.main>
                  <FormattedName
                    text={position.pool.token1.symbol}
                    margin={true}
                    maxCharacters={below740 ? 10 : 18}
                    fontSize={'14px'}
                  />
                </Flex>
                {below900 && (
                  <Flex marginTop='12px'>
                    <TYPE.main fontWeight={400}>{formattedNum(poolOwnership * parseFloat(position.pool.reserve0))} </TYPE.main>
                    <FormattedName
                      text={position.pool.token0.symbol}
                      maxCharacters={below740 ? 10 : 18}
                      margin={true}
                      fontSize={'14px'}
                    />
                  </Flex>
                )}
              </AutoColumn>
            </DataText>
          )}

          {!below900 && (
            <DataText grid-area='tokenAmount2' justifyContent='flex-end'>
              <TYPE.main fontWeight={400}>{formattedNum(poolOwnership * parseFloat(position.pool.reserve0))} </TYPE.main>
              <FormattedName
                text={position.pool.token0.symbol}
                maxCharacters={below740 ? 10 : 18}
                margin={true}
                fontSize={'14px'}
              />
            </DataText>
          )}

          {!below740 && (
            <DataText grid-area='action' justifyContent='flex-end'>
              <Flex justifyContent='flex-end' flexDirection={below740 ? 'column' : 'row'} sx={{ gap: '6px' }}>
                <Link
                  external
                  href={getPoolLink(position.pool.token0.id, networksInfo, position.pool.token1.id, false, position.pool.id)}
                >
                  <ButtonLight style={{ padding: '4px 6px', borderRadius: '4px' }}>+ Add</ButtonLight>
                </Link>
                {poolOwnership > 0 && (
                  <Link
                    external
                    href={getPoolLink(position.pool.token0.id, networksInfo, position.pool.token1.id, true, position.pool.id)}
                  >
                    <RemoveBtn
                      style={{
                        padding: '4px 6px',
                        borderRadius: '4px',
                        color: theme.subText,
                      }}
                    >
                      - Remove
                    </RemoveBtn>
                  </Link>
                )}
              </Flex>
            </DataText>
          )}
        </DashGrid>
        {below740 && (
          <Flex sx={{ gap: '8px', paddingX: '20px', marginBottom: '16px' }}>
            <Link
              external
              href={getPoolLink(position.pool.token0.id, networksInfo, position.pool.token1.id, false, position.pool.id)}
              style={{ marginRight: '.5rem', flex: 1 }}
            >
              <ButtonLight style={{ padding: '10px', borderRadius: '4px', width: '100%' }}>+ Add</ButtonLight>
            </Link>
            {poolOwnership > 0 && (
              <Link
                external
                href={getPoolLink(position.pool.token0.id, networksInfo, position.pool.token1.id, true, position.pool.id)}
                style={{ flex: 1 }}
              >
                <RemoveBtn
                  style={{
                    padding: '10px',
                    borderRadius: '4px',
                    color: theme.subText,
                    width: '100%',
                  }}
                >
                  - Remove
                </RemoveBtn>
              </Link>
            )}
          </Flex>
        )}
      </>
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
          const bal0 = (p0.liquidityTokenBalance / p0.pool.totalSupply) * p0.pool.reserveUSD
          const bal1 = (p1.liquidityTokenBalance / p1.pool.totalSupply) * p1.pool.reserveUSD
          return bal0 > bal1 ? (sortDirection ? -1 : 1) : sortDirection ? 1 : -1
        }
        return 1
      })
      .slice(ITEMS_PER_PAGE * (page - 1), page * ITEMS_PER_PAGE)
      .map((position, index) => {
        return (
          <React.Fragment key={index}>
            <ListItem key={index} index={(page - 1) * 10 + index + 1} position={position} />
            <Divider />
          </React.Fragment>
        )
      })

  return (
    <ListWrapper>
      <TableHeader center={true}>
        {!below740 && <Text area='pair'>Pair</Text>}
        <Flex alignItems='flex-start' justifyContent='flex-end'>
          <Text area='pool'>Pool</Text>
        </Flex>
        <Flex alignItems='center'>
          <ClickableText
            area='liquidity'
            onClick={e => {
              setSortedColumn(SORT_FIELD.VALUE)
              setSortDirection(sortedColumn !== SORT_FIELD.VALUE ? true : !sortDirection)
            }}
          >
            Liquidity {sortedColumn === SORT_FIELD.VALUE ? (!sortDirection ? '↑' : '↓') : ''}
          </ClickableText>
        </Flex>
        {!below740 && (
          <Flex alignItems='flex-start' justifyContent='flex-end'>
            <Text area='tokenAmount'>Token Amount</Text>
          </Flex>
        )}
        {!below900 && (
          <Flex alignItems='flex-start' justifyContent='flex-end'>
            <Text area='tokenAmount2'>Token Amount</Text>
          </Flex>
        )}
        {!below740 && (
          <Flex alignItems='flex-start' justifyContent='flex-end'>
            <Text area='action'>Add/Remove</Text>
          </Flex>
        )}
      </TableHeader>
      <Divider />
      <List p={0}>{!positionsSorted ? <LocalLoader /> : positionsSorted}</List>
      <PageButtons>
        <div onClick={() => setPage(page === 1 ? page : page - 1)}>
          <Arrow faded={page === 1 ? true : false}>←</Arrow>
        </div>
        <TYPE.body>{'Page ' + page + ' of ' + maxPage}</TYPE.body>
        <div onClick={() => setPage(page === maxPage ? page : page + 1)}>
          <Arrow faded={page === maxPage ? true : false}>→</Arrow>
        </div>
      </PageButtons>
    </ListWrapper>
  )
}

export default withRouter(PositionList)
