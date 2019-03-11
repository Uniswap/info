export default {
  fonts: {
    sans: `var(--font-family), var(--system-ui)`
  },
  colors: {
    white: "var(--c-white)",

    // greys
    alabaster: "var(--c-alabaster)",
    zircon: "var(--c-zircon)",
    mineshaft: "var(--c-mineshaft)",
    concrete: "var(--c-concrete)",
    jaguar: "var(--c-jaguar)",

    // colors
    uniswappink: "var(--c-uniswappink)",
    ronchi: "var(--c-ronchi)",
    token: "var(--c-token)",
    button: "var(--c-button)",
    connected: "var(--c-connected)",
    warningDim: "var(--c-warning-dim)",

    // text colors
    text: "var(--c-text)",
    textSubtext: "var(--c-text-subtext)",
    textDim: "var(--c-text-dim)",
    textLight: "var(--c-text-light)",
    textLightSubtext: "var(--c-text-light-subtext)",
    textLightDim: "var(--c-text-light-dim)"
  },
  buttons: {
    outline: {
      paddingLeft: 16 - 1,
      paddingRight: 16 - 1,
      paddingTop: 8 - 1,
      paddingBottom: 8 - 1,
      backgroundColor: "transparent",
      borderWidth: 1,
      borderStyle: "solid"
    }
  },
  Button: {
    fontFamily: `var(--font-family), var(--system-ui)`,
    borderRadius: 40,
    fontWeight: 500
  },
  Link: {
    textDecoration: "none",
    ":hover": {
      textDecoration: "underline"
    }
  }
};
