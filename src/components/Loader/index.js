import React from "react";
import styled, { css } from "styled-components";

const Loading = styled.div`
  pointer-events: none;
  display: grid;
  place-items: center;

  ${props =>
    props.fill &&
    css`
      height: 100vh;
    `}

  ${props =>
    props.height &&
    css`
      height: ${props.height}px;
    `}

  > img {
    height: 128px;
  }
`;

const Loader = ({ ...rest }) => (
  <Loading {...rest}>
    <img alt="Loading" src="./loading3.gif" />
    {/* <span>Loading...</span> */}
  </Loading>
);

export default Loader;
