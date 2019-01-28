import React from "react";
import ReactDOM from "react-dom";
import Web3Provider from "web3-react";
import { Subscribe, Provider } from "unstated";

import { PoolContainer } from "./containers/poolContainer";
import { TransactionsContainer } from "./containers/transactionsContainer";

import App from "./App";

const StateWrapper = () => (
  <Provider>
    <Subscribe to={[PoolContainer, TransactionsContainer]}>
      {(poolStore, transactionsStore) => (
        <App poolStore={poolStore} transactionsStore={transactionsStore} />
      )}
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
