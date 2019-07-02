import React, { useState } from 'react'
import styled from 'styled-components'

const TOKEN_ICON_API = 'https://raw.githubusercontent.com/TrustWallet/tokens/master/tokens'
const BAD_IMAGES = {}

const Inline = styled.div`
  display: inline;
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
`

export default function TokenLogo({ address, size = '1rem', ...rest }) {
  const [error, setError] = useState(false)

  if (error || BAD_IMAGES[address]) {
    return <PlaceHolder size={size} />
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
