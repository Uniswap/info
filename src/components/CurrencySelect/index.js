import React, { useState } from 'react'
import styled from 'styled-components'

const MobileSelect = styled.div`
  width: 65px;
  height: 38px;
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 32px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  font-size: 16px;
  color: white;

  :hover {
    cursor: pointer;
  }

  @media screen and (min-width: 40em) {
    display: none;
  }
`

const Select = styled.div`
  width: 130px;
  height: 38px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 32px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  font-weight: 500;
  font-size: 16px;
  color: white;

  :hover {
    cursor: pointer;
  }

  @media screen and (max-width: 40em) {
    display: none;
  }
`

const SelectOption = styled.div`
  width: 65px;
  height: 38px;
  background-color: ${props => (props.active ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0)')};
  border-radius: 32px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  font-size: 16px;
  color: white;
  user-select: none;
`

const CurrencySelect = ({ setCurrencyUnit, currencyUnit }) => {
  const [activeCurrency, setActiveCurrency] = useState(currencyUnit)

  const update = () => {
    if (currencyUnit === 'USD') {
      setCurrencyUnit('ETH')
      setActiveCurrency('ETH')
    } else {
      setCurrencyUnit('USD')
      setActiveCurrency('USD')
    }
  }

  return (
    <>
      <MobileSelect onClick={() => update()}> {currencyUnit} </MobileSelect>
      <Select onClick={() => update()}>
        <SelectOption active={activeCurrency === 'USD'} onClick={() => update()}>
          USD
        </SelectOption>
        <SelectOption active={activeCurrency === 'ETH'} onClick={() => update()}>
          ETH
        </SelectOption>
      </Select>
    </>
  )
}

export default CurrencySelect
