import { FileText } from 'lucide-react'

import { NAV_ICON_MAP } from '@/mocks/admin/navIcons'

const PageIcon = ({ page }) => {
    const Icon = page.nav_icon ? NAV_ICON_MAP[page.nav_icon] : null
    const bgColor = page.page_color || null
    return (
        <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-sm${!bgColor ? ' bg-brand-primary' : ''}`}
            style={bgColor ? { backgroundColor: bgColor } : undefined}
        >
            {Icon ? <Icon className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
        </div>
    )
}

export default PageIcon
