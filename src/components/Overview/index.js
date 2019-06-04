import styled from "styled-components";
import { Box } from "rebass";

const Overview = styled(Box)`
  max-width: 1280px;

  display: grid;

  grid-template-columns: 1fr
  grid-template-areas:
    "totals"
    "exchanges"


  @media screen and (min-width: 40em) {
    grid-gap: 16px;
    grid-template-columns: minmax(380px, 1fr) repeat(2, 1fr);
    grid-template-areas:
      "totals totals"
      "exchanges exchanges"
  }

  @media screen and (min-width: 64em) {
    grid-gap: 24px;
    grid-template-columns: minmax(380px, 1fr) repeat(3, 1fr);
    grid-template-areas:
      "totals exchanges exchanges exchanges";
      "totals exchanges exchanges exchanges";
      "totals exchanges exchanges exchanges";
  }
`;

export default Overview;
