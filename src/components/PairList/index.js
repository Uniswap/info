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
import { OVERVIEW_PAIR_BLACKLIST } from '../../constants'

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

// const OneInchLabel = styled.div`
//     border: 1px solid #6b7c99;
//     margin-left: 5px;
//     padding-left: 3px;
//     padding-right: 3px;
//     font-size: 0.65em !important;
//     border-radius: 5px;
// }
// `

const OneInchLabel = styled.div`
    border: 1px solid #6b7c99;
    margin-left: 20px;
    padding-left: 3px;
    padding-right: 3px;
    font-size: 0.65em !important;
    border-radius: 5px;
    width: 40px;
    margin-top: 5px;
    text-transform: uppercase;
}
`

const DashGrid = styled.div`
  display: grid;
  grid-gap: 1em;
  grid-template-columns: 100px 1fr 1fr;
  grid-template-areas: 'name liq vol';

  :hover {
    cursor: ${({ focus }) => focus && 'pointer'};
    background-color: ${({ focus, theme }) => focus && theme.bg3};
    margin: 0 -20px;
    padding: 0 20px;
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
    grid-template-columns: 1.5fr 1fr 1fr ${({ disbaleLinks }) => (disbaleLinks ? '160px' : '300px')};
    grid-template-areas: ' name liq vol pool ';
  }

  @media screen and (min-width: 1080px) {
    grid-template-columns: 1.5fr 1fr 1fr 1fr 1fr ${({ disbaleLinks }) => (disbaleLinks ? '160px' : '300px')};
    grid-template-areas: ' name liq vol volWeek fees pool ';
  }

  @media screen and (min-width: 1200px) {
    grid-template-columns: 1.5fr 1fr 1fr 1fr 1fr ${({ disbaleLinks }) => (disbaleLinks ? '160px' : '300px')};
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
  LIQ: 0,
  VOL: 1,
  TXNS: 2,
  VOL_7DAYS: 3,
  FEES: 4
}

const FIELD_TO_VALUE = {
  // trackedReserveETH - to sort with tracked volume only
  [SORT_FIELD.LIQ]: 'reserveUSD', //
  [SORT_FIELD.VOL]: 'oneDayVolumeUSD',
  [SORT_FIELD.TXNS]: 'oneDayTxns',
  [SORT_FIELD.VOL_7DAYS]: 'oneWeekVolumeUSD',
  [SORT_FIELD.FEES]: 'oneDayExtraFee'
}

const IncentivisedPairUrls = {
  "0x0000000000000000000000000000000000000000/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48": true,
  "0x0000000000000000000000000000000000000000/0x6b175474e89094c44da98b954eedeac495271d0f": true,
  "0x0000000000000000000000000000000000000000/0x514910771af9ca656af840dff83e8264ecf986ca": true,
  "0x0000000000000000000000000000000000000000/0x476c5e26a75bd202a9683ffd34359c0cc15be0ff": true,
  "0x0000000000000000000000000000000000000000/0xdac17f958d2ee523a2206206994597c13d831ec7": true,
  "0x0000000000000000000000000000000000000000/0x2260fac5e5542a773aa44fbcfedf7c193bc2c599": true,
  "0x0000000000000000000000000000000000000000/0xd46ba6d942050d489dbd938a2c909a5d5039a161": true,
  "0x0000000000000000000000000000000000000000/0xeb4c2781e4eba804ce9a9803c67d0893436bb27d": true,
  "0x0000000000000000000000000000000000000000/0xfe18be6b3bd88a2d2a7f928d00292e7a9963cfc6": true,
  "0x0000000000000000000000000000000000000000/0x80fb784b7ed66730e8b1dbd9820afd29931aab03": true,
  "0x0000000000000000000000000000000000000000/0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f": true,
  "0x0000000000000000000000000000000000000000/0x57ab1ec28d129707052df4df418d58a2d46d5f51": true,
  "0x0000000000000000000000000000000000000000/0x0bc529c00c6401aef6d220be8c6ea1667f6ad93e": true,
  "0x0000000000000000000000000000000000000000/0xd533a949740bb3306d119cc777fa900ba034cd52": true,
  "0x0000000000000000000000000000000000000000/0x6810e776880c02933d47db1b9fc05908e5386b96": true,
  "0x0000000000000000000000000000000000000000/0xa3bed4e1c75d00fa6f4e5e6922db7261b5e9acd2": true,
  "0x0000000000000000000000000000000000000000/0x408e41876cccdc0f92210600ef50372656052a38": true,
  "0x0000000000000000000000000000000000000000/0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2": true,
  "0x0000000000000000000000000000000000000000/0xdd974d5c2e2928dea5f71b9825b8b646686bd200": true,
  "0x0000000000000000000000000000000000000000/0x5e74c9036fb86bd7ecdcb084a0673efc32ea31cb": true,
  "0x0000000000000000000000000000000000000000/0xdf5e0e81dff6faf3a7e52ba697820c5e32d806a8": true,
  "0x0000000000000000000000000000000000000000/0x8ab7404063ec4dbcfd4598215992dc3f8ec853d7": true,
  "0x0000000000000000000000000000000000000000/0x0d438f3b5175bebc262bf23753c1e53d03432bde": true,
  "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48/0xdac17f958d2ee523a2206206994597c13d831ec7": true,
  "0x0d438f3b5175bebc262bf23753c1e53d03432bde/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48": true,
  "0x6b175474e89094c44da98b954eedeac495271d0f/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48": true,
  "0x6b175474e89094c44da98b954eedeac495271d0f/0xdac17f958d2ee523a2206206994597c13d831ec7": true,
  "0x57ab1ec28d129707052df4df418d58a2d46d5f51/0x6b175474e89094c44da98b954eedeac495271d0f": true,
  "0x6b175474e89094c44da98b954eedeac495271d0f/0xdf5e0e81dff6faf3a7e52ba697820c5e32d806a8": true,
  "0x0000000000000000000000000000000000000000/0x56d811088235f11c8920698a204a5010a788f4b3": true,
  "0x8ab7404063ec4dbcfd4598215992dc3f8ec853d7/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48": true,
  "0x0000000000000000000000000000000000000000/0x0000000000004946c0e9f43f4dee607b0ef1fa1c": true,
  "0x0000000000004946c0e9f43f4dee607b0ef1fa1c/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48": true,
  "0x0000000000000000000000000000000000000000/0x84ca8bc7997272c7cfb4d0cd3d55cd942b3c9419": true,
  "0x0000000000000000000000000000000000000000/0x0ae055097c6d159879521c384f1d2123d1f195e6": true
};

function PairList({ pairs, color, history, disbaleLinks, maxItems = 10 }) {

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

    if (pairData && pairData.token0 && pairData.token1) {
      const liquidity = formattedNum(pairData.reserveUSD, true)
      const volume = formattedNum(pairData.oneDayVolumeUSD, true)

      if (pairData.token0.id === '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2') {
        pairData.token0.name = 'ETH (Wrapped)'
        pairData.token0.symbol = 'ETH'
      }

      if (pairData.token0.id === '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2') {
        pairData.token0.name = 'ETH (Wrapped)'
        pairData.token0.symbol = 'ETH'
      }

      if (pairData.token1.id === '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2') {
        pairData.token1.name = 'ETH (Wrapped)'
        pairData.token1.symbol = 'ETH'
      }

      if (pairData.token1.id === '0xdf5e0e81dff6faf3a7e52ba697820c5e32d806a8') {
        pairData.token1.symbol = 'yCRV'
      }

      if (pairData.token0.id === '0xdf5e0e81dff6faf3a7e52ba697820c5e32d806a8') {
        pairData.token1.symbol = 'yCRV'
      }

      const pairUrl = `${pairData.token0.id}/${pairData.token1.id}`;

      return (
        <DashGrid
          style={{ height: '60px' }}
          disbaleLinks={disbaleLinks}
          focus={true}
          onClick={() => history.push('/pair/' + pairAddress)}
        >
          <DataText area="name" fontWeight="500">
            {!below600 && <div style={{ marginRight: '20px' }}>{index}</div>}
            <DoubleTokenLogo
              size={below600 ? 16 : 20}
              a0={pairData.token0.id}
              a1={pairData.token1.id}
              margin={!below740}
            />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <CustomLink style={{ marginLeft: '20px', whiteSpace: 'nowrap' }} to={'/pair/' + pairAddress} color={color}>
                {pairData.token0.symbol + '-' + pairData.token1.symbol}
              </CustomLink>
              {
                IncentivisedPairUrls[pairUrl] ? <OneInchLabel>Farming</OneInchLabel> : ''
              }
            </div>
          </DataText>
          <DataText area="liq">{liquidity}</DataText>
          <DataText area="vol">{volume}</DataText>
          {!below1080 && <DataText area="volWeek">{formattedNum(pairData.oneWeekVolumeUSD, true)}</DataText>}
          {!below1080 && <DataText area="fees">{formattedNum(pairData.oneDayTotalFee, true)}</DataText>}
          {!below740 &&
            (disbaleLinks ? (
              <Flex area="pool" justifyContent="flex-end" alignItems="center">
                <CustomLink color={'white'} to={'/pair/' + pairAddress}>
                  <ButtonDark color={color}>View</ButtonDark>
                </CustomLink>
              </Flex>
            ) : (
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
            ))}
        </DashGrid>
      )
    } else {
      return ''
    }
  }

  const pairList =
    pairs &&
    Object.keys(pairs)
      .sort((addressA, addressB) => {
        const pairA = pairs[addressA]
        const pairB = pairs[addressB]
        return parseFloat(pairA[FIELD_TO_VALUE[sortedColumn]]) > parseFloat(pairB[FIELD_TO_VALUE[sortedColumn]])
          ? (sortDirection ? -1 : 1) * 1
          : (sortDirection ? -1 : 1) * -1
      })
      .slice(ITEMS_PER_PAGE * (page - 1), page * ITEMS_PER_PAGE)
      .map((pairAddress, index) => {
        return (
          pairAddress &&
          !OVERVIEW_PAIR_BLACKLIST.includes(pairAddress) && (
            <div key={index}>
              <ListItem key={index} index={(page - 1) * 10 + index + 1} pairAddress={pairAddress} />
              <Divider />
            </div>
          )
        )
      })

  return (
    <ListWrapper>
      <DashGrid center={true} disbaleLinks={disbaleLinks} style={{ height: 'fit-content', padding: '0 0 1rem 0', margin: 0 }}>
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
