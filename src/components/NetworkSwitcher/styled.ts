import { darken } from 'polished'
import { Link } from 'react-router-dom'
import styled from 'styled-components'

export const NetworkSwitcherContainer = styled.div`
  position: relative;
  border-radius: 1.125rem;
`

export const CurrentNetwork = styled.div<{ bgColor?: string }>`
  display: grid;
  grid-template-columns: 1.5rem 1fr min-content;
  align-items: center;
  gap: 0 0.5rem;
  padding: 0.75rem 1rem;
  margin: 0 0.5rem;
  align-items: center;
  background-color: ${({ theme }) => theme.bg1};
  border-radius: 0.5rem;
  color: ${({ theme }) => theme.text2};
  cursor: pointer;
  min-width: 203px;

  :hover {
    opacity: 0.9;
  }

  :after {
    content: '';
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 50%;
    background-color: ${({ theme }) => theme.green1};

    @media screen and (max-width: 600px) {
      content: unset;
    }
  }

  @media screen and (max-width: 600px) {
    grid-template-columns: 2rem;
    padding: 0;
    background-color: unset;
    min-width: auto;
    margin: 0;
  }
`

export const NetworkList = styled.ul`
  position: absolute;
  transition: 0.2s ease;
  transform: translate(calc(100%), -56px);
  border: 1px solid ${({ theme }) => theme.mercuryGray};
  animation: 0.3s ease-in-out;
  background-color: ${({ theme }) => darken(0.05, theme.bg1)};
  list-style: none;
  border-radius: 0 0.5rem 0.5rem 0;
  width: 100%;
  margin: 0;
  padding: 0;

  @media screen and (max-width: 1080px) {
    border-radius: 0 0 0.5rem 0.5rem;
    transform: translate(0, 1rem);
  }

  @media screen and (max-width: 600px) {
    border-radius: 0 0 0.5rem 0.5rem;
    transform: translate(calc(-100% + 2.5rem), 1rem);
    width: 200px;
  }
`

export const NetworkListItem = styled.li`
  transition: 0.3s;
  margin: 0.5rem;
  border-radius: 0.5rem;
  opacity: 0.9;

  :hover {
    background-color: ${({ theme }) => theme.bg1};
    opacity: 1;
  }
`

export const NetworkListItemLink = styled(Link)`
  padding: 0.75rem 1rem;
  display: grid;
  grid-template-columns: 1.5rem 1fr min-content;
  align-items: center;
  gap: 0 0.5rem;
  color: ${({ theme }) => theme.text2};
`

export const NetworkBlurb = styled.span`
  padding: 0.25rem 0.5rem;
  border-radius: 0.5rem;
  background-color: ${({ theme }) => theme.bg2};
  color: ${({ theme }) => theme.text3};
`

export const NetworkLogo = styled.img`
  width: 100%;
  border-radius: 50%;
`

export const NetworkName = styled.span`
  @media screen and (max-width: 600px) {
    display: none;
  }
`
