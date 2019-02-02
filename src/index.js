import React from "react";
import ReactDOM from "react-dom";
import { Subscribe, Provider } from "unstated";

import { PoolContainer } from "./containers/poolContainer";
import { DirectoryContainer } from "./containers/directoryContainer";
import { TransactionsContainer } from "./containers/transactionsContainer";

import App from "./App";

const AppWrapper = () => (
  <Provider>
    <Subscribe to={[PoolContainer, TransactionsContainer, DirectoryContainer]}>
      {(poolStore, transactionsStore, directoryStore) => (
        <App
          poolStore={poolStore}
          transactionsStore={transactionsStore}
          directoryStore={directoryStore}
        />
      )}
    </Subscribe>
  </Provider>
);

export default AppWrapper;

ReactDOM.render(<AppWrapper />, document.getElementById("root"));
