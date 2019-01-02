/**
 * @prettier
 */

import React from "react";
import PropTypes from "prop-types";
import Select from "react-select";

const customStyles = {
  control: (styles, state) => ({
    ...styles,
    borderRadius: 38,
    borderColor: "#e1e1e1",
    backgroundColor: state.isFocused ? "rgba(235, 244, 255, 0.8)" : "#fafafa",
    color: "#000",
    boxShadow: "none",
    ":hover": {
      borderColor: "#e1e1e1"
    }
  }),
  indicatorSeparator: styles => ({
    ...styles,
    display: "none"
  })
};

const TokenDropdown = ({ options, onChange, defaultValue }) => (
  <Select
    placeholder="Select a token..."
    isSearchable={true}
    onChange={onChange}
    defaultValue={defaultValue}
    options={options}
    styles={customStyles}
  />
);

TokenDropdown.propTypes = {
  options: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired
};

export default TokenDropdown;
