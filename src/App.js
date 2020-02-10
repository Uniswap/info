import React, { useState, useEffect } from "react"
import styled from "styled-components"
import { ApolloProvider } from "react-apollo"
import { client } from "./apollo/client"
import {
  Route,
  Switch,
  BrowserRouter,
  withRouter,
  Redirect
} from "react-router-dom"

import TokenDataContextProvider, {
  Updater as TokenDataContextUpdater,
  useAllTokens
} from "./contexts/TokenData"

import GlobalDataContextProvider, {
  Updater as GlobalDataContextUpdater
} from "./contexts/GlobalData"

import PairDataContextProvider, {
  Updater as PairDataContextUpdater
} from "./contexts/PairData"
import ApplicationContextProvider from "./contexts/Application"

import GlobalPage from "./pages/GlobalPage"
import TokenPage from "./pages/TokenPage"
import PairPage from "./pages/PairPage"
import { Wrapper as ThemeWrapper } from "./components/Theme"
import NavHeader from "./components/NavHeader"
import LocalLoader from "./components/LocalLoader"

const AppWrapper = styled.div`
  position: relative;
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
`

function App() {
  const NavHeaderUpdated = withRouter(props => <NavHeader default {...props} />)

  const allTokens = useAllTokens()

  function ContextProviders({ children }) {
    return (
      <ApplicationContextProvider>
        <TokenDataContextProvider>
          <GlobalDataContextProvider>
            <PairDataContextProvider>{children}</PairDataContextProvider>
          </GlobalDataContextProvider>
        </TokenDataContextProvider>
      </ApplicationContextProvider>
    )
  }

  function Updaters() {
    return (
      <>
        <PairDataContextUpdater />
        <TokenDataContextUpdater />
        <GlobalDataContextUpdater />
      </>
    )
  }

  return (
    <ApolloProvider client={client}>
      <ContextProviders>
        <Updaters />
        <ThemeWrapper>
          <AppWrapper>
            {allTokens ? (
              <BrowserRouter>
                <Switch>
                  <Route
                    exacts
                    strict
                    path="/token/:tokenAddress"
                    render={({ match }) => {
                      const searched =
                        allTokens &&
                        allTokens.filter(token => {
                          return (
                            token.id.toLowerCase() ===
                            match.params.tokenAddress.toLowerCase()
                          )
                        })
                      if (allTokens && searched.length > 0) {
                        return (
                          <>
                            <NavHeaderUpdated
                              token={match.params.tokenAddress.toLowerCase()}
                            />
                            <TokenPage
                              address={match.params.tokenAddress.toLowerCase()}
                            />
                          </>
                        )
                      } else {
                        return <Redirect to="/home" />
                      }
                    }}
                  />
                  <Route
                    exacts
                    strict
                    path="/pair/:pairAddress"
                    render={({ match }) => {
                      if (true) {
                        return (
                          <>
                            <NavHeaderUpdated
                              pair={match.params.pairAddress.toLowerCase()}
                            />
                            <PairPage
                              address={match.params.pairAddress.toLowerCase()}
                            />
                          </>
                        )
                      } else {
                        return <Redirect to="/home" />
                      }
                    }}
                  />
                  <Route path="/home">
                    <NavHeaderUpdated />
                    <GlobalPage />
                  </Route>
                  <Redirect to="/home" />
                </Switch>
              </BrowserRouter>
            ) : (
              <LocalLoader fill="true" />
            )}
          </AppWrapper>
        </ThemeWrapper>
      </ContextProviders>
    </ApolloProvider>
  )
}

export default App
