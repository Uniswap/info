import React from 'react'
import styled from 'styled-components'
import { X } from 'react-feather'

const Wrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
`

const CloseButtonWrapper = styled.div`
  cursor: pointer;
  color: ${({ theme }) => theme.text9};
`

const ModalHeaderTitle = styled.div`
  font-size: 16px;
  font-weight: bold;
  color: ${({ theme }) => theme.text9};
`

function ModalHeader({ title = undefined, onClose }) {
  return (
    <Wrapper>
      {title && <ModalHeaderTitle>{title}</ModalHeaderTitle>}

      <CloseButtonWrapper onClick={onClose}>
        <X size={16} />
      </CloseButtonWrapper>
    </Wrapper>
  )
}

export default ModalHeader
