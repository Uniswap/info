import React from 'react'
import styled from 'styled-components'
import { Label, Radio } from '@rebass/forms'

const SortText = styled(Radio)`
  margin-right: 0.75rem;
  color: ${({ theme, checked }) => checked ? theme.primary1 : '#fff'} !important;
`

const WrapperFilterTxn = styled.div`
  padding-top: 0.25rem;
  display: flex;
`
const WrapperLabel = styled(Label)`
  color: ${({ theme }) => theme.white};
  width: auto !important;
  margin-right: 10px !important;
  cursor: pointer;
`

const TXN_TYPE = {
  ALL: 'All',
  SWAP: 'Swaps',
  ADD: 'Adds',
  REMOVE: 'Removes',
}

function FilterTxn({ txFilter, setTxFilter }) {
  return (
    <WrapperFilterTxn>
      <WrapperLabel>
        <SortText
          onClick={() => {
            setTxFilter(TXN_TYPE.ALL)
          }}
          checked={txFilter === TXN_TYPE.ALL}
        />
        All
      </WrapperLabel>
      <WrapperLabel
        sx={{
          color: 'white',
        }}
      >
        <SortText
          onClick={() => {
            setTxFilter(TXN_TYPE.SWAP)
          }}
          checked={txFilter === TXN_TYPE.SWAP}
        ></SortText>
        Swaps
      </WrapperLabel>
      <WrapperLabel>
        <SortText
          onClick={() => {
            setTxFilter(TXN_TYPE.ADD)
          }}
          checked={txFilter === TXN_TYPE.ADD}
        ></SortText>
        Adds
      </WrapperLabel>
      <WrapperLabel>
        <SortText
          onClick={() => {
            setTxFilter(TXN_TYPE.REMOVE)
          }}
          checked={txFilter === TXN_TYPE.REMOVE}
        ></SortText>
        Removes
      </WrapperLabel>
    </WrapperFilterTxn>
  )
}

export default FilterTxn
