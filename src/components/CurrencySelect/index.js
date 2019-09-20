import React from 'react'
import PropTypes from 'prop-types'
import { default as ReactSelect } from 'react-select'

import customStyles from './styles'

const CurrencySelect = ({ options, onChange, placeholder, ...rest }) => (
  <ReactSelect
    placeholder={placeholder}
    isSearchable={true}
    onChange={onChange}
    options={options}
    styles={customStyles}
    {...rest}
  />
)

CurrencySelect.defaultProps = {
  placeholder: 'Find Exchanges'
}

CurrencySelect.propTypes = {
  options: PropTypes.array.isRequired,
  onChange: PropTypes.func
}

export default CurrencySelect
