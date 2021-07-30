import React, { useState, useEffect } from 'react'
import styled from 'styled-components'

import { ROPSTEN_TOKEN_LOGOS_MAPPING, WETH_ADDRESS, KNCL_ADDRESS } from '../../constants'
import { isAddress } from '../../utils/index.js'
import PlaceHolder from '../../assets/placeholder.png'
import EthereumLogo from '../../assets/eth.png'
import PolygonLogo from '../../assets/polygon.png'
import { getMaticTokenLogoURL } from '../../utils/maticTokenMapping'
import { getMumbaiTokenLogoURL } from '../../utils/mumbaiTokenMapping'

const BAD_IMAGES = {}

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

const StyledEthereumLogo = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  > img {
    width: ${({ size }) => size};
    height: ${({ size }) => size};
  }
`

export function getNativeTokenLogo({ size = '24px', ...rest }) {
  switch (process.env.REACT_APP_CHAIN_ID) {
    case '137':
      return (
        <StyledEthereumLogo size={size} {...rest}>
          <img
            src={PolygonLogo}
            style={{
              boxShadow: '0px 6px 10px rgba(0, 0, 0, 0.075)',
              borderRadius: '24px',
            }}
            alt=""
          />
        </StyledEthereumLogo>
      )
    case '80001':
      return (
        <StyledEthereumLogo size={size} {...rest}>
          <img
            src={PolygonLogo}
            style={{
              boxShadow: '0px 6px 10px rgba(0, 0, 0, 0.075)',
              borderRadius: '24px',
            }}
            alt=""
          />
        </StyledEthereumLogo>
      )
    default:
      return (
        <StyledEthereumLogo size={size} {...rest}>
          <img
            src={EthereumLogo}
            style={{
              boxShadow: '0px 6px 10px rgba(0, 0, 0, 0.075)',
              borderRadius: '24px',
            }}
            alt=""
          />
        </StyledEthereumLogo>
      )
  }
}

export default function TokenLogo({ address, header = false, size = '24px', ...rest }) {
  const [error, setError] = useState(false)

  useEffect(() => {
    setError(false)
  }, [address])

  if (error || BAD_IMAGES[address]) {
    return (
      <Inline>
        <Image {...rest} alt={''} src={PlaceHolder} size={size} />
      </Inline>
    )
  }

  if (address?.toLowerCase() === WETH_ADDRESS) {
    return getNativeTokenLogo({ size, ...rest })
  }

  if (address?.toLowerCase() === KNCL_ADDRESS.toLowerCase()) {
    return (
      <Inline>
        <Image
          {...rest}
          alt={''}
          src="https://i.imgur.com/1cDH5dy.png"
          size={size}
          onError={(event) => {
            BAD_IMAGES[address] = true
            setError(true)
            event.preventDefault()
          }}
        />
      </Inline>
    )
  }

  // MFG new logo
  if (address?.toLowerCase() === '0x6710c63432a2de02954fc0f851db07146a6c0312') {
    return (
      <Inline>
        <Image
          {...rest}
          alt={''}
          src="https://i.imgur.com/oReNLqf.png"
          size={size}
          onError={(event) => {
            BAD_IMAGES[address] = true
            setError(true)
            event.preventDefault()
          }}
        />
      </Inline>
    )
  }

  // RICE logo
  if (address?.toLowerCase() === '0xbcd515d6c5de70d3a31d999a7fa6a299657de294') {
    return (
      <Inline>
        <Image
          {...rest}
          alt={''}
          src="https://drive.google.com/uc?export=download&id=16PVXI1Da5P27cywWiyqrcV-Q17u1aXsi"
          size={size}
          onError={(event) => {
            BAD_IMAGES[address] = true
            setError(true)
            event.preventDefault()
          }}
        />
      </Inline>
    )
  }

  let path

  switch (String(process.env.REACT_APP_CHAIN_ID)) {
    case '3':
      if (ROPSTEN_TOKEN_LOGOS_MAPPING[address?.toLowerCase()]) {
        address = ROPSTEN_TOKEN_LOGOS_MAPPING[address?.toLowerCase()]
      }

      path = `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${isAddress(
        address
      )}/logo.png`
      break
    case '137':
      path = getMaticTokenLogoURL(address)
      break
    case '80001':
      path = getMumbaiTokenLogoURL(address)
      break
    default:
      // hard coded fixes for trust wallet api issues
      if (address?.toLowerCase() === '0x5e74c9036fb86bd7ecdcb084a0673efc32ea31cb') {
        address = '0x42456d7084eacf4083f1140d3229471bba2949a8'
      }

      if (address?.toLowerCase() === '0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f') {
        address = '0xc011a72400e58ecd99ee497cf89e3775d4bd732f'
      }

      path = `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${isAddress(
        address
      )}/logo.png`
      break
  }

  return (
    <Inline>
      <Image
        {...rest}
        alt={''}
        src={path}
        size={size}
        onError={(event) => {
          BAD_IMAGES[address] = true
          setError(true)
          event.preventDefault()
        }}
      />
    </Inline>
  )
}
