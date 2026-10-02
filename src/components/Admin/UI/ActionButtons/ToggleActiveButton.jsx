import { UserCheck, UserX } from 'lucide-react'

import { Button } from '@/components/UI/coss/button'

const ToggleActiveButton = ({ isActive, onClick, ...props }) => (
    <Button
        variant="outline"
        size="icon-sm"
        onClick={onClick}
        title={isActive ? 'Desactivar usuario' : 'Activar usuario'}
        aria-label={isActive ? 'Desactivar usuario' : 'Activar usuario'}
        className="hover:bg-blue-200 hover:border-blue-300"
        {...props}
    >
        {isActive
            ? <UserX className="h-4 w-4 text-blue-400" />
            : <UserCheck className="h-4 w-4 text-blue-400" />
        }
    </Button>
)

export default ToggleActiveButton
