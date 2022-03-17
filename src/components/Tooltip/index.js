import React, { useCallback, useState, useRef, useEffect } from 'react'
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

export function OverflowTooltip({ children, ...rest }) {
  const [hoverStatus, setHover] = useState(false)
  const textElementRef = useRef()

  const compareSize = () => {
    const compare = textElementRef.current.scrollWidth > textElementRef.current.clientWidth
    setHover(compare)
  }

  useEffect(() => {
    compareSize()
    window.addEventListener('resize', compareSize)
    return () => {
      window.removeEventListener('resize', compareSize)
    }
  }, [])

  const [show, setShow] = useState(false)
  const open = useCallback(() => hoverStatus && setShow(true), [setShow, hoverStatus])
  const close = useCallback(() => setShow(false), [setShow])
  return (
    <Tooltip {...rest} show={show} width='100%'>
      <div
        onMouseEnter={open}
        onMouseLeave={close}
        ref={textElementRef}
        style={{
          width: '100%',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {children}
      </div>
    </Tooltip>
  )
}
