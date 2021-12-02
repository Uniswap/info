import React, { useState } from 'react'
import styled from 'styled-components'
import { Tooltip } from '../QuestionHelper'
import { darken } from 'polished'

const TextWrapper = styled.div`
  position: relative;
  margin-left: ${({ margin }) => margin && '4px'};
  color: ${({ theme, link }) => (link ? theme.primary : theme.text1)};
  font-size: ${({ fontSize }) => fontSize ?? 'inherit'};

  :hover {
    cursor: pointer;
    color: ${({ theme, link }) => (link ? darken(0.05, theme.primary) : theme.text1)};
  }

  @media screen and (max-width: 600px) {
    font-size: ${({ adjustSize }) => adjustSize && '12px'};
  }
`

const FormattedName = ({ text, maxCharacters, margin = false, adjustSize = false, fontSize, link, ...rest }) => {
  const [showHover, setShowHover] = useState(false)

  if (!text) {
    return ''
  }

  if (text.length > maxCharacters) {
    return (
      <Tooltip text={text} show={showHover}>
        <TextWrapper
          onMouseEnter={() => setShowHover(true)}
          onMouseLeave={() => setShowHover(false)}
          margin={margin}
          adjustSize={adjustSize}
          link={link}
          fontSize={fontSize}
          {...rest}
        >
          {' ' + text.slice(0, maxCharacters - 1) + '...'}
        </TextWrapper>
      </Tooltip>
    )
  }

  return (
    <TextWrapper margin={margin} adjustSize={adjustSize} link={link} fontSize={fontSize} {...rest}>
      {text}
    </TextWrapper>
  )
}

export default FormattedName
