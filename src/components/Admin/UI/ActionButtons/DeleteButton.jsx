import { Trash2 } from 'lucide-react'

import { Button } from '@/components/UI/coss/button'

const DeleteButton = ({ onClick, title = 'Eliminar', loading, ...props }) => (
    <Button
        variant="destructive-outline"
        size="icon-sm"
        onClick={onClick}
        title={title}
        aria-label={title}
        loading={loading}
        {...props}
    >
        <Trash2 className="h-4 w-4" />
    </Button>
)

export default DeleteButton
