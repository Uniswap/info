import styled from 'styled-components'

export const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
  width: 100%;
  border-radius: 12px;
`

export const Input = styled.input`
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  white-space: nowrap;
  background: none;
  border: none;
  outline: none;
  padding: 0.875rem 1rem;
  border-radius: 12px;
  color: ${({ theme }) => theme.text1};
  background-color: ${({ theme }) => theme.bg1};
  font-size: 16px;
  margin-right: 1rem;
  border: 1px solid ${({ theme }) => theme.bg3};

  ::placeholder {
    color: ${({ theme }) => theme.text3};
    font-size: 14px;
  }

  @media screen and (max-width: 640px) {
    ::placeholder {
      font-size: 1rem;
    }
  }
`

export const AccountLink = styled.span`
  display: flex;
  color: ${({ theme }) => theme.link};
  font-size: 14px;
  font-weight: 500;
`

export const DashGrid = styled.div<{ padding?: string }>`
  display: grid;
  grid-gap: 1em;
  grid-template-columns: 1fr;
  grid-template-areas: 'account';
  padding: ${({ padding = '0 0 1rem 0' }) => padding};
  height: fit-content;

  > * {
    justify-content: flex-end;
  }
`
