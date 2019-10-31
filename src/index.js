import React from 'react'
import ReactDOM from 'react-dom'
import { Subscribe, Provider } from 'unstated'
import { DirectoryContainer } from './containers/directoryContainer'
import App from './App'

/**
 * This is the last legacy data fetching strategy. In future updates we should move this into
 * some data context.
 *
 */
export default function AppWrapper() {
  return (
    <Provider>
      <Subscribe to={[DirectoryContainer]}>{directoryStore => <App directoryStore={directoryStore} />}</Subscribe>
    </Provider>
  )
}

ReactDOM.render(<AppWrapper />, document.getElementById('root'))
