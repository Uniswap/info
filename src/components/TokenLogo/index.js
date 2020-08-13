import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { isAddress } from '../../helpers/index.js'
import PlaceHolder from '../../assets/placeholder.png'
import EthereumLogo from '../../assets/eth.png'
import { getLogoUrlList } from '../../helpers/index'
import { ETH } from '../../helpers'

const BAD_IMAGES = {}
const FALLBACK_URIS = {}

const Inline = styled.div`
  display: flex;
  align-items: center;
  align-self: center;
`

const Image = styled.img`
  width: ${({ size }) => size};
  height: ${({ size }) => size};
  border-radius: 1rem;
  box-shadow: 0px 6px 10px rgba(0, 0, 0, 0.075);
`

const StyledEthereumLogo = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  > img {
    width: ${({ size }) => size};
    height: ${({ size }) => size};
  }
`

export default function TokenLogo({ address, header = false, size = '24px', ...rest }) {
  const [error, setError] = useState(false)

  useEffect(() => {
    setError(false)
  }, [address])

  if (error) {
    return (
      <Inline>
        <Image {...rest} alt={''} src={PlaceHolder} size={size} />
      </Inline>
    )
  }

  // hard coded fixes for trust wallet api issues
  if (address?.toLowerCase() === '0x5e74c9036fb86bd7ecdcb084a0673efc32ea31cb') {
    address = '0x42456d7084eacf4083f1140d3229471bba2949a8'
  }

  if (address?.toLowerCase() === '0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f') {
    address = '0xc011a72400e58ecd99ee497cf89e3775d4bd732f'
  }

  if (address?.toLowerCase() === ETH) {
    return (
      <StyledEthereumLogo size={size} {...rest}>
        <img
          src={EthereumLogo}
          style={{ boxShadow: '0px 6px 10px rgba(0, 0, 0, 0.075)', borderRadius: '24px' }}
          alt=""
        />
      </StyledEthereumLogo>
    )
  }

  const urlList = getLogoUrlList(isAddress(address))
  let uri
  if (!uri) {
    const defaultUri = urlList[0]
    if (!BAD_IMAGES[defaultUri]) {
      uri = defaultUri
    }
    if (FALLBACK_URIS[address]) {
      uri = FALLBACK_URIS[address]
    }
  }

  return (
    <Inline>
      <Image
        {...rest}
        alt={''}
        src={uri}
        size={size}
        onError={event => {
          if (FALLBACK_URIS[address]) {
            BAD_IMAGES[address] = true
            setError(true)
            event.preventDefault()
          } else {
            FALLBACK_URIS[address] = urlList[1]
          }
        }}
      />
    </Inline>
  )
}
