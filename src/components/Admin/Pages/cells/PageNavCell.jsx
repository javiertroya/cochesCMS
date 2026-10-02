import { EyeOff } from 'lucide-react'

import { NAV_ICON_MAP } from '@/mocks/admin/navIcons'

const PageNavCell = ({ page, pages }) => {
    const NavIcon = page.nav_icon ? NAV_ICON_MAP[page.nav_icon] : null
    const parentPage = page.nav_parent_slug ? pages.find(p => p.slug === page.nav_parent_slug) : null
    const parentLabel = parentPage?.title ?? page.nav_parent_slug

    return (
        <div className="flex min-w-0 items-center">
            {page.nav_visible ? (
                <div className="flex min-w-0 items-center gap-1.5 text-sm text-gray-500">
                    {NavIcon && <NavIcon className="h-3.5 w-3.5 shrink-0 text-brand-primary" />}
                    <span className="shrink-0 text-xs font-semibold text-gray-400">#{page.nav_order}</span>
                    {page.nav_parent_slug ? (
                        <span className="min-w-0 truncate text-xs text-brand-primary/70">
                            ↳ {parentLabel}
                        </span>
                    ) : (
                        <span className="text-xs text-gray-600">Principal</span>
                    )}
                </div>
            ) : (
                <div className="flex items-center gap-1.5">
                    <EyeOff className="h-3.5 w-3.5 shrink-0 text-gray-300" />
                    <span className="text-xs text-gray-400">Sin menú</span>
                </div>
            )}
        </div>
    )
}

export default PageNavCell
