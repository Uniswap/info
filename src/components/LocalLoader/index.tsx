import { useDarkModeManager } from 'state/features/user/hooks'
import { AnimatedImg, Wrapper } from './styled'

type Props = {
  fill?: boolean
}

const LocalLoader = ({ fill }: Props) => {
  const [darkMode] = useDarkModeManager()
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const src = require(darkMode ? 'assets/logo_white.svg' : 'assets/logo.svg').default

  return (
    <Wrapper fill={fill}>
      <AnimatedImg>
        <img src={src} alt="loading-icon" />
      </AnimatedImg>
    </Wrapper>
  )
}

export default LocalLoader
