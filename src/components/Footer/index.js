import React from 'react'
import styled from 'styled-components/macro'
import { CustomContainer } from './styled'
import LogoText from '../../assets/_logo.svg'
import BackgroundFooter from '../../assets/footer.png'
import BackgroundFooterMobile from '../../assets/footer-mobile.png'
import Facebook from '../../assets/facebook.svg'
import FacebookActive from '../../assets/facebook_active.svg'
import Twitter from '../../assets/twitter.svg'
import TwitterActive from '../../assets/twitter_active.svg'
import Github from '../../assets/github.svg'
import GithubActive from '../../assets/github_active.svg'
import Reddit from '../../assets/reddit.svg'
import RedditActive from '../../assets/reddit_active.svg'
import Telegram from '../../assets/telegram.svg'
import TelegramActive from '../../assets/telegram_active.svg'
import Substack from '../../assets/substack.svg'
import SubstackActive from '../../assets/substack_active.svg'

const CustomFooter = styled.div`
  display: block;
  width: 100%;
  .container {
    background-image: url(${BackgroundFooter});
    background-repeat: no-repeat;
    background-size: 100% 100%;
    height: 120px;
    padding: 0 85px;
    @media (max-width: 576px) {
      background-image: url(${BackgroundFooterMobile});
      padding: 0 15px;
      height: auto;
      min-height: 120px;
    }
  }
  .row {
    height: 100%;
    align-items: baseline;
  }
  .tomo-footer__copyright {
    font-weight: 300;
    color: #000;
    height: 100%;
    display: flex;
    align-items: center;

    @media (max-width: 768px) {
      justify-content: center;
      margin-top: 18px;
    }
    .copyright {
      color: #fff;
      font-weight: 700;
      font-size: 20px;
      @media (max-width: 768px) {
        font-size: 16px;
        display: block;
        text-align: center;
      }
    }

    .copyright__code {
      font-size: 12px;
      display: block;
    }
    p {
      margin-bottom: 0;
    }
  }

  .tomo-footer__social {
    font-size: 20px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    position: relative;
    top: 17px;
    @media (max-width: 768px) {
      justify-content: center;
      top: 0;
      margin-top: 16px;
    }

    p {
      margin-bottom: 0;
    }
    ul {
      padding: 0;
      margin: 0;
      li.list-inline-item {
        margin-right: 19px;

        &:last-child {
          margin-right: 0;
        }

        .icon {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          cursor: pointer;
          @media (max-width: 576px) {
            width: 24px;
            height: 24px;
            background-size: 100%;
          }

          &.icon-telegram {
            background-image: url(${Telegram});
            &:hover {
              background-image: url(${TelegramActive});
            }
          }
          &.icon-substack {
            background-image: url(${Substack});
            &:hover {
              background-image: url(${SubstackActive});
            }
          }
          &.icon-facebook {
            background-image: url(${Facebook});
            &:hover {
              background-image: url(${FacebookActive});
            }
          }
          &.icon-twitter {
            background-image: url(${Twitter});
            &:hover {
              background-image: url(${TwitterActive});
            }
          }
          &.icon-github {
            background-image: url(${Github});
            &:hover {
              background-image: url(${GithubActive});
            }
          }
          &.icon-reddit {
            background-image: url(${Reddit});
            &:hover {
              background-image: url(${RedditActive});
            }
          }
        }
      }
    }
  }

  .text-muted {
    color: #6c757d !important;
  }
`

export default function Footer() {
  return (
    <CustomFooter>
      <CustomContainer wide="true">
        <div className="row">
          <div className="col-md-6 col-12 tomo-footer__copyright">
            <p>
              <span className="copyright">
                <img src={LogoText} alt="FacScan" />
              </span>
              <code className="text-muted copyright__code">Factory/stable/linux-amd64/golang</code>
            </p>
          </div>
          <div className="col-md-6 col-12 tomo-footer__social">
            <ul>
              <li className="list-inline-item">
                <a href="https://t.me/facchainofficial">
                  <div className="icon icon-telegram" />
                </a>
              </li>
              <li className="list-inline-item">
                <a href="https://twitter.com/fac_chain">
                  <div className="icon icon-twitter" />
                </a>
              </li>
              <li className="list-inline-item">
                <a href="https://factorychain.substack.com/">
                  <div className="icon icon-substack" />
                </a>
              </li>
            </ul>
          </div>
        </div>
      </CustomContainer>
    </CustomFooter>
  )
}
