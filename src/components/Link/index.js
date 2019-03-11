import React from "react";
import { Link as RebassLink } from "rebass";
import PropTypes from "prop-types";

const Link = props => (
  <RebassLink
    target={props.external ? "_blank" : null}
    rel={props.external ? "noopener noreferrer" : null}
    {...props}
  >
    {props.children}
  </RebassLink>
);

Link.propTypes = {
  external: PropTypes.bool
};

export default Link;
