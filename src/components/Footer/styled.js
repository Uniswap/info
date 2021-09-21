import styled from "styled-components/macro";
import Navbar from "react-bootstrap/Navbar";
import Container from "react-bootstrap/Container";
import BackgroundHeaderDesktop from "../../assets/background-header.png";
import BackgroundHeaderMobile from "../../assets/header-mobile.png";
import DropdownHeader from "../../assets/header-dropdown.png";
import ArrowDown from "../../assets/arrow-down.png";
import Highlight from "../../assets/highlight.png";

export const CustomNavbar = styled(Navbar)`
  transition: all 0.5s ease;
  background-color: transparent !important;
  width: 100%;

  @media (max-width: 992px) {
    height: 80px;
  }
  @media (max-width: 576px) {
    background-image: url(${BackgroundHeaderMobile});
    background-repeat: no-repeat;
    background-size: 100% 100%;
  }
  @media (min-width: 992px) {
    height: 68px;
    padding: 0;
  }

  .navbar-brand {
    margin-left: 4.5rem;
  }
  .navbar-brand {
    @media (max-width: 1919px) {
      margin-left: 3rem;
    }
    @media (max-width: 1439px) {
      margin-left: 2rem;
    }
    @media (max-width: 576px) {
      margin-left: 1rem;
    }
  }
`;
export const CustomContainer = styled(Container)`
  height: 100%;

  ${props =>
    props.withbackground
      ? `
      @media (min-width: 576px) {
        background-image: url(${BackgroundHeaderDesktop});
        background-repeat: no-repeat;
        background-size: 100% 100%;
      }
  `
      : ""}
  ${props =>
    props.wide
      ? `
  @media (min-width: 1025px) {
    max-width: 95% !important;
  }

  @media (min-width: 1281px) {
    max-width: 90% !important;
  }
  `
      : ""}
`;

export const CustomNavbarToggle = styled(Navbar.Toggle)`
  width: 50px;
  border: none;
  padding: 0;
  position: relative;
  top: 1px;
  &:focus {
    box-shadow: none;
  }
  .burger {
    display: none;
  }
  &.collapsed {
    .close {
      display: none;
    }
    .burger {
      display: block;
    }
  }

  img {
    margin: auto;
  }
`;
export const CustomNavbarCollapse = styled(Navbar.Collapse)`
  height: 100%;
  margin-right: 7%;

  @media (max-width: 992px) {
    position: absolute !important;
    top: 100%;
    left: 0;
    z-index: 1001;
    width: 100%;
    background-color: #f1f1f1;
    box-shadow: 8px 8px 40px 0 rgba(0, 0, 0, 0.1);
  }

  @media (max-width: 768px) {
    height: auto !important;
    background-color: transparent !important;
    background-image: url(${DropdownHeader});
    background-repeat: no-repeat;
    background-size: 100% 100%;
    padding: 27px 0;
  }

  .navbar-nav {
    height: 100%;
    align-items: center;
    @media (max-width: 576px) {
      align-items: flex-start;
    }
  }
  .nav-item {
    height: 100%;

    @media (max-width: 992px) {
      padding-left: 20px;
    }
    @media (max-width: 768px) {
      width: 100%;
      &.show .nav-link:after {
        transform: translate(0, -50%) rotate(180deg);
      }
    }

    @media (min-width: 993px) {
      &:hover .nav-link::before {
        transform: scale3d(1, 1, 1);
        transform-origin: 0% 50%;
      }
      &:hover .nav-link,
      .nav-link.active {
        color: #fff !important;
      }
    }

    .nav-link.active {
      color: #fff !important;
      font-weight: 600;
    }

    .nav-link {
      height: 100%;
      display: flex;
      align-items: center;
      color: #7583a1 !important;
      font-size: 14px;

      &::before {
        transform: unset !important;
        transition: all 0.5s cubic-bezier(0.8, 0, 0.2, 1);
        height: 15px;
        display: none;
        background-image: url(${Highlight});
        background-repeat: no-repeat;
        background-size: 110% 100%;
        background-color: transparent !important;
        background-position: center;
      }

      &.dropdown-toggle::after {
        display: inline-block;
        font-size: 12px;
        margin-left: 10px;
        content: "";
        width: 16px;
        height: 16px;
        position: relative;
        top: 1px;
        background-repeat: no-repeat;
        background-size: 100%;
        background-image: url(${ArrowDown});
        border: none;
      }

      &:hover,
      &.active {
        &::before {
          display: block;
          color: #fff;
        }
      }

      @media (max-width: 768px) {
        position: relative;
        &:after {
          text-align: center;
          transition: all 0.5s ease;
          position: absolute !important;
          top: 50% !important;
          transform: translateY(-50%);
          right: 10px;
        }
      }

      @media (min-width: 992px) {
        position: relative;
        line-height: 60px;
        padding: 0 20px;

        &::before {
          content: "";
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 15px;
          background-color: $color-primary;
          transition: transform 0.5s cubic-bezier(0.8, 0, 0.2, 1);
          transform: scale3d(0, 1, 1);
          transform-origin: 100% 50%;
        }

        &.active::before {
          transform: scale3d(1, 1, 1);
          transform-origin: 0% 50%;
        }
      }
      @media (min-width: 1172px) {
        margin: 0 10px;
      }
      @media (min-width: 1920px) {
        margin: 0 20px;
      }
    }

    .dropdown-menu {
      border: none;
      transition: all 0.5s ease-in;
      background: linear-gradient(180deg, #222544, #222544 96.15%);
      min-width: 12rem;
      @media (min-width: 992px) {
        padding: 16px 0;
        box-shadow: 1px 2px 40px 0 rgba(0, 0, 0, 0.09);
        border-radius: 8px;
      }
      .dropdown-item {
        font-size: 14px;
        color: #868f9b;
        transition: all 0.5s ease;
        &:hover {
          background: #5d5fef;
          color: #fff;
          outline: none;
        }
        @media (min-width: 992px) {
          border: none;
          padding: 8px 12px;
        }
      }
    }
  }
`;
