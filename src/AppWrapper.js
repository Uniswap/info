import React from 'react';
import Web3Provider from 'web3-react';

import App from './App'

export default function AppWrapper () {
  return (
      <Web3Provider>
          <App />
      </Web3Provider>
  )
}