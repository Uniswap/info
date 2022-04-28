import { darken } from 'polished'
import { NavLink } from 'react-router-dom'
import { Link as RouterLink } from 'react-router-dom'
import styled from 'styled-components'

export const Wrapper = styled.div<{ isMobile: boolean }>`
  height: ${({ isMobile }) => (isMobile ? 'initial' : '100vh')};
  background-color: ${({ theme }) => darken(0.05, theme.bg1)};
  color: ${({ theme }) => theme.text1};
  position: sticky;
  top: 0px;
  z-index: 9999;
  box-sizing: border-box;
  border-right: 1px solid ${({ theme }) => theme.mercuryGray};
  color: ${({ theme }) => theme.bg2};

  @media screen and (max-width: 1080px) {
    border-bottom: 1px solid ${({ theme }) => theme.mercuryGray};
    padding: 1rem;
  }

  @media screen and (max-width: 800px) {
    grid-template-columns: 1fr;
    position: relative;
  }
`

export const NavigationLink = styled(NavLink)`
  font-weight: 500;
  font-size: 1rem;
  opacity: 0.6;
  color: ${({ theme }) => theme.text1};
  display: flex;
  padding: 0.5rem 1.5rem;
  position: relative;
  align-items: center;
  width: 100%;

  :hover {
    opacity: 1;
  }

  &.active {
    opacity: 1;
    color: ${({ theme }) => theme.blueGrey};
    background: rgba(102, 129, 167, 0.1);
    font-weight: 700;

    div {
      background: ${({ theme }) => theme.blueGrey};

      svg {
        stroke: ${({ theme }) => theme.lightText1};
      }
    }
    :before {
      content: '';
      position: absolute;
      width: 0.25rem;
      height: 100%;
      top: 0;
      left: 0;
      background: ${({ theme }) => theme.blueGrey};
    }
  }
`

export const StyledNavButton = styled.div`
  display: flex;
  border-radius: 100%;
  padding: 8px;
  margin-right: 1rem;
`

export const DesktopWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100vh;
`

export const MobileWrapper = styled.div`
  display: grid;
  justify-content: space-between;
  align-items: center;
  grid-template-columns: 1fr min-content min-content;
  gap: 1rem;
`

export const HeaderText = styled.div`
  margin-right: 0.75rem;
  font-size: 0.825rem;
  font-weight: 500;
  display: inline-box;
  display: -webkit-inline-box;
  opacity: 0.8;
  :hover {
    opacity: 1;
  }
  a {
    color: ${({ theme }) => theme.text1};
  }
`

export const LatestBlockContainer = styled(RouterLink)`
  align-items: center;
  display: grid;
  width: fit-content;
  grid-auto-flow: column;
  gap: 4px;
  text-decoration: none;
  border-radius: 4px;
  padding: 4px;
  font-weight: 500;
  font-size: 11px;
  transition: opacity 0.25s ease 0s;
`

export const LatestBlockDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.green1};
`

export const LatestBlock = styled.span`
  color: ${({ theme }) => theme.green1};
`

export const LatestBlockText = styled.span`
  color: ${({ theme }) => theme.text3};
`
