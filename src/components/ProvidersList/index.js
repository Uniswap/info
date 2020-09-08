import React from 'react'
import styled from 'styled-components'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'

import { Flex, Text } from 'rebass'
import Link from '../Link'
import { Divider } from '..'

dayjs.extend(utc)

const DashGrid = styled.div`
  display: grid;
  grid-gap: 1em;
  grid-template-columns: 100px 1fr 1fr;
  grid-template-areas: 'txn value time';

  > * {
    justify-content: flex-end;
    width: 100%;

    &:first-child {
      justify-content: flex-start;
      text-align: left;
      width: 100px;
    }
  }

  @media screen and (min-width: 500px) {
    > * {
      &:first-child {
        width: 180px;
      }
    }
  }

  @media screen and (min-width: 780px) {
    max-width: 1320px;
    grid-template-columns: 3fr 1fr;
    grid-template-areas: 'txn value amountToken amountOther time';

    > * {
      &:first-child {
        width: 180px;
      }
    }
  }

  @media screen and (min-width: 1080px) {
    max-width: 1320px;
    grid-template-columns: 3fr 1fr;
    grid-template-areas: 'txn value amountToken amountOther account time';
  }
`

const ClickableText = styled(Text)`
  color: ${({ theme }) => theme.text1};
  user-select: none;
  text-align: end;

  &:hover {
    cursor: pointer;
    opacity: 0.6;
  }

  @media screen and (max-width: 640px) {
    font-size: 14px;
  }
`

const DataText = styled(Flex)`
  align-items: center;
  text-align: right;
  color: ${({ theme }) => theme.text1};

  & > * {
    font-size: 1em;
  }

  @media screen and (max-width: 40em) {
    font-size: 0.85rem;
  }
`

function ProviderList({ providers }) {
  const ListItem = ({ item }) => {
    return (
      <DashGrid style={{ height: '48px' }}>
        <DataText area="txn" fontWeight="500">
          <Link external>{`${item.name}`}</Link>
        </DataText>
        <DataText area="txn" fontWeight="500">
          <Link external>{`${item.value}`}</Link>
        </DataText>
      </DashGrid>
    )
  }

  return (
    <>
      <DashGrid center={true} style={{ height: 'fit-content', padding: '0 0 1rem 0' }}>
        <Flex alignItems="center" justifyContent="flexStart">
          <ClickableText color="textDim" area="value">
            Address
          </ClickableText>
        </Flex>
        <Flex alignItems="center" justifyContent="flexStart">
          <ClickableText color="textDim" area="value">
            Balance
          </ClickableText>
        </Flex>
      </DashGrid>

      {providers.map((item, index) => {
        return (
          <div key={index}>
            <ListItem key={index} index={index + 1} item={item} />
            <Divider />
          </div>
        )
      })}
    </>
  )
}

export default ProviderList
