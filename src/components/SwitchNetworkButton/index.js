import React from 'react'
import styled from 'styled-components'

import { ButtonOutlined } from '../ButtonStyled'
import { useToggleNetworkModal } from '../../contexts/Application'
import SwitchNetworkIcon from '../../assets/networks/switch-network.svg'
import { useMedia } from 'react-use'
import { useNetworksInfo } from '../../contexts/NetworkInfo'
import Kyber from '../../assets/kyber.svg'

const ButtonWrapper = styled(ButtonOutlined)`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  border-radius: 8px;
  background: ${({ theme }) => theme.buttonBlack};
  border: none;
  z-index: 1000;

  &:hover {
    box-shadow: none;
  }
`

const NetworkWrapper = styled.div`
  display: flex;
  align-items: center;
`

const NetworkLabel = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.primary};
  margin-left: 10px;
`

const SwitchNetworkButton = () => {
  const [networksInfo] = useNetworksInfo()

  const toggleNetworkModal = useToggleNetworkModal()
  const below576 = useMedia('(max-width: 576px)')

  return (
    <ButtonWrapper onClick={toggleNetworkModal}>
      <NetworkWrapper>
        <img src={networksInfo[1] ? Kyber : networksInfo[0].icon} alt='Network Icon' style={{ width: '20px' }} />
        {!below576 && <NetworkLabel>{networksInfo[1] ? 'All Chains' : networksInfo[0].name}</NetworkLabel>}
      </NetworkWrapper>
      <img src={SwitchNetworkIcon} alt='Switch Network Icon' style={{ marginTop: '4px', marginLeft: '6px' }} />
    </ButtonWrapper>
  )
}

export default SwitchNetworkButton
