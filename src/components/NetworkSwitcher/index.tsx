import { NetworkInfo, SUPPORTED_NETWORK_VERSIONS } from 'constants/networks'
import { useCallback, useRef, useState } from 'react'
import { useDispatch } from 'react-redux'
import { updateActiveNetwork } from 'state/features/application/slice'
import {
  NetworkSwitcherContainer,
  CurrentNetwork,
  NetworkList,
  NetworkListItem,
  NetworkLogo,
  NetworkName,
  NetworkBlurb
} from './styled'
import { useLocation } from 'react-use'
import { useNavigate } from 'react-router-dom'
import { useOnClickOutside } from 'hooks/useOnClickOutSide'
import { useActiveNetwork } from 'state/features/application/hooks'
import ApiService from 'api/ApiService'

const NetworkSwitcher = () => {
  const activeNetwork = useActiveNetwork()
  const [isOpen, setIsOpen] = useState(false)
  const dispatch = useDispatch()
  const { pathname } = useLocation()
  const navigate = useNavigate()

  const handleSelect = useCallback(
    (network: NetworkInfo) => {
      navigate(`${network.route}/`)
      setIsOpen(false)
      dispatch(updateActiveNetwork(network))
      ApiService.setActiveNetwork(network.id)
    },
    [activeNetwork.route, pathname]
  )

  const node = useRef(null)
  useOnClickOutside(node, isOpen ? () => setIsOpen(false) : undefined)

  return (
    <NetworkSwitcherContainer>
      <CurrentNetwork onClick={() => setIsOpen(!isOpen)}>
        <NetworkLogo src={activeNetwork.imageURL} alt={activeNetwork.name} />
        <NetworkName>{activeNetwork.name}</NetworkName>
      </CurrentNetwork>
      {isOpen ? (
        <NetworkList ref={node}>
          {SUPPORTED_NETWORK_VERSIONS.map(network => (
            <NetworkListItem key={network.id} onClick={() => handleSelect(network)}>
              <NetworkLogo src={network.imageURL} alt={network.name} />
              <span>{network.name}</span>
              {network.blurb ? <NetworkBlurb>{network.blurb}</NetworkBlurb> : undefined}
            </NetworkListItem>
          ))}
        </NetworkList>
      ) : null}
    </NetworkSwitcherContainer>
  )
}

export default NetworkSwitcher
