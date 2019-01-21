import React from "react";
import ReactDOM from "react-dom";
import Web3Provider from "web3-react";

// Working old app
// import "./_old/index.css";
// import AppWrapper from "./_old/AppWrapper";

// ReactDOM.render(<AppWrapper />, document.getElementById("root"));

import App from "./App";

export default function AppWrapper() {
  return (
    <Web3Provider>
      <App />
    </Web3Provider>
  );
}

ReactDOM.render(<AppWrapper />, document.getElementById("root"));
