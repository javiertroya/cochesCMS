import { ArrowRight, Activity } from 'lucide-react'
import { Link } from 'react-router-dom'

import { cn } from '@/lib/utils'
import { getResourceLabel } from '@/components/Admin/AuditLog/auditLabels'
import { formatRelativeTime } from '@/utils/format'

const ACTION_CONFIG = {
    create: { label: 'creó',    dot: 'bg-emerald-500', text: 'text-emerald-600' },
    update: { label: 'editó',   dot: 'bg-blue-500',    text: 'text-blue-600' },
    delete: { label: 'eliminó', dot: 'bg-red-500',     text: 'text-red-600' },
}

const DashboardActivityFeed = ({ data, loading, className }) => {
    return (
        <div className={cn('flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm', className)}>
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                <p className="text-sm font-semibold text-gray-900">Actividad reciente</p>
                <Link
                    to="/admin/audit-log"
                    className="flex items-center gap-1 text-xs font-medium text-brand-primary hover:underline"
                >
                    Ver todo <ArrowRight className="h-3 w-3" />
                </Link>
            </div>

            {/* Content */}
            <div className="flex flex-1 flex-col overflow-y-auto">
                {loading ? (
                    <div className="space-y-4 px-5 py-3">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="flex gap-3">
                                <div className="mt-1.5 h-2 w-2 shrink-0 animate-pulse rounded-full bg-gray-200" />
                                <div className="flex-1 space-y-1.5">
                                    <div className="h-3.5 w-3/4 animate-pulse rounded bg-gray-100" />
                                    <div className="h-3 w-1/4 animate-pulse rounded bg-gray-100" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : !data || data.length === 0 ? (
                    <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-50">
                            <Activity className="h-5 w-5 text-gray-300" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-400">Sin actividad registrada</p>
                            <p className="mt-0.5 text-xs text-gray-300">
                                Las acciones del panel aparecerán aquí cuando esté disponible.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="px-5 py-3">
                        {data.map((log, idx) => {
                            const cfg    = ACTION_CONFIG[log.action] ?? ACTION_CONFIG.update
                            const isLast = idx === data.length - 1
                            return (
                                <div key={log.id} className="flex gap-3">
                                    <div className="flex shrink-0 flex-col items-center">
                                        <div className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${cfg.dot}`} />
                                        {!isLast && <div className="mt-1 w-px flex-1 bg-gray-100" />}
                                    </div>
                                    <div className={`${isLast ? '' : 'pb-3'} min-w-0 flex-1`}>
                                        <p className="text-sm leading-snug text-gray-700">
                                            <span className="font-semibold">{log.user_name ?? log.user_email?.split('@')[0] ?? 'admin'}</span>
                                            {' '}
                                            <span className={`text-xs font-medium ${cfg.text}`}>{cfg.label}</span>
                                            {' '}
                                            <span className="text-xs text-gray-400">
                                                {getResourceLabel(log.resource_type)}
                                            </span>
                                            {' '}
                                            <span className="font-medium">{log.resource_label}</span>
                                        </p>
                                        <p className="mt-0.5 text-xs text-gray-400">{formatRelativeTime(log.created_at)}</p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}

export default DashboardActivityFeed
