import theme from '../Theme/theme'
const color = theme.colors

export const customStyles = {
  control: (styles, state) => ({
    ...styles,
    borderRadius: 38,
    borderColor: color.zircon,
    backgroundColor: state.isFocused ? 'rgba(235, 244, 255, 0.15)' : 'rgba(255, 255, 255, 0.05)',
    color: 'inherit',
    boxShadow: 'none',
    ':hover': {
      borderColor: color.zircon
    }
  }),
  placeholder: styles => ({
    ...styles,
    color: 'inherit'
  }),
  input: styles => ({
    ...styles,
    color: 'inherit'
  }),
  singleValue: styles => ({
    ...styles,
    color: 'inherit'
  }),
  indicatorSeparator: () => ({
    display: 'none'
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
  option: (styles, state) => ({
    ...styles,
    margin: '4px 8px',
    padding: 'calc(16px - 1px) calc(24px - 1px)',
    width: '',
    lineHeight: 1,
    color: state.isSelected ? '#000' : '',
    border: state.isSelected ? '1px solid var(--c-zircon)' : '1px solid transparent',
    borderRadius: state.isSelected && 40,
    backgroundColor: state.isSelected ? 'var(--c-alabaster)' : '',
    ':hover': {
      backgroundColor: 'var(--c-alabaster)'
    }
  }),
  menu: styles => ({
    ...styles,
    borderRadius: 16,
    boxShadow: '0 4px 8px 0 rgba(47, 128, 237, 0.1), 0 0 0 0.5px var(--c-zircon)',
    overflow: 'hidden'
  }),
  menuList: styles => ({
    ...styles,
    color: color.text
  })
}

export default customStyles
