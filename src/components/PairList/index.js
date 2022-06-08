import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useMedia } from 'react-use'
import dayjs from 'dayjs'
import LocalLoader from '../LocalLoader'
import utc from 'dayjs/plugin/utc'
import { Box, Flex, Text } from 'rebass'
import styled from 'styled-components'

import { CustomLink } from '../Link'
import { Divider } from '../../components'
import { Link, withRouter } from 'react-router-dom'
import { formattedNum, formattedPercent } from '../../utils'
import DoubleTokenLogo from '../DoubleLogo'
import FormattedName from '../FormattedName'
import QuestionHelper from '../QuestionHelper'
import { TYPE } from '../../Theme'
import { MAX_ALLOW_APY } from '../../constants'
import { NETWORKS_INFO } from '../../constants/networks'
import { aggregatePairs } from '../../utils/aggregateData'
import { MouseoverTooltip } from '../Tooltip'
import { NetworksInfoEnv, useNetworksInfo, useTokensList } from '../../contexts/NetworkInfo'

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
  grid-template-columns: 1.5fr ${({ isShowNetworkColumn }) => (isShowNetworkColumn ? '75px' : '')} 1fr 1fr;
  grid-template-areas: 'name ${({ isShowNetworkColumn }) => (isShowNetworkColumn ? 'network' : '')} liq vol';
  padding: 0;

  > * {
    justify-content: flex-end;

    :first-child {
      justify-content: flex-start;
      text-align: left;
    }

    &:nth-child(2) {
      justify-content: center;
    }
  }

  @media screen and (min-width: 740px) {
    grid-template-columns: 2fr ${({ isShowNetworkColumn }) => (isShowNetworkColumn ? '75px' : '')} 1fr 1fr 1fr 1fr;
    grid-template-areas: ' name ${({ isShowNetworkColumn }) => (isShowNetworkColumn ? 'network' : '')} liq vol weekVolume apy ';
  }

  @media screen and (min-width: 1080px) {
    grid-gap: 0.5em;
    grid-template-columns: 2fr ${({ isShowNetworkColumn }) => (isShowNetworkColumn ? '75px' : '')} 1fr 1fr 1fr 1fr 1fr;
    grid-template-areas: ' name ${({ isShowNetworkColumn }) => (isShowNetworkColumn ? 'network' : '')} liq vol volWeek fees apy';
  }

  @media screen and (min-width: 1200px) {
    grid-template-columns: 2fr ${({ isShowNetworkColumn }) => (isShowNetworkColumn ? '75px' : '')} 1fr 1fr 1fr 1fr 1fr;
    grid-template-areas: ' name ${({ isShowNetworkColumn }) => (isShowNetworkColumn ? 'network' : '')} liq vol volWeek fees apy';
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

const FIELDS = {
  LIQ: 'liquidity',
  VOL: 'volume',
  NETWORK: 2,
  VOL_7DAYS: 'weekVolume',
  FEES: 'oneDayFee',
  APY: 'apy',
  NAME: 'name',
}

const MAP_SHOW_DATA = pairData => {
  const liquidity = pairData.reserveUSD || pairData.trackedReserveUSD
  const volume = pairData.oneDayVolumeUSD || pairData.oneDayVolumeUntracked
  const weekVolume = pairData.oneWeekVolumeUSD || pairData.oneWeekVolumeUntracked
  const oneDayFee = pairData.oneDayFeeUSD || pairData.oneDayFeeUntracked
  const apy = (oneDayFee * 365 * 100) / liquidity < MAX_ALLOW_APY ? (oneDayFee * 365 * 100) / liquidity : 0
  const name = pairData.token0.symbol + '-' + pairData.token1.symbol
  return {
    [FIELDS.LIQ]: liquidity,
    [FIELDS.VOL]: volume,
    [FIELDS.VOL_7DAYS]: weekVolume,
    [FIELDS.FEES]: oneDayFee,
    [FIELDS.APY]: apy,
    [FIELDS.NAME]: name,
  }
}

function PairList({ pairs, color, disbaleLinks, maxItems = 5 }) {
  const isShowNetworkColumn = pairs?.slice(1).some(Boolean)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const aggregatedPairs = useMemo(() => aggregatePairs(pairs.filter(Boolean)), [JSON.stringify(pairs)])
  const below600 = useMedia('(max-width: 600px)')
  const below740 = useMedia('(max-width: 740px)')
  const below1080 = useMedia('(max-width: 1080px)')
  let tokensLists = useTokensList() // please do not remove this line. It helps DoubleTokenLogo reload
  tokensLists = tokensLists || 2

  // pagination
  const [page, setPage] = useState(1)
  const [maxPage, setMaxPage] = useState(1)

  // sorting
  const [sortDirection, setSortDirection] = useState(true)
  const [sortedColumn, setSortedColumn] = useState(FIELDS.LIQ)

  const [[networkInfo]] = useNetworksInfo()
  useEffect(() => {
    setPage(1)
  }, [networkInfo])

  useEffect(() => {
    if (aggregatedPairs) {
      let extraPages = 1
      if (Object.keys(aggregatedPairs).length % maxItems === 0) {
        extraPages = 0
      }
      setMaxPage(Math.floor(Object.keys(aggregatedPairs).length / maxItems) + extraPages)
    }
  }, [maxItems, aggregatedPairs])

  const ListItem = useCallback(
    ({ pairAddress, index }) => {
      const pairData = aggregatedPairs[pairAddress]
      if (pairData && pairData.token0 && pairData.token1) {
        const showData = MAP_SHOW_DATA(pairData)
        const pairNetworkInfo = NETWORKS_INFO[pairData.chainId] || NetworksInfoEnv[0]
        return (
          <DashGrid style={{ height: '56px' }} disbaleLinks={disbaleLinks} focus={true} isShowNetworkColumn={isShowNetworkColumn}>
            <DataText area='name' fontWeight='500'>
              {!below600 && <div style={{ marginRight: '20px', width: '10px' }}>{index}</div>}
              <DoubleTokenLogo
                size={below600 ? 16 : 20}
                a0={pairData.token0.id}
                a1={pairData.token1.id}
                margin={!below740}
                networkInfo={pairNetworkInfo}
              />
              <CustomLink
                style={{ marginLeft: '20px', whiteSpace: 'nowrap' }}
                to={'/' + pairNetworkInfo.urlKey + '/pair/' + pairAddress}
                color={color}
              >
                <FormattedName text={showData.name} maxCharacters={below600 ? 8 : 16} adjustSize={true} link={true} />
              </CustomLink>
            </DataText>
            {isShowNetworkColumn && (
              <DataText area='network'>
                <Link to={'/' + pairNetworkInfo.urlKey}>
                  <MouseoverTooltip text={pairNetworkInfo.name} width='unset'>
                    <img src={pairNetworkInfo.icon} width={25} />
                  </MouseoverTooltip>
                </Link>
              </DataText>
            )}
            <DataText area='liq'>{formattedNum(showData.liquidity, true)}</DataText>
            <DataText area='vol'>{formattedNum(showData.volume, true)}</DataText>
            {!below740 && <DataText area='volWeek'>{formattedNum(showData.weekVolume, true)}</DataText>}
            {!below1080 && <DataText area='fees'>{formattedNum(showData.oneDayFee, true)}</DataText>}
            {!below740 && <DataText area='apy'>{showData.apy ? formattedPercent(showData.apy) : '--'}</DataText>}
          </DashGrid>
        )
      } else {
        return ''
      }
    },
    [aggregatedPairs, below1080, below600, below740, color, disbaleLinks, isShowNetworkColumn]
  )

  const pairList = useMemo(
    () =>
      aggregatedPairs &&
      Object.keys(aggregatedPairs)
        .sort((addressA, addressB) => {
          const pairA = aggregatedPairs[addressA]
          const pairB = aggregatedPairs[addressB]
          let valueToCompareA = null
          let valueToCompareB = null
          if (sortedColumn == FIELDS.NAME) {
            //reverse order
            valueToCompareB = MAP_SHOW_DATA(pairA)[sortedColumn]
            valueToCompareA = MAP_SHOW_DATA(pairB)[sortedColumn]
          } else if ([FIELDS.APY, FIELDS.FEES, FIELDS.LIQ, FIELDS.VOL, FIELDS.VOL_7DAYS].includes(sortedColumn)) {
            valueToCompareA = parseFloat(MAP_SHOW_DATA(pairA)[sortedColumn])
            valueToCompareB = parseFloat(MAP_SHOW_DATA(pairB)[sortedColumn])
          } else if (sortedColumn === FIELDS.NETWORK) {
            //reverse order
            valueToCompareB = NETWORKS_INFO[pairA.chainId].name
            valueToCompareA = NETWORKS_INFO[pairB.chainId].name
          }
          if (valueToCompareA == valueToCompareB) {
            if (parseFloat(MAP_SHOW_DATA(pairA)[FIELDS.LIQ]) == parseFloat(MAP_SHOW_DATA(pairB)[FIELDS.LIQ])) {
              return MAP_SHOW_DATA(pairA)[FIELDS.NAME] > MAP_SHOW_DATA(pairB)[FIELDS.NAME] ? 1 : -1
            }
            return parseFloat(MAP_SHOW_DATA(pairA)[FIELDS.LIQ]) < parseFloat(MAP_SHOW_DATA(pairB)[FIELDS.LIQ]) ? 1 : -1
          }
          return valueToCompareA > valueToCompareB ? (sortDirection ? -1 : 1) * 1 : (sortDirection ? -1 : 1) * -1
        })
        .slice(maxItems * (page - 1), page * maxItems)
        .map((pairAddress, index) => {
          return (
            pairAddress && (
              <div key={pairAddress} style={{ padding: '0 20px' }}>
                <ListItem index={(page - 1) * maxItems + index + 1} pairAddress={pairAddress} />
                <Divider />
              </div>
            )
          )
        }),
    [maxItems, ListItem, aggregatedPairs, page, sortDirection, sortedColumn]
  )

  return (
    <ListWrapper>
      <TableHeader
        center={true}
        disbaleLinks={disbaleLinks}
        style={{ height: 'fit-content' }}
        isShowNetworkColumn={isShowNetworkColumn}
      >
        <Flex alignItems='center' justifyContent='flexStart'>
          <ClickableText
            area='name'
            onClick={e => {
              setSortedColumn(FIELDS.NAME)
              setSortDirection(prev => (sortedColumn !== FIELDS.NAME ? true : !prev))
            }}
          >
            NAME {sortedColumn === FIELDS.NAME ? (!sortDirection ? '↑' : '↓') : ''}
          </ClickableText>
        </Flex>
        {isShowNetworkColumn && (
          <Flex alignItems='center' justifyContent='center'>
            <ClickableText
              area='network'
              onClick={e => {
                setSortedColumn(FIELDS.NETWORK)
                setSortDirection(prev => (sortedColumn !== FIELDS.NETWORK ? true : !prev))
              }}
            >
              Network {sortedColumn === FIELDS.NETWORK ? (!sortDirection ? '↑' : '↓') : ''}
            </ClickableText>
          </Flex>
        )}
        <Flex alignItems='center' justifyContent='flexEnd'>
          <ClickableText
            area='liq'
            onClick={e => {
              setSortedColumn(FIELDS.LIQ)
              setSortDirection(prev => (sortedColumn !== FIELDS.LIQ ? true : !prev))
            }}
          >
            Liquidity {sortedColumn === FIELDS.LIQ ? (!sortDirection ? '↑' : '↓') : ''}
          </ClickableText>
        </Flex>
        <Flex alignItems='center'>
          <ClickableText
            area='vol'
            onClick={e => {
              setSortedColumn(FIELDS.VOL)
              setSortDirection(sortedColumn !== FIELDS.VOL ? true : !sortDirection)
            }}
          >
            Volume (24H)
            {sortedColumn === FIELDS.VOL ? (!sortDirection ? '↑' : '↓') : ''}
          </ClickableText>
        </Flex>
        {!below740 && (
          <Flex alignItems='center' justifyContent='flexEnd'>
            <ClickableText
              area='volWeek'
              onClick={e => {
                setSortedColumn(FIELDS.VOL_7DAYS)
                setSortDirection(sortedColumn !== FIELDS.VOL_7DAYS ? true : !sortDirection)
              }}
            >
              Volume (7D) {sortedColumn === FIELDS.VOL_7DAYS ? (!sortDirection ? '↑' : '↓') : ''}
            </ClickableText>
          </Flex>
        )}
        {!below1080 && (
          <Flex alignItems='center' justifyContent='flexEnd'>
            <ClickableText
              area='fees'
              onClick={e => {
                setSortedColumn(FIELDS.FEES)
                setSortDirection(sortedColumn !== FIELDS.FEES ? true : !sortDirection)
              }}
            >
              Fees (24H) {sortedColumn === FIELDS.FEES ? (!sortDirection ? '↑' : '↓') : ''}
            </ClickableText>
          </Flex>
        )}
        {!below740 && (
          <Flex alignItems='center' justifyContent='flexEnd'>
            <ClickableText
              area='apy'
              onClick={e => {
                setSortedColumn(FIELDS.APY)
                setSortDirection(prev => (sortedColumn !== FIELDS.APY ? true : !prev))
              }}
            >
              APR {sortedColumn === FIELDS.APY ? (!sortDirection ? '↑' : '↓') : ''}
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
