import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'unstated'
import App from './App'

/**
 * This is the last legacy data fetching strategy. In future updates we should move this into
 * some data context.
 *
 */
export default function AppWrapper() {
  return (
    <Provider>
      <App />
    </Provider>
  )
}

ReactDOM.render(<AppWrapper />, document.getElementById('root'))
