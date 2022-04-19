import { useFormatPath } from 'hooks'
import Logo from 'assets/logo_full.svg'
import { TitleWrapper } from './styled'

export default function Title() {
  const formatPath = useFormatPath()

  return (
    <TitleWrapper to={formatPath('/')}>
      <img src={Logo} alt="logo" />
    </TitleWrapper>
  )
}
