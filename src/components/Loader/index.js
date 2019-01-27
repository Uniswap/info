import React from "react";
import styled from "styled-components";

const LoadingWrapper = styled.div`
  position: relative;
`;

const Loading = styled.div`
  pointer-events: none;
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  display: grid;
  place-items: center;

  > img {
    height: 120px;
  }
`;

const Loader = () => (
  <LoadingWrapper>
    <Loading>
      <img alt="Loading" src="./loading3.gif" />
      <span>Loading...</span>
    </Loading>
  </LoadingWrapper>
);

export default Loader;
