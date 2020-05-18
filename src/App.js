import React from 'react'
import styled from 'styled-components'
import { ApolloProvider } from 'react-apollo'
import { client } from './apollo/client'
import { Route, Switch, BrowserRouter, withRouter, Redirect } from 'react-router-dom'
import ScrolToTop from './components/ScrollToTop'

import GlobalPage from './pages/GlobalPage'
import NavHeader from './components/NavHeader'

const AppWrapper = styled.div`
  position: relative;
  width: 100%;
  max-width: 100vw;
  min-height: 100vh;
  overflow-y: scroll;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
`

function App() {
  const NavHeaderUpdated = withRouter(props => <NavHeader default {...props} />)

  return (
    <ApolloProvider client={client}>
      <AppWrapper>
        <BrowserRouter>
          <ScrolToTop />
          <Switch>
            <Route path="/home">
              <NavHeaderUpdated />
              <GlobalPage />
            </Route>
            <Redirect to="/home" />
          </Switch>
        </BrowserRouter>
      </AppWrapper>
    </ApolloProvider>
  )
}

export default App
