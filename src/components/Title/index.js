import React from 'react'
import { useHistory } from 'react-router-dom'
import styled from 'styled-components'

import { Text, Flex } from 'rebass'
import { useTokenData } from '../../contexts/TokenData'
import { usePairData } from '../../contexts/PairData'
import Link from '../Link'
import Row, { RowFixed } from '../Row'
import Unicorn from '../../assets/unicorn.svg'
import Wordmark from '../../assets/wordmark.svg'

const TitleWrapper = styled.div`
  text-decoration: none;

  &:hover {
    cursor: pointer;
  }
`

const UniIcon = styled(Link)`
  transition: transform 0.3s ease;
  :hover {
    transform: rotate(-5deg);
  }
`

const TitleText = styled(Row)`
  width: fit-content;
  white-space: nowrap;
`

const Alpha = styled.div`
  width: fit-content;
  margin-left: 10px;
  border-radius: 12px;
  padding: 3px 7px;
  background-color: ${({ theme }) => theme.blue1};
  color: ${({ theme }) => theme.white};
  font-size: 12px;
  font-weight: 600;
  color: white;
`

export default function Title({ token, pair }) {
  const history = useHistory()

  const { name, symbol } = useTokenData(token)
  const { token0, token1 } = usePairData(pair)
  const symbol0 = token0 && token0.symbol
  const symbol1 = token1 && token1.symbol

  function getName() {
    if (symbol0 && symbol1) {
      return (
        <div>
          / <span style={{ fontWeight: 400 }}>{symbol0 + '-' + symbol1}</span>
        </div>
      )
    }
    if (name && symbol) {
      return (
        <div>
          / <span style={{ fontWeight: 400 }}>{name + '(' + symbol + ')'}</span>
        </div>
      )
    } else {
      return ''
    }
  }

  return (
    <TitleWrapper onClick={() => history.push('/')}>
      <Flex alignItems="center">
        <RowFixed>
          <UniIcon id="link" onClick={() => history.push('/')}>
            <img src={Unicorn} alt="logo" />
          </UniIcon>
          <TitleText>
            <img style={{ marginLeft: '4px', marginTop: '4px' }} src={Wordmark} alt="logo" />
            <Alpha>V2</Alpha>
          </TitleText>
        </RowFixed>
        <Text fontWeight={600} mx="1rem" lineHeight="1.5rem">
          {getName()}
        </Text>
      </Flex>
    </TitleWrapper>
  )
}
