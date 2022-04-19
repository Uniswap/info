import { Link } from 'react-router-dom'
import styled from 'styled-components'

export const TitleWrapper = styled(Link)`
  text-decoration: none;
  cursor: pointer;
  height: 2rem;

  @media screen and (min-width: 1080px) {
    margin: 1.5rem 2rem;
  }
`
