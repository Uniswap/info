import React from "react";

const Container = ({ children }) => <>{children}</>;

export const Grid = ({ children }) => (
  <div
    style={{
      display: "grid",
      gridGap: "1rem",
      padding: "1.5rem",
      paddingTop: 0
    }}
  >
    {children}
  </div>
);

export default Container;
