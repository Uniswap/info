import React from 'react'
import styled from 'styled-components'
import { Sun, Moon } from 'react-feather'

const ToggleElement = styled.span<{ isActive?: boolean; isOnSwitch?: boolean }>``

const StyledSun = styled(Sun)<{ isActive?: boolean; activeElement?: boolean }>`
  opacity: ${({ theme, isActive }) => (isActive ? 0.8 : 0.4)};

  :hover {
    opacity: 1;
  }
`

const StyledMoon = styled(Moon)<{ isActive?: boolean; activeElement?: boolean }>`
  opacity: ${({ theme, isActive }) => (isActive ? 0.8 : 0.4)};

  :hover {
    opacity: 1;
  }
`

const StyledToggle = styled.a<{ isActive?: boolean; activeElement?: boolean }>`
  display: flex;
  width: fit-content;
  cursor: pointer;
  text-decoration: none;
  margin-top: 1rem;
  color: white;

  :hover {
    text-decoration: none;
  }
`

export interface ToggleProps {
  isActive: boolean
  toggle: () => void
}

export default function Toggle({ isActive, toggle }: ToggleProps) {
  return (
    <StyledToggle isActive={isActive} target="_self" onClick={toggle}>
      <ToggleElement isActive={!isActive} isOnSwitch={false}>
        <StyledSun isActive={!isActive} size={20} />
      </ToggleElement>
      <span style={{ padding: '0 .5rem' }}>{' / '}</span>
      <ToggleElement isOnSwitch={false}>
        <StyledMoon isActive={isActive} size={20} />
      </ToggleElement>
    </StyledToggle>
  )
}
