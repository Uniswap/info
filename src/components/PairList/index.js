import React, { useState, useEffect } from 'react'
import { useMedia } from 'react-use'
import dayjs from 'dayjs'
import LocalLoader from '../LocalLoader'
import utc from 'dayjs/plugin/utc'
import { Box, Flex, Text } from 'rebass'
import styled from 'styled-components'

import { CustomLink } from '../Link'
import { Divider } from '../../components'
import { useParams, withRouter } from 'react-router-dom'
import { formattedNum, formattedPercent } from '../../utils'
import DoubleTokenLogo from '../DoubleLogo'
import FormattedName from '../FormattedName'
import QuestionHelper from '../QuestionHelper'
import { TYPE } from '../../Theme'
import { MAX_ALLOW_APY } from '../../constants'
import useTheme from '../../hooks/useTheme'

dayjs.extend(utc)

const PageButtons = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  margin: 1.25rem 0;
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
  padding: 0;

  > * {
    justify-content: flex-end;

    :first-child {
      justify-content: flex-start;
      text-align: left;
      width: 20px;
    }
  }

  @media screen and (min-width: 740px) {
    grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
    grid-template-areas: ' name liq vol weekVolume apy ';
  }

  @media screen and (min-width: 1080px) {
    grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1fr;
    grid-template-areas: ' name liq vol volWeek fees apy';
  }

  @media screen and (min-width: 1200px) {
    grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1fr;
    grid-template-areas: ' name liq vol volWeek fees apy';
  }
`
const TableHeader = styled(DashGrid)`
  background: ${({ theme }) => theme.tableHeader};
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  padding: 20px;
  line-height: 20px;
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
  text-transform: uppercase;
  font-size: 12px;
  font-weight: 500;
  color: ${({ theme }) => theme.subText};
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
  VOL: 1,
  VOL_7DAYS: 3,
  FEES: 4,
  APY: 5,
}

const FIELD_TO_VALUE = (field, useTracked = false) => {
  switch (field) {
    case SORT_FIELD.LIQ:
      return useTracked ? 'trackedReserveUSD' : 'reserveUSD'
    case SORT_FIELD.VOL:
      return useTracked ? 'oneDayVolumeUSD' : 'oneDayVolumeUntracked'
    case SORT_FIELD.VOL_7DAYS:
      return useTracked ? 'oneWeekVolumeUSD' : 'oneWeekVolumeUntracked'
    case SORT_FIELD.FEES:
      return useTracked ? 'oneDayVolumeUSD' : 'oneDayVolumeUntracked'
    default:
      return 'reserveUSD'
  }
}

