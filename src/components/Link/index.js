import React from 'react'
import { Link as RebassLink } from 'rebass'
import { Link as RouterLink } from 'react-router-dom'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { lighten, darken } from 'polished'
import useTheme from '../../hooks/useTheme'

const WrappedLink = ({ external, children, ...rest }) => {
  const theme = useTheme()

  return (
    <RebassLink target={external ? '_blank' : null} rel={external ? 'noopener noreferrer' : null} color={theme.primary} {...rest}>
      {children}
    </RebassLink>
  )
}

WrappedLink.propTypes = {
  external: PropTypes.bool,
}

const Link = styled(WrappedLink)`
  color: ${({ color, theme }) => (color ? color : theme.primary)};
  :hover {
    color: ${({ color, theme }) => (color ? darken(0.1, color) : darken(0.1, theme.primary))};
  }
`

export default Link

export const CustomLink = styled(RouterLink)`
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  color: ${({ color, theme }) => (color ? color : theme.primary)};

  &:visited {
    color: ${({ color, theme }) => (color ? lighten(0.1, color) : lighten(0.1, theme.primary))};
  }

  &:hover {
    cursor: pointer;
    text-decoration: none;
    underline: none;
    color: ${({ color, theme }) => (color ? darken(0.1, color) : darken(0.1, theme.primary))};
  }
`

export const BasicLink = styled(RouterLink)`
  text-decoration: none;
  color: inherit;
  &:hover {
    cursor: pointer;
    text-decoration: none;
    underline: none;
  }
`
