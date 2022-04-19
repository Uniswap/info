import { useState, useEffect } from 'react'
import { useMedia } from 'react-use'
import LocalLoader from '../LocalLoader'
import { Box, Flex, Text } from 'rebass'
import styled from 'styled-components/macro'
import Link, { CustomLink as RouterLink } from '../Link'
import { useFormatPath } from 'hooks'
import { Divider } from '../../components'
import DoubleTokenLogo from '../DoubleLogo'
import { formattedNum, getPoolLink } from '../../utils'
import { AutoColumn } from '../Column'
import { useEthPrice } from 'state/features/global/hooks'
import { RowFixed } from '../Row'
import { ButtonLight } from '../ButtonStyled'
import { TYPE } from '../../Theme'
import FormattedName from '../FormattedName'
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
  padding: 1rem 2rem;
  border-top: 1px solid ${({ theme }) => theme.bg7};

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

  @media screen and (max-width: 500px) {
    grid-template-columns: 2.5fr 1fr;
    grid-template-areas: 'name uniswap';
  }

  @media screen and (max-width: 440px) {
    padding: 0.75rem;
  }
`

const ListWrapper = styled.div``

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

const CustomLink = styled(RouterLink)`
  color: ${({ theme }) => theme.blueGrey};
  font-weight: 600;
  cursor: pointer;
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
`

const ButtonsContainer = styled(RowFixed)`
  @media screen and (max-width: 440px) {
    flex-wrap: wrap;

    > a {
      margin-right: 0;
      margin-top: 0.5rem;

      &:first-child {
        margin-top: 0;
      }
    }
  }
