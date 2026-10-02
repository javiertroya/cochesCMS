import { Pencil } from 'lucide-react'

import { Button } from '@/components/UI/coss/button'

const EditButton = ({ onClick, title = 'Editar', ...props }) => (
    <Button
        variant="outline"
        size="icon-sm"
        onClick={onClick}
        title={title}
        aria-label={title}
        className="hover:bg-yellow-100 hover:border-yellow-200"
        {...props}
    >
        <Pencil className="h-4 w-4 text-yellow-600" />
    </Button>
)

export default EditButton
