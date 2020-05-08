import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { isAddress } from '../../helpers/index.js'

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

const PlaceHolder = styled.span`
  width: ${({ size }) => size};
  height: ${({ size }) => size};
  border-radius: 1rem;
  display: flex;
  align-items: center;
  justify-items: center;
`

export default function TokenLogo({ address, header = false, size = '1rem', ...rest }) {
  address = '0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359'

  const [error, setError] = useState(false)

  useEffect(() => {
    setError(false)
  }, [address])

  if (error || BAD_IMAGES[address]) {
    return (
      <PlaceHolder size={size} header={header}>
        <span role="img" aria-label="thinking" alt="">
          🤔
        </span>
      </PlaceHolder>
    )
  }

  // hard coded fixes for trust wallet api issues
  if (address.toLowerCase() === '0x5e74c9036fb86bd7ecdcb084a0673efc32ea31cb') {
    address = '0x42456d7084eacf4083f1140d3229471bba2949a8'
  }

  if (address.toLowerCase() === '0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f') {
    address = '0xc011a72400e58ecd99ee497cf89e3775d4bd732f'
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
