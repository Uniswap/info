import React, { useCallback, useState } from 'react'
import styled from 'styled-components'
import Popover, { PopoverProps } from '../Popover'

const Wrapper = styled.span`
  display: flex;
  justify-content: center;
  align-items: center;
`

const TooltipContainer = styled.div`
  width: 228px;
  padding: 0.6rem 1rem;
  line-height: 150%;
  font-weight: 400;
`

interface TooltipProps extends Omit<PopoverProps, 'content'> {
  text: string
}

export function Tooltip({ text, ...rest }: TooltipProps) {
  return <Popover content={<TooltipContainer>{text}</TooltipContainer>} {...rest} />
}

export default function HoverText({ text, children }: { text: string; children: any }) {
  const [show, setShow] = useState<boolean>(false)
  const open = useCallback(() => setShow(true), [setShow])
  const close = useCallback(() => setShow(false), [setShow])

  return (
    <Wrapper>
      <Tooltip text={text} show={show}>
        <Wrapper onMouseEnter={open} onMouseLeave={close}>
          {children}
        </Wrapper>
      </Tooltip>
    </Wrapper>
  )
}
