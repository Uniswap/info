import React, { useState, useEffect } from 'react'
import { useMedia } from 'react-use'
import dayjs from 'dayjs'
import LocalLoader from '../LocalLoader'
import utc from 'dayjs/plugin/utc'
import { Box, Flex } from 'rebass'
import styled from 'styled-components'

import { CustomLink } from '../Link'
import { Divider } from '..'
import { Link, withRouter } from 'react-router-dom'
import { formattedNum, shortenAddress } from '../../utils'
import { TYPE } from '../../Theme'
import DoubleTokenLogo from '../DoubleLogo'
import { RowFixed } from '../Row'
import useTheme from '../../hooks/useTheme'
import { NETWORKS_INFO } from '../../constants/networks'
import { aggregateLps } from '../../utils/aggregateData'

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
  grid-gap: 1em;
  grid-template-columns: 10px 1.5fr ${({ isShowNetworkColumn }) => (isShowNetworkColumn ? '75px' : '')} 1fr 1fr 1fr;
  grid-template-areas: 'number name ${({ isShowNetworkColumn }) => (isShowNetworkColumn ? 'network' : '')} pair pool value';
  padding: 0;

  > * {
    justify-content: flex-end;
  }

  @media screen and (max-width: 1024px) {
    grid-template-columns: 1.5fr ${({ isShowNetworkColumn }) => (isShowNetworkColumn ? '75px' : '')} 1fr 1fr 1fr;
    grid-template-areas: 'name ${({ isShowNetworkColumn }) => (isShowNetworkColumn ? 'network' : '')} pair pool value';
  }

  @media screen and (max-width: 600px) {
    grid-template-columns: 1fr ${({ isShowNetworkColumn }) => (isShowNetworkColumn ? '75px' : '')} 1fr 1fr;
    grid-template-areas: 'name ${({ isShowNetworkColumn }) => (isShowNetworkColumn ? 'network' : '')} pool value';
  }
`

const TableHeader = styled(DashGrid)`
  background: ${({ theme }) => theme.tableHeader};
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  padding: 20px;
`

const ListWrapper = styled.div``

const DataText = styled(Flex)`
  align-items: center;
  text-align: center;
  color: ${({ theme }) => theme.text1};
  & > * {
    font-size: 14px;
  }

  @media screen and (max-width: 600px) {
    font-size: 13px;
  }
