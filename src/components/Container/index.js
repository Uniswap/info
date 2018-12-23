/**
 * @prettier
 */

import React from "react";

const Container = ({children}) => (
  <div style={{
    margin: 15
  }}>
    <Grid>{children}</Grid>
  </div>
)

export const Grid = ({children}) => (
  <div style={{
    display: "grid",
    gridGap: 15,
  }}>{children}</div>
)

export default Container
