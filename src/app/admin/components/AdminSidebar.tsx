'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAdminAuth } from '../AdminAuthContext'
import {
  ChartBar,
  ShoppingBag,
  Package,
  Users,
  Tag,
  Gear,
  Palette,
  SignOut,
  List,
  FileText,
  Star,
  SlidersHorizontal,
  Image,
  Article,
  NavigationArrow,
  Layout,
  SquaresFour,
} from '@phosphor-icons/react'

const NAV_GROUPS = [
  {
    label: 'Overview',
    items: [
      { href: '/admin', label: 'Dashboard', icon: ChartBar, exact: true },
    ],
  },
  {
    label: 'Content',
    items: [
      { href: '/admin/pages', label: 'Pages', icon: Article },
      { href: '/admin/blogs', label: 'Blog Posts', icon: FileText },
      { href: '/admin/menus', label: 'Menus', icon: NavigationArrow },
      { href: '/admin/sliders', label: 'Sliders', icon: SlidersHorizontal },
      { href: '/admin/banners', label: 'Banners', icon: Image },
      { href: '/admin/sections', label: 'Sections', icon: SquaresFour },
    ],
  },
  {
    label: 'Appearance',
    items: [
      { href: '/admin/themes', label: 'Themes', icon: Palette },
    ],
  },
  {
    label: 'Store',
    items: [
      { href: '/admin/products', label: 'Products', icon: Package },
      { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
      { href: '/admin/coupons', label: 'Coupons', icon: Tag },
      { href: '/admin/categories', label: 'Categories', icon: List },
      { href: '/admin/reviews', label: 'Reviews', icon: Star },
    ],
  },
  {
    label: 'People',
    items: [
      { href: '/admin/users', label: 'Users', icon: Users },
    ],
  },
  {
    label: 'Config',
    items: [
      { href: '/admin/settings', label: 'Settings', icon: Gear },
    ],
  },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const { user, logout } = useAdminAuth()

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href)

  return (
    <aside className="w-60 min-h-screen bg-gray-900 text-white flex flex-col flex-shrink-0">
      {/* Logo */}
      <div className="px-5 py-4 border-b border-gray-700">
        <h1 className="text-lg font-bold tracking-wide">ANVOGUE</h1>
        <p className="text-xs text-gray-400 mt-0.5">Admin Panel</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-5">
        {NAV_GROUPS.map(group => (
          <div key={group.label}>
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest px-3 mb-1.5">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map(({ href, label, icon: Icon, ...rest }) => {
                const exact = 'exact' in rest ? rest.exact : undefined
                const active = isActive(href, exact)
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      active
                        ? 'bg-white text-gray-900'
                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <Icon size={16} weight={active ? 'fill' : 'regular'} />
                    {label}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User */}
      <div className="px-4 py-4 border-t border-gray-700">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-sm font-bold flex-shrink-0">
            {user?.name?.[0]?.toUpperCase() || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name || 'Admin'}</p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href="/" target="_blank"
            className="flex-1 text-center text-xs text-gray-400 hover:text-white border border-gray-700 rounded-lg py-1.5 transition">
            View Site ↗
          </Link>
          <button onClick={logout}
            className="flex-1 flex items-center justify-center gap-1 text-xs text-gray-400 hover:text-white border border-gray-700 rounded-lg py-1.5 transition">
            <SignOut size={12} />
            Logout
          </button>
        </div>
      </div>
    </aside>
  )
}
