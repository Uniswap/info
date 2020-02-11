import React, { useEffect } from "react"
import {
  ThemeProvider as StyledComponentsThemeProvider,
  createGlobalStyle,
  css
} from "styled-components"
import { useDarkModeManager } from "../contexts/LocalStorage"

const MEDIA_WIDTHS = {
  upToSmall: 600,
  upToMedium: 960,
  upToLarge: 1280
}

const mediaWidthTemplates = Object.keys(MEDIA_WIDTHS).reduce(
  (accumulator, size) => {
    accumulator[size] = (...args) => css`
      @media (max-width: ${MEDIA_WIDTHS[size]}px) {
        ${css(...args)}
      }
    `
    return accumulator
  },
  {}
)

export default function ThemeProvider({ children }) {
  const [darkMode] = useDarkModeManager()

  return (
    <StyledComponentsThemeProvider theme={theme(darkMode)}>
      {children}
    </StyledComponentsThemeProvider>
  )
}

const theme = darkMode => ({
  background: darkMode
    ? "black"
    : `linear-gradient(
      180deg,
      rgba(254, 109, 222, 0.6) 0%,
      rgba(254, 109, 222, 0) 100%
    );`,

  backgroundColor: darkMode ? "black" : "white",

  uniswapPink: darkMode ? "#FE6DDE" : "black",

  concreteGray: darkMode ? "#292C2F" : "#FAFAFA",
  inputBackground: darkMode ? "#202124" : "white",
  shadowColor: darkMode ? "#000" : "#2F80ED",
  mercuryGray: darkMode ? "#333333" : "#E1E1E1"
})

export const GlobalStyle = createGlobalStyle`
  @import url('https://rsms.me/inter/inter.css');
  html { font-family: 'Inter', sans-serif; }
  @supports (font-variation-settings: normal) {
    html { font-family: 'Inter var', sans-serif; }
  }
  
  html,
  body {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;    
  }

  body > div {
    height: 100%;
    overflow: auto;
    -webkit-overflow-scrolling: touch;
}

  html {
    font-size: 16px;
    font-variant: none;
    color: ${({ theme }) => theme.textColor};
    background-color: ${({ theme }) => theme.backgroundColor};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  }
`
