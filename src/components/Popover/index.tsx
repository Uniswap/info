import { Placement } from '@popperjs/core'
import { transparentize } from 'polished'
import React, { useState } from 'react'
import { usePopper } from 'react-popper'
import styled from 'styled-components'
import Portal from '@reach/portal'
import useInterval from '../../hooks'

const PopoverContainer = styled.div<{ show: boolean }>`
  z-index: 9999;

  visibility: ${(props) => (props.show ? 'visible' : 'hidden')};
  opacity: ${(props) => (props.show ? 1 : 0)};
  transition: visibility 150ms linear, opacity 150ms linear;

  background: ${({ theme }) => theme.bg2};
  border: 1px solid ${({ theme }) => theme.bg3};
  box-shadow: 0 4px 8px 0 ${({ theme }) => transparentize(0.9, theme.shadow1)};
  color: ${({ theme }) => theme.text2};
  border-radius: 8px;
`

const ReferenceElement = styled.div`
  display: inline-block;
`

export interface PopoverProps {
  content: React.ReactNode
  show: boolean
  children: React.ReactNode
  placement?: Placement
}

export default function Popover({ content, show, children, placement = 'auto' }: PopoverProps) {
  const [referenceElement, setReferenceElement] = useState<HTMLDivElement>(null)
  const [popperElement, setPopperElement] = useState<HTMLDivElement>(null)
  const [arrowElement] = useState<HTMLDivElement>(null)
  const { styles, update, attributes } = usePopper(referenceElement, popperElement, {
    placement,
    strategy: 'fixed',
    modifiers: [
      { name: 'offset', options: { offset: [8, 8] } },
      { name: 'arrow', options: { element: arrowElement } },
    ],
  })

  useInterval(update, show ? 100 : null)

  return (
    <>
      <ReferenceElement ref={setReferenceElement}>{children}</ReferenceElement>
      <Portal>
        <PopoverContainer show={show} ref={setPopperElement} style={styles.popper} {...attributes.popper}>
          {content}
          {/* <Arrow
            className={`arrow-${attributes.popper?.['data-popper-placement'] ?? ''}`}
            ref={setArrowElement}
            style={styles.arrow}
            {...attributes.arrow}
          /> */}
        </PopoverContainer>
      </Portal>
    </>
  )
}
