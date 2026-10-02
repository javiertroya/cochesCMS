import { useNavigate } from 'react-router-dom'
import { BarChart2, Sunrise, Sun, Moon, Calendar } from 'lucide-react'

import { Button } from '@/components/UI/coss/button'
import { getGreeting } from '@/utils/admin/greeting'

const GREETING_ICON = {
    'Buenos días':   <Sunrise className="h-4 w-4" />,
    'Buenas tardes': <Sun     className="h-4 w-4" />,
    'Buenas noches': <Moon    className="h-4 w-4" />,
}

const DashboardHeader = () => {
    const navigate = useNavigate()
    const greeting = getGreeting()
    const dateStr  = new Date().toLocaleDateString('es-ES', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    })

    return (
        <div className="flex items-end justify-between">
            <div>
                <p className="mb-1 flex items-center gap-1.5 text-xs font-medium uppercase tracking-widest text-gray-400">
                    {GREETING_ICON[greeting]}
                    {greeting}
                </p>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                    Panel de Administrador
                </h1>
                <p className="mt-1 flex items-center gap-1.5 text-sm capitalize text-gray-400">
                    <Calendar className="h-3.5 w-3.5 shrink-0" />
                    {dateStr}
                </p>
            </div>
            <Button size="sm" onClick={() => navigate('/admin/analytics')}>
                <BarChart2 className="h-4 w-4" />
                Ver analíticas
            </Button>
        </div>
    )
}

export default DashboardHeader
