import React from 'react'
import styled from 'styled-components'
import { Flex } from 'rebass'

import Link from '../Link'

import { formatAddress, formatDate } from '../../utils'

import { STATUS, STATUS_COLOR } from '../../constants'
import { ASSETS_MAP } from '../../constants/assets'
import FormattedName from '../FormattedName'
import TokenLogo from '../TokenLogo'

const TransactionWrapper = styled.div`
  .transaction-wrapper {
    position: absolute;
    right: 0.9em;
    width: 95%;
    height: 240px;
    border-radius: 10px;
    top: 3.5em;
    padding: 1em;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    -webkit-animation: scale-up-ver-top 0.4s cubic-bezier(0.39, 0.575, 0.565, 1) both;
    animation: scale-up-ver-top 0.4s cubic-bezier(0.39, 0.575, 0.565, 1) both;

    & > div,
    a {
      display: flex;
      justify-content: space-between;
      align-items: center;
      transition: height 1s;
      width: 300px;
      height: 28px;

      .label {
        color: #ff007a;
        width: 134px;
        text-align: left;
      }
    }

    img {
      width: 20px;
      height: 20px;
    }

    a {
      color: #2172e5;

      span {
        color: #ff007a;
        text-transform: capitalize;
      }
    }

    @-webkit-keyframes scale-up-ver-top {
      0% {
        -webkit-transform: scaleY(0.4);
        transform: scaleY(0.4);
        -webkit-transform-origin: 100% 0%;
        transform-origin: 100% 0%;
      }
      100% {
        -webkit-transform: scaleY(1);
        transform: scaleY(1);
        -webkit-transform-origin: 100% 0%;
        transform-origin: 100% 0%;
      }
    }
    @keyframes scale-up-ver-top {
      0% {
        -webkit-transform: scaleY(0.4);
        transform: scaleY(0.4);
        -webkit-transform-origin: 100% 0%;
        transform-origin: 100% 0%;
      }
      100% {
        -webkit-transform: scaleY(1);
        transform: scaleY(1);
        -webkit-transform-origin: 100% 0%;
        transform-origin: 100% 0%;
      }
    }
  }
`

const DataText = styled(Flex)`
  align-items: center;
  text-align: right;
  color: ${({ theme }) => theme.text1};

  & > * {
    font-size: 1em;
  }

  @media screen and (max-width: 40em) {
    font-size: 0.85rem;
  }
`

export default ({ transaction }) => {
  const {
    transactionHash,
    network,
    outputNetwork,
    status,
    blockNumber,
    expiration,
    sender,
    outputAddress,
    completenessTransactionHash,
    inputAmountNum,
    outputAmountNum
  } = transaction

  return (
    <TransactionWrapper>
      <div className="transaction-wrapper">
        <div>
          <Link color={'#ff007a'} external href={`${ASSETS_MAP[network].txExplorer}${transactionHash}`}>
            {
              <>
                <span>Transaction hash:</span> {formatAddress(transactionHash)}
              </>
            }
          </Link>
        </div>
        <div>
          <span className="label">Status:</span>
          <DataText>
            <span style={{ textTransform: 'capitalize', color: STATUS_COLOR[STATUS[status]] }}>
              {STATUS[status].toLowerCase()}
            </span>
          </DataText>
        </div>
        <div>
          <span className="label">Sent:</span>
          <DataText>
            {inputAmountNum}
            <FormattedName text={<TokenLogo token={network} />} maxCharacters={5} margin={true} />
          </DataText>
        </div>
        <div>
          <span className="label">Received:</span>
          <DataText>
            {outputAmountNum}
            <FormattedName text={<TokenLogo token={outputNetwork} />} maxCharacters={5} margin={true} />
          </DataText>
        </div>
        <div>
          <Link color={'#ff007a'} external href={`${ASSETS_MAP[network].addressExplorer}${sender}`}>
            {
              <>
                <span>From: </span> {formatAddress(sender)}
              </>
            }
          </Link>
        </div>
        <div>
          <Link color={'#ff007a'} external href={`${ASSETS_MAP[outputNetwork].addressExplorer}${outputAddress}`}>
            {
              <>
                <span>To: </span> {formatAddress(outputAddress)}
              </>
            }
          </Link>
        </div>
        <div>
          <span className="label">Block: </span>
          <DataText>{blockNumber}</DataText>
        </div>
        <div>
          <span className="label">Expiration: </span>
          <DataText>{formatDate(expiration)}</DataText>
        </div>

        {completenessTransactionHash && (
          <div>
            <Link
              color={'#ff007a'}
              external
              href={`${ASSETS_MAP[outputNetwork].txExplorer}${completenessTransactionHash}`}
            >
              {
                <>
                  <span>{STATUS[status].toLowerCase()}: </span> {formatAddress(completenessTransactionHash)}
                </>
              }
            </Link>
          </div>
        )}
      </div>
    </TransactionWrapper>
  )
}
