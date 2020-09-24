import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { isAddress } from '../../utils/index.js'
import wEthLogo from '../../assets/weth.svg'
import daiLogo from '../../assets/dai.svg'
import market from '../../assets/market.png'
import { WETH, DAI } from '../../constants/index.js'
import { getCashAddress } from '../../contexts/Application.js'

const BAD_IMAGES = {}

const Inline = styled.div`
  display: flex;
  align-items: center;
  align-self: center;
`

const Image = styled.img`
  width: ${({ size }) => size};
  height: ${({ size }) => size};
  background: #2b2c2c;
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
    background: #2b2c2c;
  }
`

export default function TokenLogo({ address, header = false, size = '24px', ...rest }) {
  const weth_address = getCashAddress(WETH)
  const dai_address = getCashAddress(DAI)
  const [error, setError] = useState(false)

  useEffect(() => {
    setError(false)
  }, [address])

  if (address?.toLowerCase() === weth_address.toLowerCase()) {
    return (
      <StyledEthereumLogo size={size} {...rest}>
        <img src={wEthLogo} style={{ borderRadius: '24px' }} alt="Trading token" />
      </StyledEthereumLogo>
    )
  }

  if (address?.toLowerCase() === dai_address.toLowerCase()) {
    return (
      <StyledEthereumLogo size={size} {...rest}>
        <img src={daiLogo} style={{ borderRadius: '24px' }} alt="Trading token" />
      </StyledEthereumLogo>
    )
  }

  if (error || BAD_IMAGES[address]) {
    return (
      <Inline>
        <Image src={market} style={{ borderRadius: '24px' }} alt="Augur Market" />
      </Inline>
    )
  }

  const path = `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${isAddress(
    address
  )}/logo.png`

  return (
    <Inline>
      <Image
        {...rest}
        alt={''}
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
