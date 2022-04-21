import styled from 'styled-components/macro'
import { Box } from 'rebass/styled-components'

const Row = styled(Box)<{ align?: string; padding?: string; borderRadius?: string; justify?: string }>`
  width: 100%;
  display: flex;
  padding: 0;
  align-items: center;
  align-items: ${({ align = 'auto' }) => align};
  padding: ${({ padding = 'auto' }) => padding};
  border-radius: ${({ borderRadius = '0' }) => borderRadius};
  justify-content: ${({ justify = 'auto' }) => justify};
`

export const RowBetween = styled(Row)`
  justify-content: space-between;
`

export const RowFlat = styled.div`
  display: flex;
  align-items: flex-end;
`

export const AutoRow = styled(Row)<{ wrap?: string; gap?: string }>`
  flex-wrap: ${({ wrap = 'nowrap' }) => wrap};
  margin: -${({ gap = '0' }) => gap};

  & > * {
    margin: ${({ gap }) => gap} !important;
  }
`

export const RowFixed = styled(Row)`
  width: fit-content;
`

export default Row
