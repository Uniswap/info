import React from "react";
import PropTypes from "prop-types";
import { default as ReactSelect } from "react-select";

import Popout from "./popout";

import customStyles from "./styles";

const Select = ({ options, onChange, placeholder, ...rest }) => (
  <ReactSelect
    placeholder={placeholder}
    isSearchable={true}
    onChange={onChange}
    options={options}
    styles={customStyles}
    {...rest}
  />
);

Select.defaultProps = {
  placeholder: "Find Exchanges"
};

Select.propTypes = {
  options: PropTypes.array.isRequired,
  onChange: PropTypes.func
};

export default Select;

export { Popout };
