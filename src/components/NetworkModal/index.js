import React, { useRef, useState } from 'react'
import styled from 'styled-components'

import { ApplicationModal, useModalOpen, useToggleNetworkModal } from '../../contexts/Application'
import Modal from '../Modal'
import ModalHeader from '../ModalHeader'
import { ButtonEmpty } from '../ButtonStyled'
import { useOnClickOutside } from '../../hooks'
import { NetworksInfoEnv, useNetworksInfo } from '../../contexts/NetworkInfo'
import { Link, useHistory, useParams } from 'react-router-dom'
import Kyber from '../Icons/Kyber'
import { ChainId } from '../../constants/networks'

const ModalContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 30px 22px 28px 24px;
  width: 100%;
  background-color: ${({ theme }) => theme.bg6};
`

const NetworkList = styled.div`
  width: 100%;
  display: grid;
  grid-gap: 1rem;
  grid-template-columns: repeat(3, auto);
  justify-content: space-between;
  overflow: auto;
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    grid-template-columns: 1fr 1fr;
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
  border: 1px solid transparent;

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
const TabWrapper = styled.div`
  border-radius: 999px;
  background: ${({ theme }) => theme.buttonBlack};
  display: flex;
  width: 100%;
  margin-bottom: 28px;
`
const TabItem = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  border-radius: 999px;
  background: ${({ theme, active }) => (!active ? theme.buttonBlack : theme.primary)};
  color: ${({ theme, active }) => (active ? theme.textReverse : theme.subText)};
  cursor: pointer;
  font-weight: 500;
  font-size: 16px;
`
const LinkWrapper = styled.a`
  text-decoration: none;
  :hover {
    cursor: pointer;
    opacity: 0.7;
  }
  color: ${({ theme }) => theme.subText};
`

export default function NetworkModal() {
  const [networksInfo] = useNetworksInfo()
  const networkModalOpen = useModalOpen(ApplicationModal.NETWORK)
  const toggleNetworkModal = useToggleNetworkModal()
  const node = useRef()
  useOnClickOutside(node, networkModalOpen ? toggleNetworkModal : undefined)
  const history = useHistory()
  const { network: currentNetworkURL } = useParams()
  const [tab, setTab] = useState('Classic')
  const networkListToShow = [...NetworksInfoEnv]
  if (tab === 'Classic')
    //todo namgold: remove above if line
    networkListToShow.unshift({ name: 'All Chains', icon: Kyber })

  return (
    <Modal isOpen={networkModalOpen} onDismiss={toggleNetworkModal} maxWidth='624px'>
      <ModalContentWrapper ref={node}>
        <ModalHeader onClose={toggleNetworkModal} title='Select a Network' />

        <TabWrapper>
          <TabItem active={tab === 'Elastic'} role='button' onClick={() => setTab('Elastic')}>
            Elastic Analytics
          </TabItem>
          <TabItem active={tab === 'Classic'} role='button' onClick={() => setTab('Classic')}>
            Classic Analytics
          </TabItem>
        </TabWrapper>

        <NetworkList>
          {networkListToShow.map((network, index) => {
            const selected =
              (networksInfo[1] && network.name === 'All Chains') ||
              (!networksInfo[1] && networksInfo[0].chainId === network.chainId)

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
            if (tab === 'Classic') {
              return (
                <Link to={linkTo} key={network.name}>
                  <SelectNetworkButton
                    padding='0'
                    onClick={() => {
                      toggleNetworkModal()
                    }}
                  >
                    <ListItem selected={selected}>
                      {typeof network.icon === 'string' ? (
                        <img src={network.icon} alt='Logo' style={{ width: '2rem', marginRight: '1rem' }} />
                      ) : (
                        <network.icon
                          color={selected ? 'black' : undefined}
                          width='2rem'
                          height='2rem'
                          style={{ marginRight: '1rem' }}
                        />
                      )}
                      <NetworkLabel selected={selected}>{network.name}</NetworkLabel>
                    </ListItem>
                  </SelectNetworkButton>
                </Link>
              )
            } else {
              if (network.chainId === ChainId.AURORA) return undefined
              return (
                <a href={'/elastic' + linkTo} key={network.name}>
                  <SelectNetworkButton
                    padding='0'
                    onClick={() => {
                      toggleNetworkModal()
                    }}
                  >
                    <ListItem selected={selected}>
                      {typeof network.icon === 'string' ? (
                        <img src={network.icon} alt='Logo' style={{ width: '2rem', marginRight: '1rem' }} />
                      ) : (
                        <network.icon
                          color={selected ? 'black' : undefined}
                          width='2rem'
                          height='2rem'
                          style={{ marginRight: '1rem' }}
                        />
                      )}
                      <NetworkLabel selected={selected}>{network.name}</NetworkLabel>
                    </ListItem>
                  </SelectNetworkButton>
                </a>
              )
            }
          })}
        </NetworkList>
      </ModalContentWrapper>
    </Modal>
  )
}
