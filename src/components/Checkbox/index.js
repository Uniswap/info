import React from 'react'
import styled from 'styled-components'
import { TYPE } from '../../Theme'
import { RowFixed } from '../Row'

const StyleCheckbox = styled.input`
  background: ${({ theme }) => theme.bg2};

  :before {
    background: #f35429;
  }

  :hover {
    cursor: pointer;
  }
`

const ButtonText = styled(TYPE.main)`
  cursor: pointer;
  :hover {
    opacity: 0.6;
  }
`

const CheckBox = ({ checked, setChecked, text }) => {
  return (
    <RowFixed>
      <StyleCheckbox name="checkbox" type="checkbox" checked={checked} onChange={setChecked} />
      <ButtonText ml={'4px'} onClick={setChecked}>
        {text}
      </ButtonText>
    </RowFixed>
  )
}

export default CheckBox
