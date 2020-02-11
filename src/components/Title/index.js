import React from "react"
import { useHistory } from "react-router-dom"
import styled from "styled-components"

import { Text, Flex } from "rebass"
import Logo from "../../assets/logo2.svg"

import { useTokenData } from "../../contexts/TokenData"
import { usePairData } from "../../contexts/PairData"

const TitleWrapper = styled.div`
  text-decoration: none;

  &:hover {
    cursor: pointer;
  }
`

const LogoWrapper = styled.img`
  height: 30px;
  width: 30px;
`

const Header = styled.span`
  font-size: 24px;
  font-weight: 900;
  color: ${({ theme, color }) => (theme[color] ? theme[color] : color)};
`

export default function Title({ token, pair, color }) {
  const history = useHistory()

  const { name, symbol } = useTokenData(token)
  const { token0, token1 } = usePairData(pair)
  const symbol0 = token0 && token0.symbol
  const symbol1 = token1 && token1.symbol

  function getName() {
    if (symbol0 && symbol1) {
      return (
        <div>
          <Header color={color}>Uniswap Info </Header> /{" "}
          <span style={{ fontWeight: 400 }}>{symbol0 + "-" + symbol1}</span>
        </div>
      )
    }
    if (name && symbol) {
      return (
        <div>
          <Header color={color}>Uniswap Info </Header> /{" "}
          <span style={{ fontWeight: 400 }}>{name + "(" + symbol + ")"}</span>
        </div>
      )
    } else {
      return <Header color={color}>Uniswap Info </Header>
    }
  }

  return (
    <TitleWrapper onClick={() => history.push("/")}>
      <Flex alignItems="center">
        <Text fontSize="1rem" lineHeight="1">
          <LogoWrapper src={Logo} alt="" />
        </Text>
        <Text fontWeight={600} mx="1rem" lineHeight="1.5rem">
          {getName()}
        </Text>
      </Flex>
    </TitleWrapper>
  )
}
