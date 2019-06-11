import React from 'react'
import { Box as RebassBox } from 'rebass'
import styled from 'styled-components'
import PropTypes from 'prop-types'

const Box = styled(RebassBox)`
  display: grid;
  grid-template-columns: repeat(2, minmax(max-content, 1fr));
  /* grid-template-rows: repeat(2, minmax(max-content, 1fr)); */

  row-gap: ${props => (props.gap ? `${props.gap}px` : 'unset')};
`

const pos = {
  topLeft: 'flex-start flex-start',
  topRight: 'flex-start flex-end',
  bottomLeft: 'flex-end flex-start',
  bottomRight: 'flex-end'
}

const FourByFour = ({ gap, topLeft, topRight, bottomLeft, bottomRight, ...rest }) => (
  <Box gap={gap} {...rest}>
    <div style={{ placeSelf: pos.topLeft }}>{topLeft}</div>
    <div style={{ placeSelf: pos.topRight }}>{topRight}</div>
    <div style={{ placeSelf: pos.bottomLeft }}>{bottomLeft}</div>
    <div style={{ placeSelf: pos.bottomRight }}>{bottomRight}</div>
  </Box>
)

FourByFour.defaultProps = {
  gap: 8
}

FourByFour.propTypes = {
  gap: PropTypes.number,
  topLeft: PropTypes.node,
  topRight: PropTypes.node,
  bottomLeft: PropTypes.node,
  bottomRight: PropTypes.node
}

export default FourByFour
