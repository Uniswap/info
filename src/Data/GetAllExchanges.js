import React, { useEffect, useState } from 'react'
import { client } from '../apollo/client'
import styled from 'styled-components'
import { DIRECTORY_QUERY } from '../apollo/queries'
import { hardcodedExchanges } from '../constants/exchanges'
import TokenLogo from '../components/TokenLogo'

const StyledTokenLogo = styled(TokenLogo)`
  margin-left: 0;
  margin-right: 1rem;
  height: 34px;
  width: 34px;
  border-radius: 50%;
  border: 2px solid white;
  background-color: white;
  display: flex;
  align-itmes: center;
  justify-content: center;
`

export function useAllExchanges() {
  const [exchanges, setExchanges] = useState([])

  useEffect(() => {
    const fetchAllExchanges = async function() {
      let exchanges = {}
      let data = []
      try {
        let dataEnd = false
        let skip = 0
        while (!dataEnd) {
          let result = await client.query({
            query: DIRECTORY_QUERY,
            variables: {
              first: 100,
              skip: skip
            }
          })
          data = data.concat(result.data.exchanges)
          skip = skip + 100
          if (result.data.exchanges.length !== 100) {
            dataEnd = true
          }
        }
      } catch (err) {
        console.log('error: ', err)
      }
      data.forEach(exchange => {
        if (exchange.tokenAddress === '0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359') {
          exchange.tokenSymbol = 'SAI'
        }
        if (exchange.tokenAddress === '0xf5dce57282a584d2746faf1593d3121fcac444dc') {
          exchange.tokenSymbol = 'cSAI'
          exchange.tokenName = 'Compound SAI'
        }
        exchange.label = buildDirectoryLabel(exchange)
        const logo = <TokenLogo address={exchange.tokenAddress} style={{ height: '20px', width: '20px' }} />
        const logoStyled = <StyledTokenLogo address={exchange.tokenAddress} header={true} size={30} />
        exchange.logo = logo
        exchange.logoStyled = logoStyled
        exchanges[exchange.id] = exchange
      })
      setExchanges(exchanges)
    }
    fetchAllExchanges()
  }, [])
  return exchanges
}

// build the label for dropdown
const buildDirectoryLabel = exchange => {
  let { tokenSymbol, id, tokenAddress } = exchange
  const exchangeAddress = id

  // custom handling for UI
  if (tokenSymbol === null) {
    if (hardcodedExchanges.hasOwnProperty(exchangeAddress.toUpperCase())) {
      tokenSymbol = hardcodedExchanges[exchangeAddress.toUpperCase()].symbol
    } else {
      tokenSymbol = 'unknown'
    }
  }

  return {
    label: tokenSymbol,
    value: exchangeAddress,
    tokenAddress: tokenAddress
  }
}
