import React from 'react'
import PropTypes from 'prop-types'

const CustomBar = props => {
  const { fill, x, y, width, height } = props

  return <rect x={x} y={y} width={width} height={height} rx={2} fill={fill} />
}

CustomBar.defaultProps = {
  fill: 'transparent',
  x: 0,
  y: 0,
  width: 0,
  height: 0
}

CustomBar.propTypes = {
  fill: PropTypes.string,
  x: PropTypes.number,
  y: PropTypes.number,
  width: PropTypes.number,
  height: PropTypes.number
}

export default CustomBar
