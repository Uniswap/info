import styled from 'styled-components'
import { Box } from 'rebass'

const Dashboard = styled(Box)`
  max-width: 1280px;

  display: grid;

  grid-template-areas:
    'volume'
    'statistics'
    'liquidity'
    'exchange'
    'transactions';

  @media screen and (min-width: 40em) {
    grid-gap: 16px;
    grid-template-columns: repeat(2, 1fr);
    grid-template-areas:
      'volume liquidity'
      'statistics statistics'
      'exchange exchange'
      'transactions transactions';
  }

  @media screen and (min-width: 64em) {
    grid-gap: 24px;
    grid-template-columns: minmax(380px, 1fr) repeat(3, 1fr);
    grid-template-areas:
      'volume statistics statistics statistics'
      'liquidity statistics statistics statistics'
      'exchange transactions transactions transactions';
  }
`

export default Dashboard