`

const SORT_FIELD = {
  VALUE: 'VALUE',
  UNISWAP_RETURN: 'UNISWAP_RETURN'
}

function PositionList({ positions }) {
  const { t } = useTranslation()
  const formatPath = useFormatPath()

  const below440 = useMedia('(max-width: 440px)')
  const below500 = useMedia('(max-width: 500px)')
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
      <DashGrid style={{ opacity: poolOwnership > 0 ? 1 : 0.6 }} focus={true}>
        {!below740 && <DataText area="number">{index}</DataText>}
        <DataText area="name" justifyContent="flex-start" alignItems="flex-start">
          <AutoColumn gap="8px" justify="flex-start" align="flex-start">
            <DoubleTokenLogo size={16} a0={position.pair.token0.id} a1={position.pair.token1.id} margin={!below740} />
          </AutoColumn>
          <AutoColumn gap="8px" justify="flex-start" style={{ marginLeft: '20px' }}>
            <CustomLink to={formatPath(`/pairs/${position.pair.id}`)} style={{ whiteSpace: 'nowrap' }}>
              {position.pair.token0.symbol + '-' + position.pair.token1.symbol}
            </CustomLink>

            <ButtonsContainer gap="8px" justify="flex-start">
              <Link
                external
                href={getPoolLink(position.pair.token0.id, position.pair.token1.id)}
                style={{ marginRight: '.5rem' }}
              >
                <ButtonLight style={{ padding: '.5rem 1rem', borderRadius: '.625rem' }}>{t('add')}</ButtonLight>
              </Link>
              {poolOwnership > 0 && (
                <Link external href={getPoolLink(position.pair.token0.id, position.pair.token1.id, true)}>
                  <ButtonLight style={{ padding: '.5rem 1rem', borderRadius: '.625rem' }}>{t('remove')}</ButtonLight>
                </Link>
              )}
            </ButtonsContainer>
          </AutoColumn>
        </DataText>
        <DataText area="uniswap">
          <AutoColumn gap="12px" justify="flex-end">
            <DataText>{formattedNum(valueUSD, true, true)}</DataText>
            <AutoColumn gap="4px" justify="flex-end">
              <RowFixed>
                <DataText fontWeight={400} fontSize={11}>
                  {formattedNum(poolOwnership * parseFloat(position.pair.reserve0))}{' '}
                </DataText>
                <FormattedName
                  text={position.pair.token0.symbol}
                  maxCharacters={below740 ? 10 : 18}
                  margin={true}
                  fontSize={'11px'}
                />
              </RowFixed>
              <RowFixed>
                <DataText fontWeight={400} fontSize={11}>
                  {formattedNum(poolOwnership * parseFloat(position.pair.reserve1))}{' '}
                </DataText>
                <FormattedName
                  text={position.pair.token1.symbol}
                  maxCharacters={below740 ? 10 : 18}
                  margin={true}
                  fontSize={'11px'}
                />
              </RowFixed>
            </AutoColumn>
          </AutoColumn>
        </DataText>
        {!below500 && (
          <DataText area="return">
            <AutoColumn gap="12px" justify="flex-end">
              <TYPE.main color={'green'}>
                <RowFixed>{formattedNum(position?.fees.sum, true, true)}</RowFixed>
              </TYPE.main>
              <AutoColumn gap="4px" justify="flex-end">
                <RowFixed>
                  <DataText fontWeight={400} fontSize={11}>
                    {parseFloat(position.pair.token0.derivedETH)
                      ? formattedNum(
                          position?.fees.sum / (parseFloat(position.pair.token0.derivedETH) * ethPrice) / 2,
                          false,
                          true
                        )
                      : 0}{' '}
                  </DataText>
                  <FormattedName
                    text={position.pair.token0.symbol}
                    maxCharacters={below740 ? 10 : 18}
                    margin={true}
                    fontSize={'11px'}
                  />
                </RowFixed>
                <RowFixed>
                  <DataText fontWeight={400} fontSize={11}>
                    {parseFloat(position.pair.token1.derivedETH)
                      ? formattedNum(
                          position?.fees.sum / (parseFloat(position.pair.token1.derivedETH) * ethPrice) / 2,
                          false,
                          true
                        )
                      : 0}{' '}
                  </DataText>
                  <FormattedName
                    text={position.pair.token1.symbol}
                    maxCharacters={below740 ? 10 : 18}
                    margin={true}
                    fontSize={'11px'}
                  />
                </RowFixed>
              </AutoColumn>
            </AutoColumn>
          </DataText>
        )}
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
      <Panel
        style={{
          marginTop: below440 ? '.75rem' : '1.5rem',
          padding: 0
        }}
      >
        <DashGrid
          center={true}
          style={{ height: 'fit-content', padding: below440 ? '.75rem' : '1rem 2rem', border: 'unset' }}
        >
          {!below740 && (
            <Flex alignItems="flex-start" justifyContent="flexStart">
              <ClickableText area="number">#</ClickableText>
            </Flex>
          )}
          <Flex alignItems="flex-start" justifyContent="flex-start">
            <ClickableText area="number">{t('name')}</ClickableText>
          </Flex>
          <Flex alignItems="center" justifyContent="flexEnd">
            <ClickableText
              area="uniswap"
              onClick={() => {
                setSortedColumn(SORT_FIELD.VALUE)
                setSortDirection(sortedColumn !== SORT_FIELD.VALUE ? true : !sortDirection)
              }}
            >
              {below740 ? t('value') : t('liquidity')}{' '}
              {sortedColumn === SORT_FIELD.VALUE ? (!sortDirection ? '↑' : '↓') : ''}
            </ClickableText>
          </Flex>
          {!below500 && (
            <Flex alignItems="center" justifyContent="flexEnd">
              <ClickableText
                area="return"
                onClick={() => {
                  setSortedColumn(SORT_FIELD.UNISWAP_RETURN)
                  setSortDirection(sortedColumn !== SORT_FIELD.UNISWAP_RETURN ? true : !sortDirection)
                }}
              >
                {below740 ? t('fees') : t('totalFeesEarned')}{' '}
                {sortedColumn === SORT_FIELD.UNISWAP_RETURN ? (!sortDirection ? '↑' : '↓') : ''}
              </ClickableText>
            </Flex>
          )}
        </DashGrid>
        <Divider />
        <List p={0}>{!positionsSorted ? <LocalLoader /> : positionsSorted}</List>
      </Panel>
      <PageButtons>
        <div onClick={() => setPage(page === 1 ? page : page - 1)}>
          <Arrow faded={page === 1 ? true : false}>←</Arrow>
        </div>
        <TYPE.body>{`${t('page')} ${page} ${t('of')} ${maxPage}`}</TYPE.body>
        <div onClick={() => setPage(page === maxPage ? page : page + 1)}>
          <Arrow faded={page === maxPage ? true : false}>→</Arrow>
        </div>
      </PageButtons>
    </ListWrapper>
  )
}

export default PositionList
