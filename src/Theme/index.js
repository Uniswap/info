import React from 'react'
import { ThemeProvider as StyledComponentsThemeProvider, createGlobalStyle } from 'styled-components'
import { useDarkModeManager } from '../contexts/LocalStorage'
import styled, { css } from 'styled-components'
import { Text } from 'rebass'

const MEDIA_WIDTHS = {
  upToExtraSmall: 576,
  upToSmall: 768,
  upToMedium: 992,
  upToLarge: 1200,
  upToXL: 1400,
  upToXXL: 1800,
}

const mediaWidthTemplates = Object.keys(MEDIA_WIDTHS).reduce((accumulator, size) => {
  accumulator[size] = (a, b, c) => css`
    @media (max-width: ${MEDIA_WIDTHS[size]}px) {
      ${css(a, b, c)}
    }
  `
  return accumulator
}, {})

export default function ThemeProvider({ children }) {
  const [darkMode] = useDarkModeManager()

  return <StyledComponentsThemeProvider theme={theme(darkMode)}>{children}</StyledComponentsThemeProvider>
}

const theme = (darkMode, color) => ({
  customColor: color,
  textColor: darkMode ? color : 'black',

  panelColor: darkMode ? 'rgba(255, 255, 255, 0)' : 'rgba(255, 255, 255, 0)',
  backgroundColor: darkMode ? '#212429' : '#F7F8FA',

  uniswapPink: darkMode ? '#31CB9E' : 'black',

  concreteGray: darkMode ? '#292C2F' : '#FAFAFA',
  inputBackground: darkMode ? '#1F1F1F' : '#FAFAFA',
  shadowColor: darkMode ? '#000' : '#2F80ED',
  mercuryGray: darkMode ? '#333333' : '#E1E1E1',

  text1: darkMode ? '#FAFAFA' : '#1F1F1F',
  text2: darkMode ? '#C3C5CB' : '#565A69',
  text3: darkMode ? '#6C7284' : '#888D9B',
  text4: darkMode ? '#565A69' : '#C3C5CB',
  text5: darkMode ? '#2C2F36' : '#EDEEF2',
  text6: darkMode ? '#6d8591' : '#565A69',
  text7: darkMode ? '#c9d2d7' : '#565A69',
  text8: darkMode ? '#C3C5CB' : '#565A69',
  text9: darkMode ? '#FFFFFF' : '#000000',

  // special case text types
  white: '#FFFFFF',

  // backgrounds / greys
  bg1: darkMode ? '#303e46' : '#FAFAFA',
  bg2: darkMode ? '#2C2F36' : '#F7F8FA',
  bg3: darkMode ? '#40444F' : '#EDEEF2',
  bg4: darkMode ? '#565A69' : '#CED0D9',
  bg5: darkMode ? '#565A69' : '#888D9B',
  bg6: darkMode ? '#243036' : '#FFFFFF',
  bg7: darkMode ? '#303e46' : '#FFFFFF',

  //specialty colors
  modalBG: darkMode ? 'rgba(0,0,0,.425)' : 'rgba(0,0,0,0.3)',
  advancedBG: darkMode ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.4)',
  onlyLight: darkMode ? '#222c31' : 'transparent',
  divider: darkMode ? 'rgba(43, 43, 43, 0.435)' : 'rgba(43, 43, 43, 0.035)',

  primary: '#31CB9E',

  //primary colors
  primary1: '#31CB9E',
  primary2: darkMode ? '#3680E7' : '#FF8CC3',
  primary3: darkMode ? '#4D8FEA' : '#FF99C9',
  primary4: darkMode ? '#376bad70' : '#F6DDE8',
  primary5: darkMode ? '#153d6f70' : '#FDEAF1',

  // secondary colors
  secondary1: darkMode ? '#2172E5' : '#31CB9E',
  secondary2: darkMode ? '#17000b26' : '#F6DDE8',
  secondary3: darkMode ? '#17000b26' : '#FDEAF1',

  shadow1: darkMode ? '#000' : '#2F80ED',

  // border colors
  // border: darkMode ? '#4c5f69' : '#859aa5',

  // table colors
  tableHeader: darkMode ? '#303E46' : '#F9F9F9',
  oddRow: darkMode ? '#283339' : '#f4f4f4',
  evenRow: darkMode ? '#303e46' : '#F9F9F9',

  // other
  red1: '#FF537B',
  green1: '#31CB9E',
  yellow1: '#FFE270',
  yellow2: '#F3841E',
  link: '#2172E5',
  blue: '2f80ed',
  menu: '#f4f4f4',
  warning: '#FFAF01',
  warningBackground: darkMode ? '#11171a' : '#ffffff',
  warningBorder: darkMode ? '#303e46' : '#ffaf01',
  warningTextColor: darkMode ? '#859aa5' : '#1d272b',

  buttonBlack: darkMode ? '#11171A' : '#F5F5F5',
  background: darkMode ? '#243036' : '#FFFFFF',
  text: darkMode ? '#FFFFFF' : '#3A3A3A',
  textReverse: !darkMode ? '#FFFFFF' : '#3A3A3A',
  subText: darkMode ? '#A7B6BD' : '#5C6468',
  border: darkMode ? '#40505A' : '#E9E9E9',

  // media queries
  mediaWidth: mediaWidthTemplates,
})

