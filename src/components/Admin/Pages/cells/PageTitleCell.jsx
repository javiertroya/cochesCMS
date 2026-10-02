import { SlidersHorizontal } from 'lucide-react'

import { routeFromSlug } from '@/utils/menu'
import PageIcon from '../PageIcon'

const PageTitleCell = ({ page }) => {
    const route = routeFromSlug(page.slug)
    const slideCount = page.header_slides?.length ?? 0

    return (
        <div className="flex min-w-0 items-center gap-3">
            <PageIcon page={page} />
            <div className="min-w-0">
                <p className="truncate text-base font-semibold leading-tight text-gray-900">
                    {page.title}
                </p>
                <p className="mt-0.5 truncate font-mono text-xs text-gray-400">{route}</p>
                {slideCount > 0 && (
                    <span className="mt-1 inline-flex items-center gap-1 text-[10px] text-gray-400">
                        <SlidersHorizontal className="h-2.5 w-2.5" />
                        {slideCount} {slideCount === 1 ? 'slide' : 'slides'}
                    </span>
                )}
            </div>
        </div>
    )
}

export default PageTitleCell
