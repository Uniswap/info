import { Box as RebassBox } from "rebass";
import styled from "styled-components";

const Panel = styled(RebassBox)`
  position: relative;

  ${props => (props.area ? `grid-area: ${props.area};` : null)}

  ${props =>
    props.rounded
      ? `
    border-radius: 10px 10px 0 0;
    @media only screen and (min-width: 40em) {
      border-radius: 10px;
    }
  `
      : null};

  &:not(:last-child) {
    :after {
      content: "";
      position: absolute;
      bottom: -10px;
      left: 0;
      right: 0;
      height: 10px;
      background-color: inherit;
    }

    @media only screen and (min-width: 40em) {
      :after {
        content: unset;
      }
    }
  }
`;

export default Panel;