const TextWrapper = styled(Text)`
  color: ${({ color, theme }) => theme[color]};
`

export const TYPE = {
  main(props) {
    return <TextWrapper fontWeight={500} fontSize={14} color={'text1'} {...props} />
  },

  body(props) {
    return <TextWrapper fontWeight={400} fontSize={14} color={'text1'} {...props} />
  },

  small(props) {
    return <TextWrapper fontWeight={500} fontSize={11} color={'text1'} {...props} />
  },

  header(props) {
    return <TextWrapper fontWeight={600} color={'text1'} {...props} />
  },

  largeHeader(props) {
    return <TextWrapper fontWeight={500} color={'text1'} fontSize={24} {...props} />
  },

  light(props) {
    return <TextWrapper fontWeight={400} color={'text3'} fontSize={14} {...props} />
  },

  pink(props) {
    return <TextWrapper fontWeight={props.faded ? 400 : 600} color={props.faded ? 'text1' : 'text1'} {...props} />
  },
}

export const Hover = styled.div`
  :hover {
    cursor: pointer;
  }
`

export const Link = styled.a.attrs({
  target: '_blank',
  rel: 'noopener noreferrer',
})`
  text-decoration: none;
  cursor: pointer;
  color: ${({ theme }) => theme.primary1};
  font-weight: 500;
  :hover {
    text-decoration: underline;
  }
  :focus {
    outline: none;
    text-decoration: underline;
  }
  :active {
    text-decoration: none;
  }
`

export const ThemedBackground = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  pointer-events: none;
  max-width: 100vw !important;
  height: 200vh;
  mix-blend-mode: color;
  position: absolute;
  top: 0px;
  left: 0px;
  z-index: 9999;

  transform: translateY(-110vh);
`

export const GlobalStyle = createGlobalStyle`
  @import url('https://rsms.me/inter/inter.css');
  html { font-family: 'Inter', sans-serif; }
  @supports (font-variation-settings: normal) {
    html { font-family: 'Inter var', sans-serif; }
  }

  html, input, textarea, button {
    font-family: 'Work Sans', 'Inter', sans-serif;
    font-display: fallback;
  }
  @supports (font-variation-settings: normal) {
    html, input, textarea, button {
      font-family: 'Work Sans', 'Inter var', sans-serif;
    }
  }



  html,
  body {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    font-size: 14px;
    background-color: ${({ theme }) => theme.bg6};
  }

  a {
    text-decoration: none;

    :hover {
      text-decoration: none
    }
  }

  ::-webkit-scrollbar {
    width: 6px;
    height: 8px;
  }

  ::-webkit-scrollbar-thumb {
    background: transparent;
    border-radius: 999px;
  }

 :hover::-webkit-scrollbar-thumb {
    background: #878787;
    border-radius: 999px;
  }


  ::-webkit-scrollbar-track-piece {
    background: transparent;
  }

.three-line-legend {
	height: 70px;
	position: absolute;
	padding: 8px;
	font-size: 12px;
	color: #20262E;
	background-color: rgba(255, 255, 255, 0.23);
	text-align: left;
	z-index: 10;
  pointer-events: none;
}

.three-line-legend-dark {
	height: 70px;
	position: absolute;
	padding: 8px;
	font-size: 12px;
	color: white;
	background-color: rgba(255, 255, 255, 0.23);
	text-align: left;
	z-index: 10;
  pointer-events: none;
}

.tv-lightweight-charts{
  width: 100% !important;


  & > * {
    width: 100% !important;
  }
}


  html {
    font-size: 1rem;
    font-variant: none;
    color: ${({ theme }) => theme.text};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
    height: 100%;
  }
`
