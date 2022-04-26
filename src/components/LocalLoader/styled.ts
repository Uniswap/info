import styled, { keyframes } from 'styled-components/macro'

export const pulse = keyframes`
0% { transform: scale(1); }
60% { transform: scale(1.1); }
100% { transform: scale(1); }
`

export const Wrapper = styled.div<{ fullscreen?: boolean }>`
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: ${({ fullscreen }) => (fullscreen ? '100vh' : '180px')};
`

export const AnimatedImg = styled.div`
  animation: ${pulse} 800ms linear infinite;

  & > * {
    width: 72px;
  }
`
