import React from 'react'
import styled from 'styled-components'
import Unicorn from '../../assets/unicorn.svg'

// const rotate = keyframes`
//  0% {
//     opacity: 0;
//     transform: translate3d(-100%, 0, 0);
//   }

//   100% {
//     opacity: 1;
//     transform: none;
//   }
// `

const Loader = styled.img`
  > svg {
    fill: blue !important;
    stroke: blue;
  }
`

export default function UnicornLoader() {
  return <Loader src={Unicorn} alt="" />
}
