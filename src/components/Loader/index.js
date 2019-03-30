/**
 * @prettier
 */

import React from "react";

const Loader = (props) => (
  <div className="LoadingWrapper">
    <img alt="Loading" src="./loading3.gif" />
    <p>Loading up to block <b>{props.blockNum}</b>...</p>
  </div>
);

export default Loader;
