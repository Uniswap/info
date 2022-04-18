import { NetworkInfo, SUPPORTED_NETWORK_VERSIONS } from 'constants/networks'
import { useCallback, useRef, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useActiveNetwork } from 'state/features/application/hooks'
import { updateActiveNetwork } from 'state/features/application/slice'
import { NetworkSwitcherContainer, CurrentNetwork, NetworkList, NetworkListItem, NetworkLogo } from './styled'
import { useLocation } from 'react-use'
import { useNavigate } from 'react-router-dom'
import { useOnClickOutside } from 'hooks/useOnClickOutSide'

const NetworkSwitcher = () => {
  const activeNetwork = useActiveNetwork()
  const [isOpen, setIsOpen] = useState(false)
  const dispatch = useDispatch()
  const { pathname } = useLocation()
  const navigate = useNavigate()

  const handleSelect = useCallback(
    (network: NetworkInfo) => {
      const updatedPathName = pathname?.replace(activeNetwork.route, network.route)
      updatedPathName && navigate(updatedPathName)
      setIsOpen(false)
      dispatch(updateActiveNetwork(network))
    },
    [activeNetwork.route, pathname]
  )

  const node = useRef(null)
  useOnClickOutside(node, isOpen ? () => setIsOpen(false) : undefined)

  return (
    <NetworkSwitcherContainer>
      <CurrentNetwork onClick={() => setIsOpen(!isOpen)}>
        <NetworkLogo src={activeNetwork.imageURL} alt={activeNetwork.name} />
        <span>{activeNetwork.name}</span>
      </CurrentNetwork>
      {isOpen ? (
        <NetworkList ref={node}>
          {SUPPORTED_NETWORK_VERSIONS.map(network => (
            <NetworkListItem key={network.id} isBeta={network.route === 'trx'} onClick={() => handleSelect(network)}>
              <NetworkLogo src={network.imageURL} alt={network.name} />
              <span>{network.name}</span>
            </NetworkListItem>
          ))}
        </NetworkList>
      ) : null}
    </NetworkSwitcherContainer>
  )
}

export default NetworkSwitcher
