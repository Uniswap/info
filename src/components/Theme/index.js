/**
 * @prettier
 */

import React from "react";
import { ThemeProvider, createGlobalStyle } from "styled-components";

// import "modern-normalize";
import "typeface-inter";

import theme from "./theme";

export const GlobalStyles = createGlobalStyle`
  html {
    font-size: 16px;
    background-color: ${props => props.theme.colors.concrete};
  }

  body {
    margin: 0;
    font-family: ${props => props.theme.fonts.sans};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
`;

export const Theme = props => (
  <ThemeProvider theme={theme}>{props.children}</ThemeProvider>
);

export const Wrapper = ({ children }) => (
  <Theme>
    <>
      <GlobalStyles />
      {children}
    </>
  </Theme>
);

export default Wrapper;
