import { Box as RebassBox } from "rebass";
import styled from "styled-components";

const Panel = styled(RebassBox)`
  position: relative;

  ${props => (props.area ? `grid-area: ${props.area};` : null)}
  ${props => (props.rounded ? "border-radius: 10px 10px 0 0;" : null)};

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
  }
`;

export default Panel;
