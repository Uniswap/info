import React from 'react'
import styled from 'styled-components'

import Link from '../Link'
import TwitterIcon from '../Icons/TwitterIcon'
import DiscordIcon from '../Icons/DiscordIcon'
import MediumIcon from '../Icons/MediumIcon'

const StyledSocialLinks = styled.div`
  padding-top: 28px;
  display: flex;
  align-items: center;
`

const StyledIcon = styled.div`
  margin-right: 12px;
`

const SocialLinks = () => {
  return (
    <StyledSocialLinks>
      <Link href="https://twitter.com/kybernetwork" external>
        <StyledIcon>
          <TwitterIcon />
        </StyledIcon>
      </Link>

      <Link href="https://discord.gg/fQjDvdkc" external>
        <StyledIcon>
          <DiscordIcon />
        </StyledIcon>
      </Link>

      <Link href="https://medium.com/@kyberteam" external>
        <StyledIcon>
          <MediumIcon />
        </StyledIcon>
      </Link>
    </StyledSocialLinks>
  )
}

export default SocialLinks
