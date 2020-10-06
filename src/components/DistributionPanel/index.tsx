import React, { useContext, useState } from 'react'
import styled, { ThemeContext } from 'styled-components'
import { darken } from 'polished'
import { RowBetween } from '../Row'
import { TYPE } from '../../Theme'
import { Input as NumericalInput } from '../NumericalInput'
import { useTranslation } from 'react-i18next'
import { AutoColumn } from '../Column'

const InputRow = styled.div<{ disabled: boolean }>`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: center;
  color: ${({ disabled, theme }) => (disabled ? darken(0.2, theme.text2) : theme.text2)};
  padding: 0.25rem;
`

const LabelRow = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: center;
  color: ${({ theme }) => theme.text1};
  font-size: 0.75rem;
  line-height: 1rem;
  padding: 0.75rem 1rem 0 1rem;
  span:hover {
    cursor: pointer;
    color: ${({ theme }) => darken(0.2, theme.text2)};
  }
`

const InputPanel = styled.div<{ hideInput?: boolean }>`
  ${({ theme }) => theme.flexColumnNoWrap}
  border-radius: ${({ hideInput }) => (hideInput ? '8px' : '20px')};
  border: ${({ theme }) => `1px solid ${theme.bg2}`};
  z-index: 1;
  height: 78px;
  width: 200px;
`

interface DistributionPanelProps {
  updateDistribution: Function
  disableDistributionInputs?: boolean
  currentDistribution: number[]
  id: string
}

export default function DistributionPanel({
  updateDistribution,
  disableDistributionInputs = false,
  currentDistribution = [50, 50],
  id
}: DistributionPanelProps) {
  const YES = 'YES'
  const YES_ID = 0
  const NO = 'NO'
  const NO_ID = 1
  const { t } = useTranslation()
  const theme = useContext(ThemeContext)
  const [yesInput, setYesInput] = useState(currentDistribution[YES_ID])
  const [noInput, setNoInput] = useState(currentDistribution[NO_ID])

  const setDistributionInput = (value: number, type) => {
    if (isNaN(value)) {
      setYesInput(0)
      setNoInput(0)
    }
    if (type === YES) {
      setYesInput(value)
      setNoInput(100 - value)
    }

    if (type === NO) {
      setNoInput(value)
      setYesInput(100 - value)
    }
    updateDistribution([yesInput, noInput])
  }
  return (
    <>
      <RowBetween>
        <AutoColumn>
          <InputPanel>
            <TYPE.light fontSize={12} style={{ padding: '0.75rem' }}>
              Yes
            </TYPE.light>
            <RowBetween style={{ padding: '0.25rem 0.75rem' }}>
              <NumericalInput
                style={{ fontSize: '24px' }}
                value={yesInput}
                onUserInput={val => {
                  if (!isNaN(Number(val))) setDistributionInput(Number(val), YES)
                }}
              />
              <TYPE.light fontSize={18}>%</TYPE.light>
            </RowBetween>
          </InputPanel>
        </AutoColumn>
        <AutoColumn>
          <InputPanel>
            <TYPE.light fontSize={12} style={{ padding: '0.75rem' }}>
              No
            </TYPE.light>
            <RowBetween style={{ padding: '0.25rem 0.75rem' }}>
              <NumericalInput
                style={{ fontSize: '24px' }}
                value={noInput}
                onUserInput={val => {
                  if (!isNaN(Number(val))) setDistributionInput(Number(val), NO)
                }}
              />
              <TYPE.light fontSize={18}>%</TYPE.light>
            </RowBetween>
          </InputPanel>
        </AutoColumn>
      </RowBetween>
    </>
  )
}
