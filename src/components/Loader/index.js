import React from "react";
import styled from "styled-components";

const Loading = styled.div`
  pointer-events: none;
  display: grid;
  place-items: center;

  > img {
    height: 128px;
  }
`;

const Loader = () => (
  <Loading>
    <img alt="Loading" src="./loading3.gif" />
    {/* <span>Loading...</span> */}
  </Loading>
);

export default Loader;
