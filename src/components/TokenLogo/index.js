import { useState, useEffect } from 'react'
import styled from 'styled-components/macro'
import { getTokenLogoUrl } from '../../utils'
import { HelpCircle } from 'react-feather'
import { useActiveNetworkId } from 'state/features/application/selectors'

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

export default function TokenLogo({ address, size = '24px', alt = 'token', ...rest }) {
  const [error, setError] = useState(false)
  const activeNetworkId = useActiveNetworkId()
  const path = getTokenLogoUrl(activeNetworkId, address)

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
