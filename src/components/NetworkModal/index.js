import React, { useRef } from 'react'
import styled from 'styled-components'

import { ApplicationModal, useModalOpen, useToggleNetworkModal } from '../../contexts/Application'
import Modal from '../Modal'
import ModalHeader from '../ModalHeader'
import { ButtonEmpty } from '../ButtonStyled'
import { useOnClickOutside } from '../../hooks'
import { NetworksInfoEnv, useNetworksInfo } from '../../contexts/NetworkInfo'
import { Link, useHistory, useParams } from 'react-router-dom'
import Kyber from '../Icons/Kyber'

const ModalContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 30px 22px 28px 24px;
  width: 100%;
  background-color: ${({ theme }) => theme.bg6};
`

const InstructionText = styled.div`
  margin-bottom: 24px;
  font-size: 14px;
  color: ${({ theme }) => theme.text9};
`

const NetworkList = styled.div`
  width: 100%;
  display: grid;
  grid-gap: 1rem;
  grid-template-columns: repeat(3, auto);
  justify-content: space-between;

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    grid-template-columns: 1fr;
    width: 100%;
  `};
`

const ListItem = styled.div`
  width: 100%;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding: 8px 16px;
  border-radius: 8px;
  background-color: ${({ theme, selected }) => (selected ? theme.primary : theme.buttonBlack)};
`

const NetworkLabel = styled.span`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme, selected }) => (selected ? theme.textReverse : theme.text)};
`

const SelectNetworkButton = styled(ButtonEmpty)`
  width: 100%;
  background-color: transparent;
  color: ${({ theme }) => theme.primary1};
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0;

  &:focus {
    text-decoration: none;
  }
  &:hover {
    text-decoration: none;
    border: 1px solid ${({ theme }) => theme.primary1};
    border-radius: 8px;
  }
  &:active {
    text-decoration: none;
  }
  &:disabled {
    opacity: 50%;
    cursor: not-allowed;
  }
`

export default function NetworkModal() {
  const [networksInfo] = useNetworksInfo()
  const networkModalOpen = useModalOpen(ApplicationModal.NETWORK)
  const toggleNetworkModal = useToggleNetworkModal()
  const node = useRef()
  useOnClickOutside(node, networkModalOpen ? toggleNetworkModal : undefined)
  const history = useHistory()
  const { network: currentNetworkURL } = useParams()

  return (
    <Modal isOpen={networkModalOpen} onDismiss={toggleNetworkModal} maxWidth='624px'>
      <ModalContentWrapper ref={node}>
        <ModalHeader onClose={toggleNetworkModal} title='Select a Network' />

        <NetworkList>
          {[{ name: 'All Chains', icon: Kyber }, ...NetworksInfoEnv].map((network, index) => {
            if (
              (networksInfo[1] && network.name == 'All Chains') ||
              (!networksInfo[1] && networksInfo[0].chainId === network.chainId)
            ) {
              return (
                <SelectNetworkButton key={network.name} padding='0'>
                  <ListItem selected>
                    {typeof network.icon == 'string' ? (
                      <img src={network.icon} alt='Logo' style={{ width: '2rem', marginRight: '1rem' }} />
                    ) : (
                      <network.icon color='black' width='2rem' height='2rem' style={{ marginRight: '1rem' }} />
                    )}
                    <NetworkLabel selected>{network.name}</NetworkLabel>
                  </ListItem>
                </SelectNetworkButton>
              )
            }

            let currentUrl = currentNetworkURL
              ? history.location.pathname.split('/').slice(2).join('/')
              : history.location.pathname.split('/').slice(1).join('/')
            // Temporary solution for switch chain from token/pair/... detail page
            // Currently we redirect to new chain with current address
            // But that will causing 404 because each token on each chain has different address
            // E.g: Token Tether USDT on BSC has address: 0x000 and on Fantom: 0x111, correct addresses are /bsc/0x000 and /fantom/0x111
            // When changing network from BSC to Fantom, we redirect from /bsc/0x000 to /fantom/0x000 and that will causing 404
            // So we have temporary solution that always redirect to token/pair/... list when we are current at token/pair/... detail
            // TODO: Find current token/pair's new address on new chain. If it's not existing, redirect to token/pair/... list
            switch (currentUrl.split('/')[0]) {
              case 'token':
                currentUrl = 'tokens'
                break
              case 'pair':
                currentUrl = 'pairs'
                break
              case 'pool':
                currentUrl = 'pairs'
                break
              case 'account':
                currentUrl = 'accounts'
                break
            }
            const linkTo = (network.urlKey ? `/${network.urlKey}` : '') + '/' + currentUrl
            return (
              <Link to={linkTo} key={network.name}>
                <SelectNetworkButton
                  padding='0'
                  onClick={() => {
                    toggleNetworkModal()
                  }}
                >
                  <ListItem>
                    {typeof network.icon == 'string' ? (
                      <img src={network.icon} alt='Logo' style={{ width: '2rem', marginRight: '1rem' }} />
                    ) : (
                      <network.icon width='2rem' height='2rem' style={{ marginRight: '1rem' }} />
                    )}
                    <NetworkLabel>{network.name}</NetworkLabel>
                  </ListItem>
                </SelectNetworkButton>
              </Link>
            )
          })}
        </NetworkList>
      </ModalContentWrapper>
    </Modal>
  )
}
