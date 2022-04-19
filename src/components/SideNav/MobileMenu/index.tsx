import { useFormatPath } from 'hooks'
import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MenuWrapper, MenuButton, MenuList, MenuItem, MenuLinkSpan } from './styled'
import { TrendingUp, List, PieChart, Disc } from 'react-feather'
import { useTranslation } from 'react-i18next'
import { useOnClickOutside } from 'hooks/useOnClickOutSide'

const MENU_LINKS = [
  {
    route: '/',
    Icon: TrendingUp,
    label: 'sideNav.overview'
  },
  {
    route: '/tokens',
    Icon: List,
    label: 'sideNav.tokens'
  },
  {
    route: '/pairs',
    Icon: PieChart,
    label: 'sideNav.pairs'
  },
  {
    route: '/accounts',
    Icon: Disc,
    label: 'sideNav.accounts'
  }
]

const MobileMenu = () => {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()
  const formatPath = useFormatPath()

  const node = useRef(null)
  useOnClickOutside(node, isOpen ? () => setIsOpen(false) : undefined)

  return (
    <MenuWrapper>
      <MenuButton onClick={() => setIsOpen(!isOpen)} />
      {isOpen ? (
        <MenuList ref={node}>
          {MENU_LINKS.map(({ route, Icon, label }) => (
            <MenuItem
              key={route}
              onClick={() => {
                navigate(formatPath(route))
              }}
            >
              <Icon />
              <MenuLinkSpan>{t(label)}</MenuLinkSpan>
            </MenuItem>
          ))}
        </MenuList>
      ) : null}
    </MenuWrapper>
  )
}

export default MobileMenu
