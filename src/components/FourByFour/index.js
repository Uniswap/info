import React from "react";
import { Box as RebassBox } from "rebass";
import styled from "styled-components";

const Box = styled(RebassBox)`
  display: grid;
  grid-template-columns: repeat(2, minmax(max-content, 1fr));
  grid-template-rows: repeat(2, minmax(max-content, 1fr));

  grid-gap: ${props => (props.gap ? props.gap : "unset")};
`;

const pos = {
  topLeft: "flex-start flex-start",
  topRight: "flex-start flex-end",
  bottomLeft: "flex-end flex-start",
  bottomRight: "flex-end"
};

const FourByFour = props => (
  <Box {...props}>
    <div style={{ placeSelf: pos.topLeft }}>{props.topLeft}</div>
    <div style={{ placeSelf: pos.topRight }}>{props.topRight}</div>
    <div style={{ placeSelf: pos.bottomLeft }}>{props.bottomLeft}</div>
    <div style={{ placeSelf: pos.bottomRight }}>{props.bottomRight}</div>
  </Box>
);

export default FourByFour;
