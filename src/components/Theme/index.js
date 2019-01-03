/**
 * @prettier
 */

import React from "react";
import { ThemeProvider, createGlobalStyle } from "styled-components";

// import "modern-normalize";
import "typeface-inter";

import theme from "./theme";

const GlobalStyles = createGlobalStyle`
  html {
    font-size: 16px;
  }

  body {
    margin: 0;
    font-family: "Inter UI", -apple-system, BlinkMacSystemFont, Segoe UI,
    Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji,
    Segoe UI Symbol;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
`;

export default props => (
  <>
    <GlobalStyles />
    <ThemeProvider theme={theme}>{props.children}</ThemeProvider>
  </>
);
