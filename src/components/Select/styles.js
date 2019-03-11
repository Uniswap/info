import theme from "../Theme/theme";
const color = theme.colors;

export const customStyles = {
  control: (styles, state) => ({
    ...styles,
    borderRadius: 38,
    borderColor: color.zircon,
    backgroundColor: state.isFocused
      ? "rgba(235, 244, 255, 0.15)"
      : "rgba(255, 255, 255, 0.05)",
    color: "inherit",
    boxShadow: "none",
    ":hover": {
      borderColor: color.zircon
    }
  }),
  placeholder: styles => ({
    ...styles,
    color: "inherit"
  }),
  input: styles => ({
    ...styles,
    color: "inherit"
  }),
  singleValue: styles => ({
    ...styles,
    color: "inherit"
  }),
  indicatorSeparator: () => ({
    display: "none"
  }),
  dropdownIndicator: styles => ({
    ...styles,
    paddingRight: 16
  }),
  valueContainer: styles => ({
    ...styles,
    paddingLeft: 16
  }),
  menuPlacer: styles => ({
    ...styles
  }),
  menuList: styles => ({
    ...styles,
    color: color.text
  })
};

export default customStyles;
