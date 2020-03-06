import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'unstated'
import intl from 'react-intl-universal'
import App from './App'
import zh from './i18n/zh.json'
import en from './i18n/en.json'

let lang = (navigator.languages && navigator.languages[0]) || navigator.language
intl.init({
  currentLocale: lang.split('-')[0],
  locales: {
    zh,
    en
  }
})

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
