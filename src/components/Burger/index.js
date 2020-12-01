import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import Menu from '../../assets/menu.svg'
import Close from '../../assets/close.svg'

const BurgerWrapper = styled.div`
  img {
    width: 24px;
    height: 24px;
    cursor: pointer;
  }
`

const Burger = ({ show, setShow }) => {
  return (
    <BurgerWrapper>
      <img onClick={() => setShow(!show)} src={show ? Close : Menu} alt="menu" />
    </BurgerWrapper>
  )
}

Burger.propTypes = {
  show: PropTypes.bool.isRequired,
  setShow: PropTypes.func.isRequired,
}

export default Burger
