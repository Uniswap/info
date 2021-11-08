import React from 'react'
import styled from 'styled-components'
import { Flex } from 'rebass'

import { AutoColumn } from '../Column'
import { ButtonEmpty } from '../ButtonStyled'
import WarningLeftIcon from '../Icons/WarningLeftIcon'
import AddCircle from '../Icons/AddCircle'
import Link, { CustomLink } from '../Link'
import { MouseoverTooltip } from '../Tooltip'
import CopyHelper from '../Copy'
import { TYPE } from '../../Theme'
import { shortenAddress, formattedNum } from '../../utils'
import { MAX_ALLOW_APY } from '../../constants'

const TableRow = styled.div`
  display: grid;
  grid-gap: 1em;
  grid-template-columns: repeat(8, 1fr);
  grid-template-areas: 'pool ratio liq vol fee amp fl add_liquidity';
  padding: 15px 36px 13px 26px;
  font-size: 12px;
  align-items: flex-start;
  height: fit-content;
  position: relative;
  opacity: ${({ fade }) => (fade ? '0.6' : '1')};
  background-color: ${({ theme, oddRow }) => (oddRow ? theme.oddRow : theme.evenRow)};
  border: 1px solid transparent;

  &:hover {
    border: 1px solid #4a636f;
  }
`

const StyledItemCard = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-column-gap: 4px;
  border-radius: 10px;
  margin-bottom: 0;
  padding: 8px 20px 4px 20px;
  background-color: ${({ theme }) => theme.bg7};
  font-size: 12px;

  @media screen and (max-width: 960px) {
    margin-bottom: 20px;
  }
`

const GridItem = styled.div`
  margin-top: 8px;
  margin-bottom: 8px;
  border-bottom: ${({ theme, noBorder }) => (noBorder ? 'none' : `1px dashed ${theme.border}`)};
  padding-bottom: 12px;
`

const DataTitle = styled.div`
  display: flex;
  align-items: center;
  color: ${({ theme }) => theme.text6};
  &:hover {
    opacity: 0.6;
  }
  user-select: none;
  text-transform: uppercase;
  margin-bottom: 4px;
`

const DataText = styled(Flex)`
  color: ${({ theme }) => theme.text7};
  flex-direction: column;
`

const PoolAddressContainer = styled(Flex)`
  align-items: center;
