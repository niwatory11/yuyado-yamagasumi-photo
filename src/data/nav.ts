export type NavItem = {
  href: string
  label: string
}

export const navItems: NavItem[] = [
  { href: '#about', label: '宿について' },
  { href: '#bath', label: '湯' },
  { href: '#rooms', label: '部屋' },
  { href: '#cuisine', label: '料理' },
  { href: '#access', label: 'ご案内' },
]

export const reserveNavItem = { href: '#reserve', label: 'ご予約' }
