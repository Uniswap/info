import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { X } from 'react-feather'
import { Text } from 'rebass'
import Announcement from '../components/Icons/Announcement'
import { useMedia } from 'react-use'
import Link from './Link'

const BannerWrapper = styled.div`
  padding: 10px 20px;
  background: #1d7a5f;
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 10001;
`

const StyledClose = styled(X)`
  color: white;
  :hover {
    cursor: pointer;
  }
`

const Content = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  padding: 8px 16px;
  background: ${({ theme }) => `${theme.buttonBlack}1a`};

  ${({ theme }) => theme.mediaWidth.upToSmall`
    background: transparent;
    padding: 2px 0;
    font-size: 14px;
  `}
`

function KyberSwapAnounce(): JSX.Element {
  const below768 = useMedia('(max-width: 768px)')

  const rebrandingAnnouncement = false

  const [show, setShow] = useState(rebrandingAnnouncement)

  const toggleRebrandingAnnouncement = () => {
    setShow(false)
    localStorage.setItem('rebranding-announcement', 'false')
  }

  useEffect(() => {
    setShow(rebrandingAnnouncement)
  }, [rebrandingAnnouncement])

  if (!show) return null

  return (
    <BannerWrapper>
      {!below768 && <div />}
      <Content>
        {!below768 && <Announcement />}
        <Text marginLeft='4px' marginRight='1rem' lineHeight='20px' color='#fff'>
          dmm.exchange is now <b>KyberSwap.com</b>! Click{' '}
          <Link external href='https://bit.ly/3EzNCif'>
            here
          </Link>{' '}
          to learn more.
        </Text>
      </Content>

      <StyledClose size={28} onClick={() => toggleRebrandingAnnouncement()} />
    </BannerWrapper>
  )
}

export default KyberSwapAnounce
