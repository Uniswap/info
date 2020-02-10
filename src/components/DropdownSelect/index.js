import React, { useState } from "react"
import styled from "styled-components"

import Row from "../Row"
import Column from "../Column"
import { ChevronDown as Arrow } from "react-feather"

import { isEquivalent } from "../../helpers"

const Select = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  width: fit-content;
  height: 38px;
  border-radius: 20px;
  font-weight: 500;
  font-size: 16px;
  color: black;

  :hover {
    cursor: pointer;
  }

  @media screen and (max-width: 40em) {
    display: none;
  }
`

const ArrowStyled = styled(Arrow)`
  height: 20px;
  width: 20px;
  margin-left: 6px;
`

const ColumnWrapper = styled(Column)`
  positio: absolute;
  margin-top: 30px;
`

const Option = styled(Row)``

const Wrapper = styled.div`
  z-index: 20;
`

const DropdownSelect = ({ options, active, setActive }) => {
  const [showDropdown, toggleDropdown] = useState(false)

  return (
    <Wrapper>
      <Select>
        <Row onClick={() => toggleDropdown(!showDropdown)}>
          {active.text} <ArrowStyled />
        </Row>
        <ColumnWrapper>
          {showDropdown &&
            options.map((option, index) => {
              return (
                !isEquivalent(option, active) && (
                  <Option
                    onClick={() => {
                      toggleDropdown(!showDropdown)
                      setActive(option)
                    }}
                    key={index}
                  >
                    {option.text}
                  </Option>
                )
              )
            })}
        </ColumnWrapper>
      </Select>
    </Wrapper>
  )
}

export default DropdownSelect
