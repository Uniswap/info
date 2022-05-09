// import original module declarations
import 'styled-components'

// and extend them!
declare module 'styled-components' {
  export interface DefaultTheme {
    customColor: string
    textColor: string

    panelColor: string
    backgroundColor: string

    uniswapPink: string

    concreteGray: string
    inputBackground: string
    shadowColor: string
    mercuryGray: string

    text1: string
    text2: string
    text3: string
    text4: string
    text5: string
    text6: string

    // special case text types
    white: string

    // backgrounds / greys
    bg1: string
    bg2: string
    bg3: string
    bg4: string
    bg5: string
    bg6: string
    bg7: string
    bg8: string

    //specialty colors
    modalBG: string
    advancedBG: string
    onlyLight: string
    divider: string

    //primary colors
    primary1: string
    primary2: string
    primary3: string
    primary4: string
    primary5: string

    // color text
    primaryText1: string

    // secondary colors
    secondary1: string
    secondary2: string
    secondary3: string

    shadow1: string

    // other
    red1: string
    green1: string
    yellow1: string
    yellow2: string
    link: string
    blueGrey: string
    blue: string

    lightText1: string

    background: string
  }
}
