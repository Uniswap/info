import React from 'react'
import styled from 'styled-components'

import { NETWORK_ICON, NETWORK_LABEL } from '../../constants/networks'
import { ButtonOutlined } from '../ButtonStyled'
import { useToggleNetworkModal } from '../../contexts/Application'
import SwitchNetworkIcon from '../../assets/networks/switch-network.svg'

const ButtonWrapper = styled(ButtonOutlined)`
  width: 100%;
  min-width: 170px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid #40505a;
`

const NetworkWrapper = styled.div`
  display: flex;
  align-items: center;
`

const NetworkLabel = styled.span`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.text8};
`

const SwitchNetworkButton = () => {
  const chainId = parseInt(process.env.REACT_APP_CHAIN_ID)

  const toggleNetworkModal = useToggleNetworkModal()

  if (![1, 137, 56].includes(chainId)) {
    return null
  }

  return (
    <ButtonWrapper onClick={toggleNetworkModal}>
      <NetworkWrapper>
        <img src={NETWORK_ICON[chainId]} alt="Network Icon" style={{ width: '20px', marginRight: '10px' }} />
        <NetworkLabel>{NETWORK_LABEL[chainId]}</NetworkLabel>
      </NetworkWrapper>
      <img src={SwitchNetworkIcon} alt="Switch Network Icon" />
    </ButtonWrapper>
  )
}

export default SwitchNetworkButton
