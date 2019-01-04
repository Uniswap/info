import React from "react";
import { Box as RebassBox } from "rebass";
import styled from "styled-components";

const Box = styled(RebassBox)`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, 1fr);

  grid-gap: ${props => (props.gap ? props.gap : "unset")};
`;

const FourByFour = props => (
  <Box {...props}>
    <div style={{ placeSelf: "flex-start flex-start" }}>{props.topLeft}</div>
    <div style={{ placeSelf: "flex-start flex-end" }}>{props.topRight}</div>
    <div style={{ placeSelf: "flex-end flex-start" }}>{props.bottomLeft}</div>
    <div style={{ placeSelf: "flex-end" }}>{props.bottomRight}</div>
  </Box>
);

export default FourByFour;