function PairList({ pairs, color, disbaleLinks, maxItems = 5 }) {
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
  const { network: currentNetworkURL } = useParams()
  const prefixNetworkURL = currentNetworkURL ? `/${currentNetworkURL}` : ''

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
      const volume = pairData.oneDayVolumeUSD ? pairData.oneDayVolumeUSD : pairData.oneDayVolumeUntracked

      const liquidity = pairData.reserveUSD ? pairData.reserveUSD : pairData.trackedReserveUSD
      const oneDayFee = pairData.oneDayFeeUSD ? pairData.oneDayFeeUSD : pairData.oneDayFeeUntracked

      const apy =
        (oneDayFee * 365 * 100) / liquidity < MAX_ALLOW_APY ? formattedPercent((oneDayFee * 365 * 100) / liquidity) : '--'

      const weekVolume = pairData.oneWeekVolumeUSD ? pairData.oneWeekVolumeUSD : pairData.oneWeekVolumeUntracked

      return (
        <DashGrid style={{ height: '56px' }} disbaleLinks={disbaleLinks} focus={true}>
          <DataText area='name' fontWeight='500'>
            {!below600 && <div style={{ marginRight: '20px', width: '10px' }}>{index}</div>}
            <DoubleTokenLogo size={below600 ? 16 : 20} a0={pairData.token0.id} a1={pairData.token1.id} margin={!below740} />
            <CustomLink
              style={{ marginLeft: '20px', whiteSpace: 'nowrap' }}
              to={prefixNetworkURL + '/pair/' + pairAddress}
              color={color}
            >
              <FormattedName
                text={pairData.token0.symbol + '-' + pairData.token1.symbol}
                maxCharacters={below600 ? 8 : 16}
                adjustSize={true}
                link={true}
              />
            </CustomLink>
          </DataText>
          <DataText area='liq'>{formattedNum(liquidity, true)}</DataText>
          <DataText area='vol'>{formattedNum(volume, true)}</DataText>
          {!below740 && <DataText area='volWeek'>{formattedNum(weekVolume, true)}</DataText>}
          {!below1080 && <DataText area='fees'>{formattedNum(oneDayFee, true)}</DataText>}
          {!below740 && <DataText area='apy'>{apy}</DataText>}
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
        if (sortedColumn === SORT_FIELD.APY) {
          const getApr = pairData => {
            const liquidity = pairData.reserveUSD ? pairData.reserveUSD : pairData.trackedReserveUSD
            const oneDayFee = pairData.oneDayFeeUSD ? pairData.oneDayFeeUSD : pairData.oneDayFeeUntracked
            const apy = (oneDayFee * 365 * 100) / liquidity < MAX_ALLOW_APY ? (oneDayFee * 365 * 100) / liquidity : 0
            return apy
          }

          const apy0 = getApr(pairA)
          const apy1 = getApr(pairB)
          return apy0 > apy1 ? (sortDirection ? -1 : 1) * 1 : (sortDirection ? -1 : 1) * -1
        }
        return parseFloat(pairA[FIELD_TO_VALUE(sortedColumn)]) > parseFloat(pairB[FIELD_TO_VALUE(sortedColumn)])
          ? (sortDirection ? -1 : 1) * 1
          : (sortDirection ? -1 : 1) * -1
      })
      .slice(ITEMS_PER_PAGE * (page - 1), page * ITEMS_PER_PAGE)
      .map((pairAddress, index) => {
        return (
          pairAddress && (
            <div key={pairAddress} style={{ padding: '0 20px' }}>
              <ListItem key={index} index={(page - 1) * ITEMS_PER_PAGE + index + 1} pairAddress={pairAddress} />
              <Divider />
            </div>
          )
        )
      })

  const theme = useTheme()

  return (
    <ListWrapper>
      <TableHeader center={true} disbaleLinks={disbaleLinks} style={{ height: 'fit-content' }}>
        <Flex alignItems='center' justifyContent='flexStart'>
          <Text fontWeight='500' fontSize='12px' color={theme.subText}>
            NAME
          </Text>
        </Flex>
        <Flex alignItems='center' justifyContent='flexEnd'>
          <ClickableText
            area='liq'
            onClick={e => {
              setSortedColumn(SORT_FIELD.LIQ)
              setSortDirection(prev => (sortedColumn !== SORT_FIELD.LIQ ? true : !prev))
            }}
          >
            Liquidity {sortedColumn === SORT_FIELD.LIQ ? (!sortDirection ? '↑' : '↓') : ''}
          </ClickableText>
        </Flex>
        <Flex alignItems='center'>
          <ClickableText
            area='vol'
            onClick={e => {
              setSortedColumn(SORT_FIELD.VOL)
              setSortDirection(sortedColumn !== SORT_FIELD.VOL ? true : !sortDirection)
            }}
          >
            Volume (24H)
            {sortedColumn === SORT_FIELD.VOL ? (!sortDirection ? '↑' : '↓') : ''}
          </ClickableText>
        </Flex>
        {!below740 && (
          <Flex alignItems='center' justifyContent='flexEnd'>
            <ClickableText
              area='volWeek'
              onClick={e => {
                setSortedColumn(SORT_FIELD.VOL_7DAYS)
                setSortDirection(sortedColumn !== SORT_FIELD.VOL_7DAYS ? true : !sortDirection)
              }}
            >
              Volume (7D) {sortedColumn === SORT_FIELD.VOL_7DAYS ? (!sortDirection ? '↑' : '↓') : ''}
            </ClickableText>
          </Flex>
        )}
        {!below1080 && (
          <Flex alignItems='center' justifyContent='flexEnd'>
            <ClickableText
              area='fees'
              onClick={e => {
                setSortedColumn(SORT_FIELD.FEES)
                setSortDirection(sortedColumn !== SORT_FIELD.FEES ? true : !sortDirection)
              }}
            >
              Fees (24H) {sortedColumn === SORT_FIELD.FEES ? (!sortDirection ? '↑' : '↓') : ''}
            </ClickableText>
          </Flex>
        )}
        {!below740 && (
          <Flex alignItems='center' justifyContent='flexEnd'>
            <ClickableText
              area='apy'
              onClick={e => {
                setSortedColumn(SORT_FIELD.APY)
                setSortDirection(prev => (sortedColumn !== SORT_FIELD.APY ? true : !prev))
              }}
            >
              APR {sortedColumn === SORT_FIELD.APY ? (!sortDirection ? '↑' : '↓') : ''}
            </ClickableText>
            <QuestionHelper text={'Estimated return based on yearly fees of the pool'} />
          </Flex>
        )}
      </TableHeader>
      <Divider />
      {!pairList.length ? <LocalLoader /> : <List p={0}>{pairList}</List>}
      <PageButtons>
        <div
          onClick={e => {
            setPage(page === 1 ? page : page - 1)
          }}
        >
          <Arrow faded={page === 1 ? true : false}>←</Arrow>
        </div>
        <TYPE.body>{'Page ' + page + ' of ' + maxPage}</TYPE.body>
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
