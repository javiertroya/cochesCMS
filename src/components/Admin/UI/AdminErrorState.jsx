import { AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

const AdminErrorState = ({ title = 'Error al cargar', description = 'No se han podido cargar los datos. Inténtalo de nuevo.', onRetry, className }) => (
    <div className={cn('flex flex-col items-center justify-center gap-3 py-16 text-center', className)}>
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
            <AlertTriangle className="h-6 w-6 text-red-400" />
        </div>
        <div className="space-y-1">
            <p className="text-sm font-semibold text-gray-700">{title}</p>
            <p className="max-w-xs text-xs leading-relaxed text-gray-400">{description}</p>
        </div>
        {onRetry && (
            <button
                onClick={onRetry}
                className="mt-1 rounded-full border border-gray-200 bg-white px-4 py-1.5 text-xs font-medium text-gray-500 shadow-sm transition hover:bg-gray-50 hover:text-gray-700"
            >
                Reintentar
            </button>
        )}
    </div>
)

export default AdminErrorState
