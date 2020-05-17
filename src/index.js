import React from 'react'
import ReactDOM from 'react-dom'

import ThemeProvider, { GlobalStyle } from './Theme'

import LocalStorageContextProvider, { Updater as LocalStorageContextUpdater } from './contexts/LocalStorage'

import GlobalDataContextProvider from './contexts/GlobalData'

import ApplicationContextProvider from './contexts/Application'

import App from './App'

function ContextProviders({ children }) {
  return (
    <LocalStorageContextProvider>
      <ApplicationContextProvider>
        <GlobalDataContextProvider></GlobalDataContextProvider>
      </ApplicationContextProvider>
    </LocalStorageContextProvider>
  )
}

function Updaters() {
  return (
    <>
      <LocalStorageContextUpdater />
    </>
  )
}

ReactDOM.render(
  <ContextProviders>
    <Updaters />
    <ThemeProvider>
      <>
        <GlobalStyle />
        <App />
      </>
    </ThemeProvider>
  </ContextProviders>,
  document.getElementById('root')
)
