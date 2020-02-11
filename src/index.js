import React from "react"
import ReactDOM from "react-dom"
import { Provider } from "unstated"
import App from "./App"

export default function AppWrapper() {
  return (
    <Provider>
      <App />
    </Provider>
  )
}

ReactDOM.render(<AppWrapper />, document.getElementById("root"))
