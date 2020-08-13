import React, { useState } from 'react'
import styled from 'styled-components'
import { Tooltip } from '../QuestionHelper'

const TextWrapper = styled.div`
  position: relative;
  margin-left: 4px;
  :hover {
    cursor: pointer;
  }
`

const FormattedName = ({ text, maxCharacters }) => {
  const [showHover, setShowHover] = useState(false)

  if (!text) {
    return ''
  }

  if (text.length > maxCharacters) {
    return (
      <Tooltip text={text} show={showHover}>
        <TextWrapper onMouseEnter={() => setShowHover(true)} onMouseLeave={() => setShowHover(false)}>
          {' ' + text.slice(0, maxCharacters - 1) + '...'}
        </TextWrapper>
      </Tooltip>
    )
  }

  return text
}

export default FormattedName
