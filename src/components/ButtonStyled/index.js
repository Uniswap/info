import React from 'react'
import { Button as RebassButton } from 'rebass/styled-components'
import styled from 'styled-components'
import { Plus } from 'react-feather'
import { darken, transparentize } from 'polished'

const Base = styled(RebassButton)`
  padding: 8px 12px;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 12px;
  cursor: pointer;
  outline: none;
  border: 1px solid transparent;
  outline: none;
`

const BaseCustom = styled(RebassButton)`
  padding: 16px 12px;
  font-size: 1rem;
  font-weight: 400;
  border-radius: 12px;
  cursor: pointer;
  outline: none;
`

const Dull = styled(Base)`
  background-color: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: black;
  height: 100%;
  font-weight: 400;
  &:hover,
  :focus {
    background-color: rgba(255, 255, 255, 0.25);
    border-color: rgba(255, 255, 255, 0.25);
  }
  &:focus {
    box-shadow: 0 0 0 1pt rgba(255, 255, 255, 0.25);
  }
  &:active {
    background-color: rgba(255, 255, 255, 0.25);
    border-color: rgba(255, 255, 255, 0.25);
  }
`

export default function ButtonStyled({ children, ...rest }) {
  return <Base {...rest}>{children}</Base>
}

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`

export const ButtonLight = styled(Base)`
  background-color: ${({ color, theme }) => (color ? transparentize(0.9, color) : transparentize(0.9, theme.primary1))};
  color: ${({ color, theme }) => (color ? darken(0.1, color) : theme.primary1)};

  width: fit-content;
  border-radius: 12px;

  a {
    color: ${({ color, theme }) => (color ? darken(0.1, color) : theme.primary1)};
  }

  :hover {
    background-color: ${({ color, theme }) =>
      color ? transparentize(0.8, color) : transparentize(0.8, theme.primary1)};
  }
`

export const ButtonDark = styled(Base)`
  background-color: ${({ color, theme }) => (color ? color : theme.primary1)};
  color: white;
  width: fit-content;
  border-radius: 12px;

  :hover {
    background-color: ${({ color, theme }) => (color ? darken(0.1, color) : darken(0.1, theme.primary1))};
  }
`

export const ButtonFaded = styled(Base)`
  background-color: rgba(0, 0, 0, 0.02);
  color: (255, 255, 255, 0.5);
`

export function ButtonPlusDull({ disabled, children, ...rest }) {
  return (
    <Dull {...rest}>
      <ContentWrapper>
        <Plus size={16} />
        <div style={{ display: 'flex', alignItems: 'center' }}>{children}</div>
      </ContentWrapper>
    </Dull>
  )
}

export function ButtonCustom({ children, bgColor, color, ...rest }) {
  return (
    <BaseCustom bg={bgColor} color={color} {...rest}>
      {children}
    </BaseCustom>
  )
}

export const OptionButton = styled.div`
  font-weight: ${({ active }) => (active ? 600 : 500)};
  width: fit-content;
  white-space: nowrap;
  padding: 6px;
  border-radius: 6px;

  :hover {
    cursor: ${({ disabled }) => !disabled && 'pointer'};
    background-color: ${({ disabled }) => !disabled && 'rgba(0, 0, 0, 0.06)'};
  }
`
