/**
 * @prettier
 */

import React from "react";

import Emoji from "../Emoji";

export const Logo = () => (
  <div style={{
    fontSize: 32,
    height: 32,
    width: 32,
    marginRight: 16
  }}>
    <Emoji symbol="🦄" label="Unicorn" />
  </div>
)

const Header = ({ children }) => (
  <div style={{
    display: "flex",
    alignItems: "center",
  }}>
    <Logo />
    <div style={{
      flex: 1
    }}>
      {children}
    </div>
  </div>
)

export default Header;
