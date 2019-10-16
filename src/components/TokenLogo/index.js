import React, { useState, useEffect } from 'react'
import styled from 'styled-components'

const TOKEN_ICON_API = 'https://raw.githubusercontent.com/TrustWallet/tokens/master/tokens'
const BAD_IMAGES = {}

const Inline = styled.div`
  display: flex;
  align-items: center;
`

const Image = styled.img`
  width: ${({ size }) => size};
  height: ${({ size }) => size};
  border-radius: 1rem;
`

const PlaceHolder = styled.div`
  width: ${({ size }) => size};
  height: ${({ size }) => size};
  border-radius: 1rem;
  display: flex;
  align-items: center;
`

export default function TokenLogo({ address, mkrLogo, size = '1rem', ...rest }) {
  const [error, setError] = useState(false)

  useEffect(() => {
    setError(false)
  }, [address])

  if (error || BAD_IMAGES[address]) {
    return (
      <PlaceHolder size={size}>
        <span role="img" aria-label="thinking" style={{ height: '20px', width: '30px' }}>
          🤔
        </span>
      </PlaceHolder>
    )
  }

  // hard coded fixes for trust wallet api issues
  if (address.toLowerCase() === '0x5e74c9036fb86bd7ecdcb084a0673efc32ea31cb') {
    address = '0x42456d7084eacf4083f1140d3229471bba2949a8'
  }

  const path = `${TOKEN_ICON_API}/${address.toLowerCase()}.png`

  return (
    <Inline>
      <Image
        {...rest}
        alt={address}
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
