import { useState, useEffect } from 'react'
import { useMedia } from 'react-use'
import dayjs from 'dayjs'
import LocalLoader from '../LocalLoader'
import utc from 'dayjs/plugin/utc'
import { Box, Flex, Text } from 'rebass'
import styled from 'styled-components/macro'

import { CustomLink } from '../Link'
import { Divider } from '..'
import { withRouter } from 'react-router-dom'
import { formattedNum } from '../../utils'
import { TYPE } from '../../Theme'
import DoubleTokenLogo from '../DoubleLogo'
import { RowFixed } from '../Row'
import Panel from '../Panel'
import { transparentize } from 'polished'
import { useTranslation } from 'react-i18next'

dayjs.extend(utc)

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

const CustomText = styled(Text)`
  color: ${({ theme }) => transparentize(0.3, theme.text6)};
  user-select: none;
  text-align: end;
  font-size: 14px;
  font-weight: 500;

  @media screen and (max-width: 440px) {
    font-size: 10px;
  }
`

const DashGrid = styled.div`
  display: grid;
  grid-gap: 1em;
  grid-template-columns: 10px 1.5fr 1fr 1fr;
  grid-template-areas: 'number name pair value';
  padding: 1rem 2rem;
  border-top: 1px solid ${({ theme }) => theme.bg7};

  > * {
    justify-content: flex-end;
  }

  @media screen and (max-width: 1080px) {
    grid-template-columns: 10px 1.5fr 1fr 1fr;
    grid-template-areas: 'number name pair value';
  }

  @media screen and (max-width: 600px) {
    grid-template-columns: 1fr 1fr 1fr;
    grid-template-areas: 'name pair value';
  }

  @media screen and (max-width: 440px) {
    padding: 0.75rem;
  }
`

const ListWrapper = styled.div``

const DataText = styled(Flex)`
  align-items: center;
  text-align: center;
  color: ${({ theme }) => transparentize(0.5, theme.text6)};

  & > * {
    font-size: 14px;
  }

  @media screen and (max-width: 440px) {
    font-size: 10px;
  }
`

function LPList({ lps, disbaleLinks, maxItems = 10 }) {
  const { t } = useTranslation()
  const below440 = useMedia('(max-width: 440px)')
  const below600 = useMedia('(max-width: 600px)')
  const below800 = useMedia('(max-width: 800px)')

  // pagination
  const [page, setPage] = useState(1)
  const [maxPage, setMaxPage] = useState(1)
  const ITEMS_PER_PAGE = maxItems

  useEffect(() => {
    setMaxPage(1) // edit this to do modular
    setPage(1)
  }, [lps])

  useEffect(() => {
    if (lps) {
      let extraPages = 1
      if (Object.keys(lps).length % ITEMS_PER_PAGE === 0) {
        extraPages = 0
      }
      setMaxPage(Math.floor(Object.keys(lps).length / ITEMS_PER_PAGE) + extraPages)
    }
  }, [ITEMS_PER_PAGE, lps])

  const ListItem = ({ lp, index }) => {
    return (
      <DashGrid disbaleLinks={disbaleLinks} focus={true}>
        {!below600 && (
          <DataText area="number" fontWeight="500">
            {index}
          </DataText>
        )}
        <DataText area="name" fontWeight="500" justifyContent="flex-start">
          <CustomLink style={{ whiteSpace: 'nowrap' }} to={'/account/' + lp.user.id}>
            {below800
              ? lp.user.id.slice(0, 4) + '...' + (below440 ? lp.user.id.slice(39, 42) : lp.user.id.slice(38, 42))
              : lp.user.id}
          </CustomLink>
        </DataText>

        {/* {!below1080 && (
          <DataText area="type" justifyContent="flex-end">
            {lp.type}
          </DataText>
        )} */}

        <DataText>
          <CustomLink area="pair" to={'/pair/' + lp.pairAddress}>
            <RowFixed style={{ textAlign: 'right' }}>
              {!below600 && <DoubleTokenLogo a0={lp.token0} a1={lp.token1} size={16} margin={true} />}
              {lp.pairName}
            </RowFixed>
          </CustomLink>
        </DataText>
        <DataText area="value">{formattedNum(lp.usd, true)}</DataText>
      </DashGrid>
    )
  }

  const lpList =
    lps &&
    lps.slice(ITEMS_PER_PAGE * (page - 1), page * ITEMS_PER_PAGE).map((lp, index) => {
      return (
        <div key={index}>
          <ListItem key={index} index={(page - 1) * 10 + index + 1} lp={lp} />
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
          disbaleLinks={disbaleLinks}
          style={{ height: 'fit-content', padding: below440 ? '.75rem' : '1rem 2rem', borderTop: 'none' }}
        >
          {!below600 && (
            <Flex alignItems="center" justifyContent="flex-start">
              <CustomText area="number">#</CustomText>
            </Flex>
          )}
          <Flex alignItems="center" justifyContent="flex-start">
            <CustomText area="name">{t('account')}</CustomText>
          </Flex>
          {/* {!below1080 && (
            <Flex alignItems="center" justifyContent="flexEnd">
              <TYPE.main area="type">Type</TYPE.main>
            </Flex>
          )} */}
          <Flex alignItems="center" justifyContent="flexEnd">
            <CustomText area="pair">{t('pair')}</CustomText>
          </Flex>
          <Flex alignItems="center" justifyContent="flexEnd">
            <CustomText area="value">{t('value')}</CustomText>
          </Flex>
        </DashGrid>
        <Divider />
        <List p={0}>{!lpList ? <LocalLoader /> : lpList}</List>
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

export default withRouter(LPList)
