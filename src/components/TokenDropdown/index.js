/**
 * @prettier
 */

import React from "react";
import PropTypes from "prop-types";
import Select from "react-select";

const TokenDropdown = ({options, onChange}) => (
  <Select
    placeholder="Select a token..."
    isSearchable={true}
    onChange={onChange}
    options={options} />
)

TokenDropdown.propTypes = {
  options: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired
}

export default TokenDropdown;
