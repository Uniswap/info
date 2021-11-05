import React from 'react'
import styled from 'styled-components'

import Link from '../Link'
import TwitterIcon from '../Icons/TwitterIcon'
import DiscordIcon from '../Icons/DiscordIcon'
import MediumIcon from '../Icons/MediumIcon'
import useTheme from '../../hooks/useTheme'

const StyledSocialLinks = styled.div`
  padding-top: 20px;
  display: flex;
  align-items: center;
`

const StyledIcon = styled.div`
  margin-right: 12px;
`

const SocialLinks = () => {
  const theme = useTheme()
  return (
    <StyledSocialLinks>
      <Link href="https://twitter.com/kybernetwork" external>
        <StyledIcon>
          <TwitterIcon height={24} width={24} color={theme.subText} />
        </StyledIcon>
      </Link>

      <Link href="https://discord.com/invite/NB3vc8J9uv" external>
        <StyledIcon>
          <DiscordIcon height={24} width={24} color={theme.subText} />
        </StyledIcon>
      </Link>

      <Link href="https://medium.com/@kyberteam" external>
        <StyledIcon>
          <MediumIcon height={24} width={24} color={theme.subText} />
        </StyledIcon>
      </Link>
    </StyledSocialLinks>
  )
}

export default SocialLinks
