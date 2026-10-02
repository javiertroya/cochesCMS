import { ArrowDown, ArrowUp } from 'lucide-react'

import { Button } from '@/components/UI/coss/button'

const getPageOrder = (page) => Number(page.order) || 100

const PageOrderCell = ({ page, index, filteredPages, isMoving, onMovePage }) => (
    <div className="flex items-center gap-2">
        <span className="flex h-7 min-w-8 items-center justify-center rounded-md border border-gray-200 bg-gray-50 px-2 text-xs font-semibold text-gray-600">
            {getPageOrder(page)}
        </span>
        <div className="flex gap-1 lg:flex-col">
            <Button
                size="icon-xs"
                variant="outline"
                disabled={index === 0 || isMoving}
                onClick={() => onMovePage(page.id, 'up', filteredPages)}
                aria-label="Subir página"
            >
                <ArrowUp className="h-3.5 w-3.5" />
            </Button>
            <Button
                size="icon-xs"
                variant="outline"
                disabled={index === filteredPages.length - 1 || isMoving}
                onClick={() => onMovePage(page.id, 'down', filteredPages)}
                aria-label="Bajar página"
            >
                <ArrowDown className="h-3.5 w-3.5" />
            </Button>
        </div>
    </div>
)

export default PageOrderCell
