import { useEffect } from 'react'
import ReactGA from 'react-ga'
import { useHistory, useParams } from 'react-router-dom'

export default function GoogleAnalyticsReporter() {
  const { network: currentNetworkURL } = useParams()
  const history = useHistory()
  let currentUrl = currentNetworkURL ? history.location.pathname.split('/')[2] : history.location.pathname.split('/')[1]
  const URLToTrack = ['analytics', currentNetworkURL, currentUrl].filter(Boolean).join('/')

  useEffect(() => {
    ReactGA.pageview(URLToTrack)
  }, [URLToTrack])

  return null
}
