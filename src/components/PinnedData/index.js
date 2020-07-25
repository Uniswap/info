import React from 'react'
import { withRouter } from 'react-router-dom'
import { RowBetween, RowFixed } from '../Row'
import { AutoColumn } from '../Column'
import { TYPE } from '../../Theme'
import Panel from '../Panel'
import { ButtonFaded } from '../ButtonStyled'
import { useSavedPairs, useSavedTokens } from '../../contexts/LocalStorage'
import { X } from 'react-feather'
import { Hover } from '..'
import TokenLogo from '../TokenLogo'

function WalletPreview({ history }) {
  const [savedPairs, , removePair] = useSavedPairs()

  const [savedTokens, , removeToken] = useSavedTokens()

  return (
    <AutoColumn gap="1rem">
      <Panel>
        <AutoColumn gap="20px">
          <AutoColumn gap={'12px'}>
            <TYPE.main>Pinned Pairs</TYPE.main>
            {Object.keys(savedPairs).filter(key => {
              return !!savedPairs[key]
            }).length > 0 ? (
              Object.keys(savedPairs)
                .filter(address => {
                  return !!savedPairs[address]
                })
                .map(address => {
                  const pair = savedPairs[address]
                  return (
                    <RowBetween key={pair.address}>
                      <ButtonFaded onClick={() => history.push('/pair/' + address)}>
                        <RowFixed>
                          <TYPE.header>
                            {pair.token0Symbol} / {pair.token1Symbol}
                          </TYPE.header>
                        </RowFixed>
                      </ButtonFaded>
                      <Hover onClick={() => removePair(pair.address)}>
                        <X size={16} />
                      </Hover>
                    </RowBetween>
                  )
                })
            ) : (
              <TYPE.small>Pinned pairs will appear here.</TYPE.small>
            )}
          </AutoColumn>
          <AutoColumn gap={'12px'}>
            <TYPE.main>Pinned Tokens</TYPE.main>
            {Object.keys(savedTokens).filter(key => {
              return !!savedTokens[key]
            }).length > 0 ? (
              Object.keys(savedTokens)
                .filter(address => {
                  return !!savedTokens[address]
                })
                .map(address => {
                  const token = savedTokens[address]
                  return (
                    <RowBetween key={address}>
                      <ButtonFaded onClick={() => history.push('/token/' + address)}>
                        <RowFixed>
                          <TokenLogo address={address} size={'14px'} />
                          <TYPE.header ml={'6px'}>{token.symbol}</TYPE.header>
                        </RowFixed>
                      </ButtonFaded>
                      <Hover onClick={() => removeToken(address)}>
                        <X size={16} />
                      </Hover>
                    </RowBetween>
                  )
                })
            ) : (
              <TYPE.small>Pinned pairs will appear here.</TYPE.small>
            )}
          </AutoColumn>
        </AutoColumn>
      </Panel>
    </AutoColumn>
  )
}

export default withRouter(WalletPreview)
