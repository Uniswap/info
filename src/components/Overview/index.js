import styled from "styled-components";
import { Box } from "rebass";

const Overview = styled(Box)`
  max-width: 1280px;

  display: grid;  

  grid-template-areas:
    "totals"
    "exchanges";
    
  @media screen and (min-width: 35em) {
    grid-template-columns: 1.25fr 4fr 1.5fr
    grid-template-areas:
      ". totals ."
      ". exchanges ."
  }
  
  @media screen and (min-width: 50em) {
    grid-gap: 24px;
    grid-template-columns: minmax(380px, 1fr) repeat(3, 1fr);
    grid-template-areas:
      "totals exchanges exchanges exchanges"
      "totals exchanges exchanges exchanges"
      "totals exchanges exchanges exchanges";
  }
`;

export default Overview;
