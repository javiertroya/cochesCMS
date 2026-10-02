import { Eye } from 'lucide-react'

import { Button } from '@/components/UI/coss/button'

const ViewButton = ({ onClick, title = 'Ver', render, ...props }) => (
    <Button
        variant="outline"
        size="icon-sm"
        onClick={onClick}
        title={title}
        aria-label={title}
        render={render}
        className="border-sky-200 text-sky-600 hover:bg-sky-50 hover:border-sky-300"
        {...props}
    >
        <Eye className="h-4 w-4" />
    </Button>
)

export default ViewButton
