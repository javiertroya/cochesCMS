import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

const DashboardStatCard = ({
    label, value, sub,
    icon: Icon,
    colorBg, colorText, colorStrong,
    to, loading,
}) => {
    const inner = (
        <div className={cn(
            'group relative h-full overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm',
        to && 'cursor-pointer',
            'transition-all duration-300 ease-out',
            'hover:-translate-y-1 hover:shadow-xl hover:shadow-black/[0.06] hover:border-gray-200',
        )}>
            {/* Top accent bar */}
            <div className={cn(
                'absolute inset-x-0 top-0 h-[3px] origin-left scale-x-0 opacity-0 transition-all duration-300 ease-out group-hover:scale-x-100 group-hover:opacity-100',
                colorStrong,
            )} />

            {/* Ambient glow */}
            <div className={cn(
                'pointer-events-none absolute -right-8 -bottom-8 h-32 w-32 rounded-full blur-3xl opacity-40 transition-all duration-500 group-hover:opacity-80 group-hover:scale-110',
                colorBg,
            )} />

            <div className="relative flex h-full flex-col gap-3 p-5">
                {/* Icon + arrow */}
                <div className="flex items-start justify-between">
                    <div className={cn(
                        'flex h-11 w-11 items-center justify-center rounded-2xl shadow-sm ring-1 ring-inset ring-black/[0.05] transition-transform duration-300 group-hover:scale-105',
                        colorBg,
                    )}>
                        <Icon className={cn('h-5 w-5', colorText)} />
                    </div>
                    {to && (
                        <div className="flex h-7 w-7 translate-x-2 items-center justify-center rounded-full bg-gray-100 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100">
                            <ArrowUpRight className="h-3.5 w-3.5 text-gray-500" />
                        </div>
                    )}
                </div>

                {/* Metric */}
                {loading ? (
                    <div className="mt-auto space-y-2">
                        <div className="h-9 w-20 animate-pulse rounded-lg bg-gray-100" />
                        <div className="h-3 w-24 animate-pulse rounded bg-gray-100" />
                    </div>
                ) : (
                    <div className="mt-auto">
                        <p className="text-4xl font-bold leading-none tracking-tight text-gray-900 tabular-nums">
                            {typeof value === 'number' ? value.toLocaleString('es-ES') : value}
                        </p>
                        <p className="mt-2 text-sm font-semibold tracking-tight text-gray-500">{label}</p>
                        {sub && (
                            <p className="mt-1 text-[11px] leading-relaxed text-gray-400">{sub}</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    )

    if (to) {
        return <Link to={to} className="block h-full">{inner}</Link>
    }
    return <div className="h-full">{inner}</div>
}

export default DashboardStatCard
