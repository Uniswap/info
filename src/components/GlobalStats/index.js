import React from 'react'
import styled from 'styled-components'
import { RowFixed, RowBetween } from '../Row'
import { useMedia } from 'react-use'
import { localNumber } from '../../utils'

import { TYPE } from '../../Theme'
import { useHistoryCount } from '../../contexts/History'

const Header = styled.div`
  width: 100%;
  position: sticky;
  top: 0;
`

const Medium = styled.span`
  font-weight: 500;
`

export default function GlobalStats() {
  const below1180 = useMedia('(max-width: 1180px)')
  const below816 = useMedia('(max-width: 816px)')

  const totalTxns = useHistoryCount()

  return (
    <Header>
      <RowBetween style={{ padding: below816 ? '0.5rem' : '.5rem' }}>
        <RowFixed>
          {!below1180 && (
            <TYPE.main mr={'1rem'}>
              Transactions: <Medium>{localNumber(totalTxns)}</Medium>
            </TYPE.main>
          )}
        </RowFixed>
      </RowBetween>
    </Header>
  )
}
