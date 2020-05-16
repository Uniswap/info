import React from 'react'
import { Link as RebassLink } from 'rebass'
import { Link as RouterLink } from 'react-router-dom'
import PropTypes from 'prop-types'
import styled from 'styled-components'

const Link = ({ external, children, ...rest }) => (
  <RebassLink
    target={external ? '_blank' : null}
    rel={external ? 'noopener noreferrer' : null}
    color="#2f80ed"
    {...rest}
  >
    {children}
  </RebassLink>
)

Link.propTypes = {
  external: PropTypes.bool
}

export default Link

export const CustomLink = styled(RouterLink)`
  text-decoration: none;
  color: #2f80ed;

  &:visited {
    color: rgb(47, 128, 237);
  }

  &:hover {
    cursor: pointer;
    text-decoration: none;
    underline: none;
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