`

function LPList({ lps, disbaleLinks, maxItems = 10 }) {
  const isShowNetworkColumn = lps?.slice(1).some(Boolean)
  const aggregatedLps = aggregateLps(lps)
  const below600 = useMedia('(max-width: 600px)')
  const below800 = useMedia('(max-width: 800px)')
  const below1024 = useMedia('(max-width: 1024px)')

  // pagination
  const [page, setPage] = useState(1)
  const [maxPage, setMaxPage] = useState(1)
  const ITEMS_PER_PAGE = maxItems

  useEffect(() => {
    setMaxPage(1) // edit this to do modular
    setPage(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(aggregatedLps)])

  useEffect(() => {
    if (aggregatedLps) {
      let extraPages = 1
      if (Object.keys(aggregatedLps).length % ITEMS_PER_PAGE === 0) {
        extraPages = 0
      }
      setMaxPage(Math.floor(Object.keys(aggregatedLps).length / ITEMS_PER_PAGE) + extraPages)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ITEMS_PER_PAGE, JSON.stringify(aggregatedLps)])

  const ListItem = ({ lp, index }) => {
    return (
      <DashGrid style={{ height: '56px' }} disbaleLinks={disbaleLinks} focus={true} isShowNetworkColumn={isShowNetworkColumn}>
        {!below1024 && (
          <DataText area='number' fontWeight='500'>
            {index}
          </DataText>
        )}
        <DataText area='name' fontWeight='500' justifyContent='flex-start'>
          <CustomLink
            style={{
              marginLeft: below600 ? 0 : '1rem',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              width: 'fit-content',
            }}
            to={'/' + NETWORKS_INFO[lp.chainId].urlKey + '/account/' + lp.user.id}
          >
            {below800 ? lp.user.id.slice(0, 5) + '...' + lp.user.id.slice(39, 42) : lp.user.id}
          </CustomLink>
        </DataText>
        {isShowNetworkColumn && (
          <DataText area='network'>
            <Link to={'/' + NETWORKS_INFO[lp.chainId].urlKey}>
              <img src={NETWORKS_INFO[lp.chainId].icon} width={25} />
            </Link>
          </DataText>
        )}

        {/* {!below1080 && (
          <DataText area="type" justifyContent="flex-end">
            {lp.type}
          </DataText>
        )} */}

        {!below600 && (
          <DataText>
            <CustomLink area='pair' to={'/' + NETWORKS_INFO[lp.chainId].urlKey + '/pair/' + lp.pairAddress}>
              <RowFixed>
                {!below600 && (
                  <DoubleTokenLogo
                    a0={lp.token0}
                    a1={lp.token1}
                    size={16}
                    margin={true}
                    networkInfo={NETWORKS_INFO[lp.chainId]}
                  />
                )}
                {lp.pairName}
              </RowFixed>
            </CustomLink>
          </DataText>
        )}

        <DataText>
          <CustomLink area='pool' to={'/' + NETWORKS_INFO[lp.chainId].urlKey + '/pool/' + lp.poolAddress}>
            <RowFixed>{shortenAddress(lp.poolAddress, 3)}</RowFixed>
          </CustomLink>
        </DataText>

        <DataText area='value'>{formattedNum(lp.usd, true)}</DataText>
      </DashGrid>
    )
  }

  const lpList =
    aggregatedLps &&
    aggregatedLps.slice(ITEMS_PER_PAGE * (page - 1), page * ITEMS_PER_PAGE).map((lp, index) => {
      return (
        <div key={index}>
          <ListItem key={index} index={(page - 1) * 10 + index + 1} lp={lp} />
          <Divider />
        </div>
      )
    })

  const theme = useTheme()

  return (
    <ListWrapper>
      <TableHeader
        center={true}
        disbaleLinks={disbaleLinks}
        style={{ height: 'fit-content' }}
        isShowNetworkColumn={isShowNetworkColumn}
      >
        {!below1024 && (
          <Flex alignItems='center' justifyContent='flex-start'>
            <TYPE.main area='number'>#</TYPE.main>
          </Flex>
        )}
        <Flex alignItems='center' justifyContent='flex-start' style={{ marginLeft: below600 ? 0 : '1rem', whiteSpace: 'nowrap' }}>
          <TYPE.main area='name' color={theme.subText} fontSize='12px'>
            ACCOUNT
          </TYPE.main>
        </Flex>
        {isShowNetworkColumn && (
          <Flex alignItems='center'>
            <TYPE.main area='name' color={theme.subText} fontSize='12px'>
              NETWORK
            </TYPE.main>
          </Flex>
        )}
        {/* {!below1080 && (
          <Flex alignItems="center" justifyContent="flexEnd">
            <TYPE.main area="type">Type</TYPE.main>
          </Flex>
        )} */}
        {!below600 && (
          <Flex alignItems='center' justifyContent='flexEnd'>
            <TYPE.main area='name' color={theme.subText} fontSize='12px'>
              PAIR
            </TYPE.main>
          </Flex>
        )}
        <Flex alignItems='center' justifyContent='flexEnd'>
          <TYPE.main area='name' color={theme.subText} fontSize='12px'>
            POOL
          </TYPE.main>
        </Flex>
        <Flex alignItems='center' justifyContent='flexEnd'>
          <TYPE.main area='name' color={theme.subText} fontSize='12px'>
            VALUE
          </TYPE.main>
        </Flex>
      </TableHeader>
      <Divider />
      <List p='0 20px'>{!lpList ? <LocalLoader /> : lpList}</List>
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

export default withRouter(LPList)
