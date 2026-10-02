import { Spinner } from '@/components/UI/coss/spinner'
import { cn } from '@/lib/utils'

const AdminLoadingState = ({ label = 'Cargando...', className }) => (
    <div className={cn('flex flex-col items-center justify-center gap-3 py-16 text-center', className)}>
        <Spinner className="h-7 w-7 text-gray-300" />
        <p className="text-sm font-medium text-gray-400">{label}</p>
    </div>
)

export default AdminLoadingState
