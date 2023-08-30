import { Helmet } from 'react-helmet'
import { withRouter } from 'react-router-dom'
import React from 'react'

const WEBSITE_HOST_URL = 'https://v1.info.uniswap.org'

const Meta = ({ location })=> {
  return (
    <Helmet>
      <link rel="canonical" href={`${WEBSITE_HOST_URL}${location.pathname}`} />
    </Helmet>
  )
}

export default withRouter(Meta)
