/**
 * @prettier
 */

import React from "react";

const Loader = (props) => (
  <div className="LoadingWrapper">
    <img alt="Loading" src="./loading3.gif" />
    <p>Loaded blocks <b>{props.blockNum.toLocaleString()}</b> / <b>{props.maxBlockNum.toLocaleString()}</b>...</p>
  </div>
);

export default Loader;
