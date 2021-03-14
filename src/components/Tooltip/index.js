import React, { useCallback, useState } from 'react'
import styled from 'styled-components'
import Popover from '../Popover'

const TooltipContainer = styled.div`
  width: 228px;
  padding: 0.6rem 1rem;
  line-height: 150%;
  font-weight: 400;
`

export default function Tooltip({ text, ...rest }) {
  return <Popover content={<TooltipContainer>{text}</TooltipContainer>} {...rest} />
}

export function MouseoverTooltip({ children, ...rest }) {
  const [show, setShow] = useState(false)
  const open = useCallback(() => setShow(true), [setShow])
  const close = useCallback(() => setShow(false), [setShow])
  return (
    <Tooltip {...rest} show={show}>
      <div onMouseEnter={open} onMouseLeave={close}>
        {children}
      </div>
    </Tooltip>
  )
}
