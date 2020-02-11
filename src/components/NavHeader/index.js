import React from "react"

import styled from "styled-components"
import { darken, transparentize } from "polished"
import Toggle from "react-switch"

import { useDarkModeManager } from "../../contexts/LocalStorage"
import { useColor } from "../../contexts/Application"

import Title from "../Title"
import Panel from "../Panel"
import Search from "../Search"
import CurrencySelect from "../CurrencySelect"

const Header = styled(Panel)`
  display: grid;
  width: 100%;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  padding: 32px 0;

  @media screen and (min-width: 64em) {
    max-width: 1240px;
  }
`

const NavLeft = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`

const NavRight = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  column-gap: 20px;
  align-items: center;
  justify-items: end;
`

const StyledToggle = styled(Toggle)`
  margin-right: 24px;
  .react-switch-bg[style] {
    background-color: ${({ theme }) =>
      darken(0.05, theme.inputBackground)} !important;
    border: 1px solid ${({ theme }) => theme.concreteGray} !important;
  }
  .react-switch-handle[style] {
    background-color: ${({ theme }) => theme.inputBackground};
    box-shadow: 0 4px 8px 0
      ${({ theme }) => transparentize(0.93, theme.shadowColor)};
    border: 1px solid ${({ theme }) => theme.mercuryGray};
    border-color: ${({ theme }) => theme.mercuryGray} !important;
    top: 2px !important;
  }
`

const EmojiToggle = styled.span`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  font-family: Arial sans-serif;
`

export default function NavHeader({ token, pair }) {
  const isHome = !token && !pair
  const [isDark, toggleDarkMode] = useDarkModeManager()
  const [color] = useColor()

  return (
    <Header>
      <NavLeft>
        <Title token={token} pair={pair} color={color} />
      </NavLeft>
      <NavRight>
        <StyledToggle
          checked={!isDark}
          uncheckedIcon={
            <EmojiToggle role="img" aria-label="moon">
              {/* eslint-disable-line jsx-a11y/accessible-emoji */}
              🌙️
            </EmojiToggle>
          }
          checkedIcon={
            <EmojiToggle role="img" aria-label="sun">
              {/* eslint-disable-line jsx-a11y/accessible-emoji */}
              {"☀️"}
            </EmojiToggle>
          }
          onChange={() => {
            toggleDarkMode()
          }}
        />
        <CurrencySelect />
        {!isHome && <Search />}
      </NavRight>
    </Header>
  )
}
