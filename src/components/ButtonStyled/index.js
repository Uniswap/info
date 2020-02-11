import React from "react"
import { Button as RebassButton } from "rebass"
import styled from "styled-components"
import { ChevronDown } from "react-feather"
import { Plus } from "react-feather"

const Base = styled(RebassButton)`
  padding: 8px 12px;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 8px;
  color: white;
  cursor: pointer;
  outline: none;
  border: 1px solid;
`

const BaseCustom = styled(RebassButton)`
  padding: 8px 12px;
  font-size: 1rem;
  font-weight: 400;
  border-radius: 8px;
  cursor: pointer;
  outline: none;
  border: 1px solid;
`

const Secondary = styled(Base)`
  background-color: transparent;

  &:disabled {
    opacity: 0.5,
    background-color: transparent,
    cursor: 'auto'
  }
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

export function ButtonStyledSecondary({ children, ...rest }) {
  return <Secondary {...rest}>{children}</Secondary>
}

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`

export function ButtonDropwdown({ disabled, children, ...rest }) {
  return (
    <Base {...rest}>
      <ContentWrapper>
        <div style={{ display: "flex", alignItems: "center" }}>{children}</div>
        <ChevronDown size={24} />
      </ContentWrapper>
    </Base>
  )
}

export function ButtonDropwdownSecondary({ disabled, children, ...rest }) {
  return (
    <Secondary {...rest}>
      <ContentWrapper>
        <div style={{ display: "flex", alignItems: "center" }}>{children}</div>
        <ChevronDown size={24} />
      </ContentWrapper>
    </Secondary>
  )
}

export function ButtonPlusSecondary({ disabled, children, ...rest }) {
  return (
    <Secondary {...rest}>
      <ContentWrapper>
        <Plus size={20} />
        <div style={{ display: "flex", alignItems: "center" }}>{children}</div>
      </ContentWrapper>
    </Secondary>
  )
}

export function ButtonPlusDull({ disabled, children, ...rest }) {
  return (
    <Dull {...rest}>
      <ContentWrapper>
        <Plus size={16} />
        <div style={{ display: "flex", alignItems: "center" }}>{children}</div>
      </ContentWrapper>
    </Dull>
  )
}

export function ButtonCustom({ children, bgColor, color, ...rest }) {
  return (
    <BaseCustom {...rest} bgColor={bgColor} color={color}>
      {children}
    </BaseCustom>
  )
}
