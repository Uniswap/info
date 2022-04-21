import styled, { css, keyframes } from 'styled-components/macro'

export const pulse = keyframes`
0% { transform: scale(1); }
60% { transform: scale(1.1); }
100% { transform: scale(1); }
`

export const Wrapper = styled.div<{ fill?: boolean }>`
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;

  ${({ fill }) =>
    fill
      ? css`
          height: 100vh;
        `
      : css`
          height: 180px;
        `}
`

export const AnimatedImg = styled.div`
  animation: ${pulse} 800ms linear infinite;

  & > * {
    width: 72px;
  }
`
