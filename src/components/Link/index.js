import React from "react";
import { Link as RebassLink } from "rebass";
import PropTypes from "prop-types";

const Link = ({ external, children, ...rest }) => (
  <RebassLink
    target={external ? "_blank" : null}
    rel={external ? "noopener noreferrer" : null}
    {...rest}
  >
    {children}
  </RebassLink>
);

Link.propTypes = {
  external: PropTypes.bool
};

export default Link;
