import React, { useState } from 'react'
import styled from 'styled-components'

import Row from '../Row'
import { AutoColumn } from '../Column'
import { ChevronDown as Arrow } from 'react-feather'

const Wrapper = styled.div`
  z-index: 20;
  position: relative;
  background-color: rgb(183, 177, 183, 0.3);
  width: 100px;
  padding: 10px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;

  :hover {
    cursor: pointer;
  }

  border-bottom-right-radius: ${({ open }) => open && '0px'};
  border-bottom-left-radius: ${({ open }) => open && '0px'};
`

const Dropdown = styled.div`
  position: absolute;
  top: 40px;
  padding-top: 60px;
  width: calc(100% - 40px);
  background-color: rgb(183, 177, 183, 0.3);
  padding: 20px;
  border-radius: 16px;
  border-top-right-radius: 0;
  border-top-left-radius: 0;
  font-weight: 500;
  font-size: 1rem;
  color: black;
  :hover {
    cursor: pointer;
  }
`

const ArrowStyled = styled(Arrow)`
  height: 20px;
  width: 20px;
  margin-left: 6px;
`

const Option = styled(Row)`
  :hover {
    background-color: ;
  }
`

const DropdownSelect = ({ options, active, setActive }) => {
  const [showDropdown, toggleDropdown] = useState(false)

  return (
    <Wrapper open={showDropdown}>
      <Row onClick={() => toggleDropdown(!showDropdown)} justify="center">
        {active} <ArrowStyled />
      </Row>
      {showDropdown && (
        <Dropdown>
          <AutoColumn gap="20px">
            {Object.keys(options).map((key, index) => {
              let option = options[key]
              return (
                option !== active && (
                  <Option
                    onClick={() => {
                      toggleDropdown(!showDropdown)
                      setActive(option)
                    }}
                    key={index}
                  >
                    {option}
                  </Option>
                )
              )
            })}
          </AutoColumn>
        </Dropdown>
      )}
    </Wrapper>
  )
}

export default DropdownSelect
