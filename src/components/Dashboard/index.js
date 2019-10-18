import styled from 'styled-components'
import { Box } from 'rebass'

const Dashboard = styled(Box)`
  width: 100%;
  display: grid;
  padding-right: 20px;
  padding-left: 20px;
  grid-template-columns: 100%;
  grid-template-areas:
    'volume'
    'liquidity'
    'shares'
    'statistics'
    'exchange'
    'transactions';

  @media screen and (min-width: 64em) {
    max-width: 1280px;
    grid-gap: 24px;
    padding-right: 20px;
    padding-left: 20px;
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
