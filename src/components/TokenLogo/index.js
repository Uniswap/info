import React, { useState, useEffect } from 'react'
import styled from 'styled-components'

import { isAddress } from '../../utils/index.js'
import { HelpCircle } from 'react-feather'

import { useWhitelistTokensMap } from '../../contexts/GlobalData'
import { useTokensList } from '../../contexts/NetworkInfo.js'

const BAD_IMAGES = {}

const Inline = styled.div`
  display: flex;
  align-items: center;
  align-self: center;
`

const Image = styled.img`
  width: ${({ size }) => size};
  height: ${({ size }) => size};
  border-radius: 50%;
`

const StyledNativeTokenLogo = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  > img {
    width: ${({ size }) => size};
    height: ${({ size }) => size};
  }
`

const StyledHelpCircle = styled(HelpCircle)`
  width: ${({ size }) => size};
  height: ${({ size }) => size};
  border-radius: ${({ size }) => size};
  box-shadow: 0px 6px 10px rgba(0, 0, 0, 0.075);
  color: ${({ theme }) => theme.text4};
  background-color: ${({ theme }) => theme.white};
`

export default function TokenLogo({ address, networkInfo, header = false, size = '24px', ...rest }) {
  const [error, setError] = useState(false)

  const { chainId } = networkInfo

  const tokensList = useTokensList()?.[chainId]
  const whiteListMap = useWhitelistTokensMap(chainId) || {}

  const formattedAddress = isAddress(address)

  const logoURI =
    whiteListMap?.[address]?.logoURI || whiteListMap?.[formattedAddress]?.logoURI || tokensList?.[formattedAddress]?.logoURI
  useEffect(() => {
    setError(false)
    BAD_IMAGES[networkInfo.chainId] && (BAD_IMAGES[networkInfo.chainId][address] = false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokensList])

  if (!networkInfo) return null

  if (error || BAD_IMAGES[networkInfo.chainId]?.[address] || !logoURI) {
    return (
      <Inline>
        <StyledHelpCircle size={size} {...rest} />
      </Inline>
    )
  }

  if (address?.toLowerCase() === networkInfo.wethAddress.toLowerCase()) {
    return (
      <StyledNativeTokenLogo size={size} {...rest}>
        <img
          src={networkInfo.nativeTokenLogo}
          style={{
            boxShadow: '0px 6px 10px rgba(0, 0, 0, 0.075)',
            borderRadius: '24px',
          }}
          alt=''
        />
      </StyledNativeTokenLogo>
    )
  }

  return (
    <Inline>
      <Image
        {...rest}
        alt={''}
        src={logoURI}
        size={size}
        onError={event => {
          BAD_IMAGES[chainId] = { ...BAD_IMAGES[chainId], [address]: true }
          setError(true)
          event.preventDefault()
        }}
      />
    </Inline>
  )
}
