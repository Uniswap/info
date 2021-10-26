import React from 'react'
import { NavLink, Link } from 'react-router-dom'
import Navbar from 'react-bootstrap/Navbar'
import Nav from 'react-bootstrap/Nav'
import Dropdown from 'react-bootstrap/Dropdown'
import LogoText from '../../assets/_logo.svg'
import Burger from '../../assets/burger.svg'
import Close from '../../assets/close.svg'
import { CustomContainer, CustomNavbar, CustomNavbarToggle, CustomNavbarCollapse } from './styled'

const FactoryDomain = process.env.REACT_APP_FACCHAIN_DOMAIN
const SwapDomain = process.env.REACT_APP_SWAP_DOMAIN

export default function Header() {
  return (
    <div className="w-100">
      <CustomNavbar expand="lg">
        <CustomContainer wide="true" withbackground="true">
          <Navbar.Brand as={NavLink} to="/">
            <img src={LogoText} alt="FacScan" />
          </Navbar.Brand>
          <CustomNavbarToggle aria-controls="nav_collapse">
            <img className="burger" src={Burger} />
            <img className="close" src={Close} />
          </CustomNavbarToggle>
          <CustomNavbarCollapse id="nav_collapse">
            <Nav className="mx-auto">
              <Nav.Item>
                <Nav.Link href={FactoryDomain} target="_blank">
                  Home
                </Nav.Link>
              </Nav.Item>
              <Dropdown as={Nav.Item}>
                <Dropdown.Toggle as={Nav.Link}>Transactions</Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item href={FactoryDomain + '/txs'} target="_blank">
                    All Transactions
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>

              <Dropdown as={Nav.Item}>
                <Dropdown.Toggle as={Nav.Link}>Accounts</Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item href={FactoryDomain + '/accounts'} target="_blank">
                    All Accounts
                  </Dropdown.Item>
                  <Dropdown.Item href={FactoryDomain + '/validators'} target="_blank">
                    All Validators
                  </Dropdown.Item>
                  <Dropdown.Item href={FactoryDomain + '/contracts'} target="_blank">
                    Verified Contracts
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>

              <Dropdown as={Nav.Item}>
                <Dropdown.Toggle as={Nav.Link}>Tokens</Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item href={FactoryDomain + '/tokens/frc20'} target="_blank">
                    FRC-20 Tokens
                  </Dropdown.Item>
                  <Dropdown.Item href={FactoryDomain + '/tokentxs'} target="_blank">
                    FRC-20 Transfers
                  </Dropdown.Item>
                  <Dropdown.Item href={FactoryDomain + '/tokens/nft'} target="_blank">
                    FRC721 Tokens
                  </Dropdown.Item>
                  <Dropdown.Item href={FactoryDomain + '/tokentxs/nft'} target="_blank">
                    FRC721 Transfers
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>

              <Dropdown as={Nav.Item}>
                <Dropdown.Toggle as={Nav.Link}>Blocks</Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item href={FactoryDomain + '/blocks'} target="_blank">
                    Blocks
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>

              <Dropdown as={Nav.Item}>
                <Dropdown.Toggle as={Nav.Link}>Trade</Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item href={SwapDomain + '/#/swap'} target="_blank">
                    Swap
                  </Dropdown.Item>
                  <Dropdown.Item href={SwapDomain + '/#/pool/v2'} target="_blank">
                    Liquidity
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </Nav>
          </CustomNavbarCollapse>
        </CustomContainer>
      </CustomNavbar>
    </div>
  )
}
