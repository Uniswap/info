import React from "react";
import ReactDOM from "react-dom";
import Web3Provider from "web3-react";
import { Subscribe, Provider } from "unstated";

import { PoolContainer } from "./containers/poolContainer";
import App from "./App";

const StateWrapper = () => (
  <Provider>
    <Subscribe to={[PoolContainer]}>
      {poolStore => <App poolStore={poolStore} />}
    </Subscribe>
  </Provider>
);

const AppWrapper = () => (
  <Web3Provider>
    <StateWrapper />
  </Web3Provider>
);

export default AppWrapper;

ReactDOM.render(<AppWrapper />, document.getElementById("root"));