`

const formatDataText = (value, trackedValue, supressWarning = false) => {
  const showUntracked = value !== '$0' && !trackedValue & !supressWarning
  return (
    <AutoColumn gap="2px" style={{ opacity: showUntracked ? '0.7' : '1' }}>
      <div style={{ textAlign: 'left' }}>{value}</div>
      <TYPE.light fontSize={'9px'} style={{ textAlign: 'right' }}>
        {showUntracked ? 'unstable' : '  '}
      </TYPE.light>
    </AutoColumn>
  )
}

const getOneYearFL = (liquidity, feeOneDay) => {
  return !feeOneDay || parseFloat(liquidity) === 0 ? 0 : (parseFloat(feeOneDay) * 365 * 100) / parseFloat(liquidity)
}

export const ItemCard = ({ pool }) => {
  const amp = pool.amp / 10000

  const percentToken0 =
    ((pool.reserve0 / pool.vReserve0) * 100) / (pool.reserve0 / pool.vReserve0 + pool.reserve1 / pool.vReserve1)
  const percentToken1 = 100 - percentToken0

  const isWarning = parseFloat(percentToken0) < 10 || parseFloat(percentToken1) < 10

  // Shorten address with 0x + 3 characters at start and end
  const shortenPoolAddress = shortenAddress(pool.id, 3)

  const liquidity = pool.reserveUSD ? pool.reserveUSD : pool.trackedReserveUSD

  const oneDayFee = pool.oneDayFeeUSD ? pool.oneDayFeeUSD : pool.oneDayFeeUntracked

  const volume = pool.oneDayVolumeUSD ? pool.oneDayVolumeUSD : pool.oneDayVolumeUntracked

  const oneYearFL = getOneYearFL(liquidity, oneDayFee).toFixed(2)

  return (
    <div>
      {isWarning && (
        <div style={{ position: 'absolute' }}>
          <MouseoverTooltip text="One token is close to 0% in the pool ratio. Pool might go inactive.">
            <WarningLeftIcon />
          </MouseoverTooltip>
        </div>
      )}

      <StyledItemCard>
        <GridItem style={{ gridColumn: '1 / span 2' }}>
          <DataTitle>Pool</DataTitle>
          <DataText grid-area="pool">
            <PoolAddressContainer>
              {shortenPoolAddress}
              <CopyHelper toCopy={pool.id} />
            </PoolAddressContainer>
          </DataText>
        </GridItem>

        <GridItem>
          <DataText style={{ alignItems: 'flex-end' }}>
            <Link
              href={`${process.env.REACT_APP_DMM_SWAP_URL}add/${pool.token0.id}/${pool.token1.id}/${pool.id}`}
              target="_blank"
            >
              <ButtonEmpty padding="0" width="fit-content" style={{ padding: 0 }}>
                <AddCircle />
              </ButtonEmpty>
            </Link>
          </DataText>
        </GridItem>

        <GridItem>
          <DataTitle>Liquidity</DataTitle>
          <DataText grid-area="liq">{formatDataText(formattedNum(liquidity, true), pool.trackedReserveUSD)}</DataText>
        </GridItem>
        <GridItem>
          <DataTitle>Volume (24h)</DataTitle>
          <DataText grid-area="vol">{formatDataText(formattedNum(volume, true), pool.oneDayVolumeUSD)}</DataText>
        </GridItem>
        <GridItem>
          <DataTitle>Ratio</DataTitle>
          <DataText grid-area="ratio">
            <div>{`• ${percentToken0.toFixed(2) ?? '.'}% ${pool.token0.symbol}`}</div>
            <div>{`• ${percentToken1.toFixed(2) ?? '.'}% ${pool.token1.symbol}`}</div>
          </DataText>
        </GridItem>

        <GridItem noBorder>
          <DataTitle>Fee (24h)</DataTitle>
          <DataText>{formatDataText(formattedNum(oneDayFee, true), pool.oneDayFeeUSD)}</DataText>
        </GridItem>
        <GridItem noBorder>
          <DataTitle>AMP</DataTitle>
          <DataText>{formattedNum(amp.toPrecision(5))}</DataText>
        </GridItem>
        <GridItem noBorder>
          <DataTitle>APY</DataTitle>
          <DataText>{oneYearFL < MAX_ALLOW_APY ? `${oneYearFL}%` : '--'} </DataText>
        </GridItem>
      </StyledItemCard>
    </div>
  )
}

const ListItem = ({ pool, oddRow }) => {
  const amp = pool.amp / 10000

  const percentToken0 =
    ((pool.reserve0 / pool.vReserve0) * 100) / (pool.reserve0 / pool.vReserve0 + pool.reserve1 / pool.vReserve1)
  const percentToken1 = 100 - percentToken0

  const isWarning = parseFloat(percentToken0) < 10 || parseFloat(percentToken1) < 10

  // Shorten address with 0x + 3 characters at start and end
  const shortenPoolAddress = shortenAddress(pool.id, 3)

  const liquidity = pool.reserveUSD ? pool.reserveUSD : pool.trackedReserveUSD

  const oneDayFee = pool.oneDayFeeUSD ? pool.oneDayFeeUSD : pool.oneDayFeeUntracked

  const volume = pool.oneDayVolumeUSD ? pool.oneDayVolumeUSD : pool.oneDayVolumeUntracked

  const oneYearFL = getOneYearFL(liquidity, oneDayFee).toFixed(2)

  return (
    <TableRow oddRow={oddRow}>
      {isWarning && (
        <div style={{ position: 'absolute' }}>
          <MouseoverTooltip text="One token is close to 0% in the pool ratio. Pool might go inactive.">
            <WarningLeftIcon />
          </MouseoverTooltip>
        </div>
      )}
      <CustomLink to={`/pool/${pool.id}`} style={{ cursor: 'pointer' }}>
        <DataText grid-area="pool">{shortenPoolAddress}</DataText>
      </CustomLink>
      <DataText grid-area="ratio">
        <div>{`• ${percentToken0.toFixed(2) ?? '.'}% ${pool.token0.symbol}`}</div>
        <div>{`• ${percentToken1.toFixed(2) ?? '.'}% ${pool.token1.symbol}`}</div>
      </DataText>
      <DataText grid-area="liq">{formatDataText(formattedNum(liquidity, true), pool.trackedReserveUSD)}</DataText>
      <DataText grid-area="vol">{formatDataText(formattedNum(volume, true), pool.oneDayVolumeUSD)}</DataText>
      <DataText grid-area="fee">{formatDataText(formattedNum(oneDayFee, true), pool.oneDayFeeUSD)}</DataText>
      <DataText grid-area="amp">{formattedNum(amp.toPrecision(5))}</DataText>
      <DataText grid-area="fl">{oneYearFL < MAX_ALLOW_APY ? `${oneYearFL}%` : '--'}</DataText>
      <DataText grid-area="add_liquidity" style={{ alignItems: 'flex-start' }}>
        {
          <Link
            href={`${process.env.REACT_APP_DMM_SWAP_URL}add/${pool.token0.id}/${pool.token1.id}/${pool.id}?networkId=${process.env.REACT_APP_CHAIN_ID}`}
            target="_blank"
          >
            <ButtonEmpty padding="0" width="fit-content" style={{ padding: 0 }}>
              <AddCircle />
            </ButtonEmpty>
          </Link>
        }
      </DataText>
    </TableRow>
  )
}

export default ListItem
