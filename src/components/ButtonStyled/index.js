import React from 'react'
import { Button as RebassButton } from 'rebass/styled-components'
import styled from 'styled-components'
import { Plus } from 'react-feather'

const Base = styled(RebassButton)`
  padding: 8px 12px;
  font-size: 16px;
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
  background-color: rgba(255, 255, 255, 0.8);
  width: fit-content;
  border-radius: 12px;
  color: black;

  :hover {
    background-color: rgba(255, 255, 255, 0.4);
  }
`

export const ButtonDark = styled(Base)`
  background-color: black;
  color: white;
  width: fit-content;
  border-radius: 12px;

  :hover {
    background-color: (0, 0, 0, 0.5);
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
  font-weight: 500;
  width: fit-content;
  white-space: nowrap;
  &:hover {
    cursor: pointer;
  }
  background-color: ${({ active }) => (active ? 'rgba(0, 0, 0, 0.06);' : 'rgba(0, 0, 0, 0.02);')};
  padding: 6px;
  border-radius: 6px;

  :hover {
    background-color: rgba(0, 0, 0, 0.06);
  }
`
