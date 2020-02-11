import React from "react"
import {
  ThemeProvider as StyledComponentsThemeProvider,
  createGlobalStyle
} from "styled-components"
import { useColor } from "../contexts/Application"
import { useDarkModeManager } from "../contexts/LocalStorage"

export default function ThemeProvider({ children }) {
  const [darkMode] = useDarkModeManager()
  const [color] = useColor()

  return (
    <StyledComponentsThemeProvider theme={theme(darkMode, color)}>
      {children}
    </StyledComponentsThemeProvider>
  )
}

const theme = (darkMode, color) => ({
  background: darkMode
    ? "black"
    : `linear-gradient(
      180deg,
      rgba(254, 109, 222, 0.6) 0%,
      rgba(254, 109, 222, 0) 100%
    );`,

  customColor: color,
  textColor: darkMode ? color : "black",

  panelColor: darkMode ? color : "rgba(255, 255, 255, 0.4)",
  backgroundColor: darkMode ? "black" : "white",

  uniswapPink: darkMode ? "#FE6DDE" : "black",

  concreteGray: darkMode ? "#292C2F" : "#FAFAFA",
  inputBackground: darkMode ? "#1F1F1F" : "rgba(255, 255, 255, 0.4)",
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

  a {
    text-decoration: none;

    :hover {
      text-decoration: none
    }
  }

  html {
    font-size: 16px;
    font-variant: none;
    color: 'black';
    background-color: ${({ theme }) => theme.backgroundColor};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  }
`
