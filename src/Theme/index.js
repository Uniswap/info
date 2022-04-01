import { ThemeProvider as StyledComponentsThemeProvider, createGlobalStyle } from 'styled-components/macro'
import { useDarkModeManager } from '../contexts/LocalStorage'
import styled from 'styled-components/macro'
import { Text } from 'rebass'

export default function ThemeProvider({ children }) {
  const [darkMode] = useDarkModeManager()

  return <StyledComponentsThemeProvider theme={theme(darkMode)}>{children}</StyledComponentsThemeProvider>
}

const theme = (darkMode, color) => ({
  customColor: color,
  textColor: darkMode ? color : 'black',

  panelColor: darkMode ? 'rgba(255, 255, 255, 0)' : 'rgba(255, 255, 255, 0)',
  backgroundColor: darkMode ? '#212429' : '#F7F8FA',

  uniswapPink: darkMode ? '#C9A02F' : 'black',

  concreteGray: darkMode ? '#292C2F' : '#FAFAFA',
  inputBackground: darkMode ? '#1F1F1F' : '#FAFAFA',
  shadowColor: darkMode ? '#000' : '#2F80ED',
  mercuryGray: darkMode ? '#333333' : '#E1E1E1',

  text1: darkMode ? '#FAFAFA' : '#202327',
  text2: darkMode ? '#C3C5CB' : '#565A69',
  text3: darkMode ? '#6C7284' : '#888D9B',
  text4: darkMode ? '#565A69' : '#C3C5CB',
  text5: darkMode ? '#2C2F36' : '#EDEEF2',
  text6: darkMode ? 'rgb(165, 172, 183)' : '#45484D',

  // special case text types
  white: '#FFFFFF',

  // backgrounds / greys
  bg1: darkMode ? '#212429' : '#FAFAFA',
  bg2: darkMode ? '#2C2F36' : '#F7F8FA',
  bg3: darkMode ? '#40444F' : '#EDEEF2',
  bg4: darkMode ? '#565A69' : '#CED0D9',
  bg5: darkMode ? '#565A69' : '#888D9B',
  bg6: darkMode ? '#000' : '#FFFFFF',
  bg7: darkMode ? '#1f1f25' : '#F2F3F5',
  bg8: darkMode ? '#1C1C22' : '#FFFFFF',

  //specialty colors
  modalBG: darkMode ? 'rgba(0,0,0,0.425)' : 'rgba(0,0,0,0.3)',
  advancedBG: darkMode ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.4)',
  onlyLight: darkMode ? '#22242a' : 'transparent',
  divider: darkMode ? 'rgba(43, 43, 43, 0.435)' : 'rgba(43, 43, 43, 0.035)',

  //primary colors
  primary1: darkMode ? '#C9A02F' : '#C9A02F',
  primary2: darkMode ? '#3680E7' : '#e0b856',
  primary3: darkMode ? '#4D8FEA' : '#e2c277',
  primary4: darkMode ? '#376bad70' : '#eed385',
  primary5: darkMode ? '#153d6f70' : '#f3e2af',

  // color text
  primaryText1: darkMode ? '#6da8ff' : '#C9A02F',

  // secondary colors
  secondary1: darkMode ? '#2172E5' : '#C9A02F',
  secondary2: darkMode ? '#17000b26' : '#f5d786',
  secondary3: darkMode ? '#17000b26' : '#f8e5b1',

  shadow1: darkMode ? '#000' : '#2F80ED',

  // other
  red1: '#C73846',
  green1: '#54B45D',
  yellow1: '#FFE270',
  yellow2: '#F3841E',
  link: '#2172E5',
  blueGrey: '#6681A7',
  blue: '#2E69BB',

  lightText1: '#FAFAFA',

  background: darkMode ? 'black' : `radial-gradient(50% 50% at 50% 50%, #C9A02F30 0%, #fff 0%)`
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
    return <TextWrapper fontWeight={500} color={'text1'} fontSize={28} {...props} />
  },

  light(props) {
    return <TextWrapper fontWeight={400} color={'text3'} fontSize={14} {...props} />
  },

  pink(props) {
    return <TextWrapper fontWeight={props.faded ? 400 : 600} color={props.faded ? 'text1' : 'text1'} {...props} />
  }
}

export const DashboardWrapper = styled.div`
  width: 100%;
  background-color: ${({ theme }) => theme.bg8};
  padding: 2rem;
  border-radius: 1rem;

  @media screen and (max-width: 440px) {
    padding: 1rem;
  }
`

export const Hover = styled.div`
  :hover {
    cursor: pointer;
  }
`

export const Link = styled.a.attrs({
  target: '_blank',
  rel: 'noopener noreferrer'
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

export const GlobalStyle = createGlobalStyle`
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
    font-size: 14px;
    background-color: ${({ theme }) => theme.bg6};
  }

  * {
    box-sizing: border-box;
  }

  a {
    text-decoration: none;

    :hover {
      text-decoration: none
    }
  }

.three-line-legend {
	width: 100%;
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
	width: 100%;
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

@media screen and (max-width: 800px) {
  .three-line-legend {
    display: none !important;
  }
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
    color: 'black';
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
    height: 100%;
  }
`
