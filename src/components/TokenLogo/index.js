import { useState, useEffect } from 'react'
import styled from 'styled-components/macro'
import { isAddress } from '../../utils'
import { HelpCircle } from 'react-feather'
import { SupportedNetwork } from 'constants/networks'
import { useActiveNetworkId } from 'state/features/application/selectors'

const BAD_IMAGES = {}

const LOGO_SOURCE = {
  [SupportedNetwork.ETHEREUM]:
    'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets',
  [SupportedNetwork.TRON]: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/tron/assets'
}

function getLogoUrl(network, address) {
  return `${LOGO_SOURCE[network]}/${address}/logo.png`
}

const OVERRIDE_LOGO = {
  [SupportedNetwork.ETHEREUM]: {
    '0x5e74c9036fb86bd7ecdcb084a0673efc32ea31cb': `${LOGO_SOURCE.eth}/${isAddress(
      '0x42456d7084eacf4083f1140d3229471bba2949a8'
    )}/logo.png`,
    '0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f': `${LOGO_SOURCE.eth}/${isAddress(
      '0xc011a72400e58ecd99ee497cf89e3775d4bd732f'
    )}/logo.png`,
    '0x77b8ae2e83c7d044d159878445841e2a9777af38':
      'https://coin.top/production/upload/logo/THV4MnqnGk77YRDe3SPGzqFqC21cCjH2Fu.png',
    '0x0423d7c27d1dde7eb4aae02dae6b651c7225e6f9':
      'https://coin.top/production/upload/logo/THV4MnqnGk77YRDe3SPGzqFqC21cCjH2Fu.png'
  },
  [SupportedNetwork.TRON]: {}
}

const Inline = styled.div`
  display: flex;
  align-items: center;
  align-self: center;
`

const Image = styled.img`
  width: ${({ size }) => size};
  height: ${({ size }) => size};
  background-color: white;
  border-radius: 50%;
  box-shadow: 0px 6px 10px rgba(0, 0, 0, 0.075);
`

export default function TokenLogo({ address, size = '24px', alt = 'token', ...rest }) {
  const [error, setError] = useState(false)
  const activeNetworkId = useActiveNetworkId()
  const formattedAddress = isAddress(address)
  const path = OVERRIDE_LOGO[activeNetworkId][address?.toLowerCase()] || getLogoUrl(activeNetworkId, formattedAddress)

  useEffect(() => {
    setError(false)
  }, [address])

  if (error || BAD_IMAGES[address]) {
    return (
      <Inline>
        <HelpCircle {...rest} alt={alt} size={size} />
      </Inline>
    )
  }

  return (
    <Inline>
      <Image
        {...rest}
        alt={alt}
        src={path}
        size={size}
        onError={event => {
          BAD_IMAGES[address] = true
          setError(true)
          event.preventDefault()
        }}
      />
    </Inline>
  )
}
