import React from "react";
import PropTypes from "prop-types";
import { default as ReactSelect } from "react-select";

import customStyles from "./styles";

const Select = ({ options, onChange, defaultValue, placeholder }) => (
  <ReactSelect
    placeholder={placeholder}
    isSearchable={true}
    onChange={onChange}
    defaultValue={defaultValue}
    options={options}
    styles={customStyles}
  />
);

Select.defaultProps = {
  placeholder: "Find Exchanges"
};

Select.propTypes = {
  options: PropTypes.array.isRequired,
  onChange: PropTypes.func,
  defaultValue: PropTypes.string
};

export default Select;
