import React from "react";
import ReactDOM from "react-dom";
import { Subscribe, Provider } from "unstated";

import { PoolContainer } from "./containers/poolContainer";
import { DirectoryContainer } from "./containers/directoryContainer";
import { TransactionsContainer } from "./containers/transactionsContainer";
import { ChartContainer } from "./containers/chartContainer";
import { OverviewPageContainer} from './containers/overviewPageContainer'

import App from "./App";

const AppWrapper = () => (
  <Provider>
    <Subscribe
      to={[
        PoolContainer,
        TransactionsContainer,
        DirectoryContainer,
        ChartContainer,
        OverviewPageContainer
      ]}
    >
      {(poolStore, transactionsStore, directoryStore, chartStore, overviewPageStore) => (
        <App
          poolStore={poolStore}
          transactionsStore={transactionsStore}
          directoryStore={directoryStore}
          chartStore={chartStore}
          overviewPageStore = {overviewPageStore}
        />
      )}
    </Subscribe>
  </Provider>
);

export default AppWrapper;

ReactDOM.render(<AppWrapper />, document.getElementById("root"));
