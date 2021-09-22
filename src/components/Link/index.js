import React from 'react'
import { Link as RebassLink } from 'rebass'
import { Link as RouterLink } from 'react-router-dom'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { lighten, darken, transparentize } from 'polished'

const WrappedLink = ({ external, children, ...rest }) => (
  <RebassLink
    target={external ? '_blank' : null}
    rel={external ? 'noopener noreferrer' : null}
    color="#2f80ed"
    {...rest}
  >
    {children}
  </RebassLink>
)

WrappedLink.propTypes = {
  external: PropTypes.bool,
}

const Link = styled(WrappedLink)`
  color: ${({ color, theme }) => (color ? color : theme.link)};
  ${(props) =>
    props.button
      ? `
    padding: 5px 12px;
    border: 1px solid ${props.theme.primaryText1};
    border-radius: 47px;
    text-decoration: none;
    :hover {
      color: ${props.theme.primaryText1};
      background-color: ${transparentize(0.8, props.theme.primary1)};
    }
  `
      : ''}
`

export default Link

export const CustomLink = styled(RouterLink)`
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  color: ${({ color, theme }) => (color ? color : theme.primaryText1)};

  &:visited {
    color: ${({ color, theme }) => (color ? lighten(0.1, color) : lighten(0.1, theme.primaryText1))};
  }

  &:hover {
    cursor: pointer;
    text-decoration: none;
    underline: none;
    color: ${({ color, theme }) => (color ? darken(0.1, color) : darken(0.1, theme.primaryText1))};
  }
`

export const BasicLink = styled(RouterLink)`
  text-decoration: none;
  color: #7583A1;
  &:hover {
    cursor: pointer;
    text-decoration: none;
    underline: none;
    color: #fff;
  }
`
