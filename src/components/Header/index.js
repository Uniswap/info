/**
 * @prettier
 */

import React from "react";

import Emoji from "../Emoji";

export const Logo = () => (
  <div
    style={{
      fontSize: "1.5rem",
      lineHeight: "1.75rem"
    }}
  >
    <Emoji symbol="🦄" label="Unicorn" />
  </div>
);

export const Title = () => (
  <div
    style={{
      fontSize: "1rem",
      fontWeight: 500,
      marginLeft: "1rem",
      marginRight: "1rem",
      lineHeight: "1.5rem"
    }}
  >
    <span>Info</span>
  </div>
);

export const LogoTitle = () => (
  <div
    style={{
      display: "flex",
      alignItems: "center"
    }}
  >
    <Logo />
    <Title />
  </div>
);

const Header = ({ children }) => (
  <div
    style={{
      padding: "1.5rem",
      display: "grid",
      gridTemplateColumns: "minmax(max-content, 2fr) minmax(200px, 1fr)",
      alignItems: "center"
    }}
  >
    <LogoTitle />
    {children}
  </div>
);

export default Header;
