import React from 'react'
import { useHistory } from 'react-router-dom'
import styled from 'styled-components'

import { Flex } from 'rebass'
import Link from '../Link'
import { RowFixed } from '../Row'
import Logo from '../../assets/logo_white.svg'
import Wordmark from '../../assets/wordmark_white.svg'

const TitleWrapper = styled.div`
  text-decoration: none;

  &:hover {
    cursor: pointer;
  }

  z-index: 10;
`

const UniIcon = styled(Link)`
  transition: transform 0.3s ease;
  :hover {
    transform: rotate(-5deg);
  }
`

export default function Title() {
  const history = useHistory()

  return (
    <TitleWrapper onClick={() => history.push('/')}>
      <Flex alignItems="center">
        <RowFixed>
          <svg class="menu__StyledLogo-cnp8x7-1 fhvRHR" width="120" height="40" viewBox="0 0 120 40" fill="none">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M55.6456 12.0559C56.6602 12.5135 57.436 13.1501 57.9798 13.9525C58.5235 14.7549 58.7954 15.67 58.7954 16.6912V27.1223C58.7954 27.4538 58.6296 27.6262 58.2915 27.6262H55.6588C55.3273 27.6262 55.1548 27.4605 55.1548 27.1223V26.3398C55.1548 26.2536 55.135 26.2071 55.0952 26.2005C55.0554 26.1872 55.0023 26.2071 54.936 26.2469C53.8087 27.3345 52.3034 27.8782 50.4267 27.8782C48.8816 27.8782 47.6084 27.4803 46.6204 26.6846C45.6257 25.8888 45.1349 24.7085 45.1349 23.1435C45.1349 21.5122 45.7052 20.2456 46.8458 19.3371C47.9864 18.4286 49.5846 17.9711 51.6535 17.9711H54.9758C55.1018 17.9711 55.1615 17.9114 55.1615 17.7854V17.0626C55.1615 16.2469 54.9161 15.617 54.4254 15.166C53.9347 14.7151 53.2052 14.4896 52.2503 14.4896C51.5209 14.4896 50.9108 14.6223 50.4334 14.8809C49.9493 15.1395 49.631 15.5042 49.4652 15.9618C49.379 16.2536 49.1933 16.3928 48.9015 16.3663L46.0832 16.0215C45.9174 16.0016 45.7914 15.9551 45.7052 15.8822C45.619 15.8093 45.5925 15.7231 45.6124 15.617C45.7981 14.3636 46.4944 13.3424 47.6946 12.5467C48.8949 11.7509 50.3869 11.353 52.1575 11.353C53.4639 11.3663 54.631 11.5984 55.6456 12.0559ZM54.0607 24.1846C54.7901 23.6408 55.1548 22.9512 55.1548 22.1156V20.6766C55.1548 20.5506 55.0952 20.491 54.9692 20.491H52.3697C51.2623 20.491 50.3869 20.7032 49.7371 21.1209C49.0872 21.5387 48.7689 22.1355 48.7689 22.9048C48.7689 23.5745 49.0209 24.0918 49.5182 24.4565C50.0222 24.8212 50.6588 25.0069 51.4281 25.0069C52.4493 25.0002 53.3312 24.7284 54.0607 24.1846ZM71.6602 11.6183H74.2596C74.5912 11.6183 74.7636 11.784 74.7636 12.1222V27.1289C74.7636 27.4604 74.5978 27.6328 74.2596 27.6328H71.6602C71.3286 27.6328 71.1562 27.4671 71.1562 27.1289V26.3132C71.1562 26.227 71.1297 26.1806 71.0766 26.1541C71.0236 26.1342 70.9771 26.1673 70.9374 26.2469C70.1018 27.3145 68.8286 27.845 67.1177 27.845C65.5328 27.845 64.2 27.3875 63.1257 26.4657C62.0514 25.544 61.5143 24.2443 61.5143 22.5466V12.1222C61.5143 11.7907 61.6801 11.6183 62.0183 11.6183H64.6509C64.9824 11.6183 65.1549 11.784 65.1549 12.1222V21.5254C65.1549 22.5068 65.4135 23.2893 65.9241 23.8729C66.4347 24.4565 67.1509 24.7482 68.0726 24.7482C69.0143 24.7482 69.7636 24.4565 70.3273 23.8729C70.8909 23.2893 71.1761 22.5068 71.1761 21.5254V12.1222C71.1562 11.784 71.322 11.6183 71.6602 11.6183ZM90.4665 11.6182H87.8339C87.4957 11.6182 87.3299 11.784 87.3498 12.1156V12.6792C87.3498 12.7654 87.3299 12.8185 87.2901 12.8384C87.2437 12.8649 87.1906 12.8384 87.131 12.7787C86.1959 11.837 84.9227 11.3662 83.3113 11.3662C81.932 11.3662 80.7318 11.7442 79.7105 12.5068C78.6893 13.2694 77.9665 14.2906 77.5487 15.5638C77.2105 16.4856 77.0448 17.8118 77.0448 19.5426C77.0448 21.0877 77.1774 22.3543 77.4493 23.3357C77.8869 24.7548 78.6694 25.8092 79.7967 26.4988C80.9241 27.1885 82.1641 27.5333 83.5235 27.5333C85.0686 27.5333 86.2689 27.0824 87.1243 26.1872C87.1906 26.1275 87.2437 26.1076 87.2835 26.1275C87.3233 26.154 87.3432 26.2004 87.3432 26.2866V26.4723C87.3432 27.9312 86.9718 28.9723 86.2291 29.589C85.4864 30.1991 84.3193 30.5108 82.7344 30.5108C82.4625 30.5108 81.9718 30.4909 81.2623 30.4511C81.0965 30.4312 80.9639 30.4577 80.8577 30.5439C80.7517 30.6301 80.6986 30.7429 80.6986 30.8888L80.6058 33.2097C80.6058 33.5612 80.7516 33.7535 81.0434 33.7734C81.6469 33.8331 82.2437 33.8662 82.8272 33.8662C85.2477 33.8662 87.2105 33.3026 88.7158 32.1752C90.2211 31.0479 90.9705 29.1779 90.9705 26.5652V12.1222C90.9705 11.784 90.7981 11.6182 90.4665 11.6182ZM87.3299 19.5161C87.3299 20.3317 87.3166 20.9219 87.2835 21.2866C87.2503 21.6514 87.1973 21.9896 87.1044 22.2946C86.9387 22.9644 86.6071 23.5081 86.1031 23.9259C85.5991 24.3503 84.9426 24.5559 84.127 24.5559C83.3511 24.5559 82.688 24.3437 82.1376 23.9126C81.5872 23.4882 81.2026 22.9378 80.997 22.2681C80.7914 21.7442 80.6853 20.8357 80.6853 19.5426C80.6853 18.2893 80.8113 17.3675 81.0633 16.784C81.2954 16.0943 81.6668 15.5439 82.1906 15.1262C82.7079 14.7084 83.3511 14.4962 84.1005 14.4962C84.8896 14.4962 85.5461 14.7084 86.0567 15.1262C86.5739 15.5439 86.9121 16.0943 87.0779 16.784C87.184 17.1222 87.2503 17.4604 87.2835 17.8052C87.3166 18.15 87.3299 18.7203 87.3299 19.5161ZM103.829 11.6183H106.428C106.76 11.6183 106.932 11.784 106.932 12.1222V27.1289C106.932 27.4604 106.766 27.6328 106.428 27.6328H103.829C103.497 27.6328 103.325 27.4671 103.325 27.1289V26.3132C103.325 26.227 103.298 26.1806 103.245 26.1541C103.192 26.1342 103.146 26.1673 103.106 26.2469C102.27 27.3145 100.997 27.845 99.2862 27.845C97.7014 27.845 96.3685 27.3875 95.2942 26.4657C94.2199 25.544 93.6828 24.2443 93.6828 22.5466V12.1222C93.6828 11.7907 93.8486 11.6183 94.1868 11.6183H96.8194C97.151 11.6183 97.3234 11.784 97.3234 12.1222V21.5254C97.3234 22.5068 97.582 23.2893 98.0926 23.8729C98.6032 24.4565 99.3194 24.7482 100.241 24.7482C101.183 24.7482 101.932 24.4565 102.496 23.8729C103.059 23.2893 103.345 22.5068 103.345 21.5254V12.1222C103.331 11.784 103.497 11.6183 103.829 11.6183ZM119.047 12.4074C119.107 12.1089 119.014 11.9034 118.762 11.7774C118.265 11.5453 117.708 11.4326 117.098 11.4326C115.553 11.4326 114.339 12.0957 113.464 13.4087C113.424 13.4883 113.378 13.5214 113.338 13.5015C113.298 13.4816 113.278 13.4286 113.278 13.3424V12.1222C113.278 11.784 113.106 11.6182 112.774 11.6182H110.142C109.803 11.6182 109.638 11.7906 109.638 12.1222V27.1288C109.638 27.467 109.81 27.6328 110.142 27.6328H112.774C113.112 27.6328 113.278 27.4604 113.278 27.1288V18.3888C113.278 17.467 113.57 16.7243 114.154 16.1474C114.737 15.5771 115.473 15.2654 116.349 15.2257C116.494 15.2058 116.693 15.1925 116.945 15.1925C117.363 15.1925 117.695 15.2323 117.947 15.3185C118.139 15.3583 118.278 15.3583 118.371 15.3185C118.464 15.2787 118.524 15.1726 118.544 15.0068L119.047 12.4074Z"
              fill="white"
            ></path>
            <g>
              <path
                d="M36.3816 27.4337L32.5156 20.9748C32.3697 20.7361 32.058 20.6632 31.8193 20.8091L29.306 22.4205C29.0806 22.5664 29.0076 22.8648 29.1469 23.0969L31.3551 26.7839C31.4214 26.8966 31.3883 27.0491 31.2755 27.1221L18.3976 35.378C18.318 35.4311 18.2119 35.4311 18.1323 35.378L5.24772 27.1221C5.13498 27.0491 5.10183 26.9032 5.16814 26.7839L7.37636 23.0969C7.51562 22.8648 7.44267 22.5664 7.21721 22.4205L4.70395 20.8091C4.46522 20.6565 4.15355 20.7295 4.00766 20.9748L0.14162 27.4337C-0.136894 27.8979 0.00899437 28.4947 0.459922 28.7799L17.7212 39.8409C18.0461 40.0531 18.4705 40.0531 18.7954 39.8409L36.0567 28.7799C36.5143 28.4947 36.6535 27.8979 36.3816 27.4337Z"
                fill="white"
              ></path>
              <path
                d="M6.71994 17.3806L9.2332 18.992C9.47192 19.1445 9.78359 19.0716 9.92948 18.8262L18.0462 5.25198C18.1457 5.09283 18.3777 5.09283 18.4706 5.25198L26.5939 18.8262C26.7398 19.065 27.0515 19.1379 27.2902 18.992L29.8035 17.3806C30.0289 17.2347 30.1019 16.9363 29.9626 16.7042L20.261 0.484084C20.0754 0.185676 19.7571 0 19.4056 0H17.1178C16.7663 0 16.4414 0.185676 16.2624 0.484084L6.56079 16.7042C6.42153 16.9363 6.49447 17.2347 6.71994 17.3806Z"
                fill="#2AE7A8"
              ></path>
            </g>
            <defs>
              <clipPath id="clip0">
                <path d="M0 0H36.52V40H0V0Z" fill="white"></path>
              </clipPath>
            </defs>
          </svg>
        </RowFixed>
      </Flex>
    </TitleWrapper>
  )
}
