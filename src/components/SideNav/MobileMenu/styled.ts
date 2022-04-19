import { darken } from 'polished'
import { Menu } from 'react-feather'
import styled from 'styled-components'

export const MenuWrapper = styled.div`
  position: relative;
  height: 2rem;
`

export const MenuButton = styled(Menu)`
  width: 2rem;
  height: 2rem;
  color: ${({ theme }) => theme.text2};
  cursor: pointer;
`

export const MenuList = styled.ul`
  position: absolute;
  transition: 0.2s ease;
  transform: translate(calc(2.5rem - 100%), 21px);
  border: 1px solid ${({ theme }) => theme.mercuryGray};
  animation: 0.3s ease-in-out;
  background-color: ${({ theme }) => darken(0.05, theme.bg1)};
  list-style: none;
  border-radius: 0 0 0.5rem 0.5rem;
  width: 200px;
  margin: 0;
  padding: 0;

  @media screen and (max-width: 600px) {
    transform: translate(calc(2.5rem - 100%), 13px);
  }
`

export const MenuItem = styled.li`
  display: grid;
  grid-template-columns: min-content 1fr;
  gap: 0.75rem;
  align-items: center;
  padding: 0.75rem 1rem;
  margin: 0.5rem;
  border-radius: 0.5rem;
  color: ${({ theme }) => theme.text2};
  opacity: 0.9;
  cursor: pointer;

  :hover {
    background-color: ${({ theme }) => theme.bg1};
    opacity: 1;
  }
`

export const MenuIcon = styled.img``

export const MenuLinkSpan = styled.span``
