import React, { useEffect } from 'react'
import styled from 'styled-components'
import PropTypes from 'prop-types'
import { default as ReactSelect } from 'react-select'
import { components } from 'react-select'
import TokenLogo from '../TokenLogo'

import Popout from './popout'

import customStyles from './styles'

const MenuLabel = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  justify-content: space-between;
  flex-direction: row;
`

const LogoBox = styled.div`
  width: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
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
      filterOption={customFilter}
      getOptionLabel={option => (
        <MenuLabel>
          {option.label}
          <LogoBox>
            <TokenLogo address={option.tokenAddress} style={{ height: '20px', width: '20px' }} />
          </LogoBox>
        </MenuLabel>
      )}
      styles={customStyles}
      {...rest}
    />
  ) : (
    <ReactSelect
      placeholder={placeholder}
      isSearchable={true}
      onChange={onChange}
      options={options}
      styles={customStyles}
      {...rest}
    />
  )
}

Select.defaultProps = {
  placeholder: 'Find Exchanges'
}

Select.propTypes = {
  options: PropTypes.array.isRequired,
  onChange: PropTypes.func
}

export default Select

export { Popout }
