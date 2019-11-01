import React from 'react'
import styled from 'styled-components'
import PropTypes from 'prop-types'
import { default as ReactSelect } from 'react-select'
import { isMobile } from 'react-device-detect'

import Popout from './popout'

import { customStyles, customStylesMobile, customStylesTime } from './styles'

const MenuLabel = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  justify-content: space-between;
  flex-direction: row;
`

const LabelBox = styled.div`
  margin-right: 8px;
`

const LogoBox = styled.div`
  width: 30px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
`

function customFilter(option, searchText) {
  if (
    option.data.label
      .toString()
      .toLowerCase()
      .includes(searchText.toString().toLowerCase()) ||
    option.data.value
      .toString()
      .toLowerCase()
      .includes(searchText.toString().toLowerCase())
  ) {
    return true
  } else {
    return false
  }
}

const Select = ({ options, onChange, tokenSelect = false, placeholder, ...rest }) => {
  return tokenSelect ? (
    <ReactSelect
      placeholder={placeholder}
      isSearchable={true}
      onChange={onChange}
      options={options}
      value={placeholder}
      filterOption={customFilter}
      getOptionLabel={option => (
        <MenuLabel>
          <LogoBox>{option.logo}</LogoBox>
          <LabelBox>{option.label}</LabelBox>
        </MenuLabel>
      )}
      styles={isMobile ? customStylesMobile : customStyles}
      {...rest}
      components={{
        DropdownIndicator: () => (
          <span role="img" aria-label={'viewer'} style={{ marginRight: '8px' }}>
            🔎
          </span>
        )
      }}
    />
  ) : (
    <ReactSelect
      placeholder={placeholder}
      isSearchable={true}
      onChange={onChange}
      options={options}
      styles={customStylesTime}
      {...rest}
    />
  )
}

Select.propTypes = {
  options: PropTypes.array.isRequired,
  onChange: PropTypes.func
}

export default Select

export { Popout }
