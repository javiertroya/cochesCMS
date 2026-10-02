import { SearchX, Users } from 'lucide-react'

const COLS = 6

const EmptyCell = ({ icon: Icon, title, description }) => (
    <tr>
        <td colSpan={COLS}>
            <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
                    <Icon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-600">{title}</p>
                    <p className="text-xs text-gray-400">{description}</p>
                </div>
            </div>
        </td>
    </tr>
)

export const EmptyNoUsers = () => (
    <EmptyCell
        icon={Users}
        title="No hay usuarios todavía"
        description="Crea el primero pulsando el botón «Nuevo usuario»."
    />
)

export const EmptyNoResults = () => (
    <EmptyCell
        icon={SearchX}
        title="Sin resultados"
        description="Ningún usuario coincide con la búsqueda."
    />
)
