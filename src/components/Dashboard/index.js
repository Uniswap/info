import styled from 'styled-components'
import { Box } from 'rebass'

const Dashboard = styled(Box)`
  max-width: 100vw;
  display: grid;
  grid-template-columns: 1fr;
  grid-template-areas:
    'volume'
    'liquidity'
    'shares'
    'exchange'
    'transactions';
    'statistics';

  @media screen and (min-width: 40em) {
    grid-gap: 16px;
    grid-template-columns: repeat(2, 1fr);
    grid-template-areas:
      'volume liquidity'
      'statistics statistics'
      'exchange exchange'
      'listOptions'
      'transactions transactions';
  }

  @media screen and (min-width: 64em) {
    max-width: 1280px;
    grid-gap: 24px;
    width: 100%;
    grid-template-columns: 1fr 1fr 1fr;
    grid-template-areas:
      'volume  liquidity  shares '
      'statistics  statistics exchange'
      'statistics  statistics exchange'
      'listOptions listOptions listOptions'
      'transactions  transactions transactions';
  }
`

export default Dashboard
