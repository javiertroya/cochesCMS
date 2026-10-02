import { FileText, Database, Users, ArrowRight, CheckCircle, ImageIcon, Link2, Activity, AlertTriangle } from 'lucide-react'
import { Link } from 'react-router-dom'

import { cn } from '@/lib/utils'

const DashboardSiteSummary = ({
    publishedPages, totalPages, publishedPct,
    totalCollections, totalItems,
    pendingUsers, loading,
    className,
}) => {
    return (
        <div className={cn('flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm', className)}>
            {/* Header */}
            <div className="flex items-center gap-2.5 border-b border-gray-100 px-5 py-4">
                <span className="relative flex h-2 w-2 shrink-0">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                <p className="text-sm font-semibold text-gray-900">Estado del sitio</p>
            </div>

            <div className="flex-1 space-y-4 px-5 py-4">
                {/* Pages */}
                <div>
                    <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                            <FileText className="h-3.5 w-3.5 text-gray-400" />
                            <span className="text-xs font-medium text-gray-500">Páginas publicadas</span>
                        </div>
                        {loading.pages ? (
                            <div className="h-3.5 w-10 animate-pulse rounded bg-gray-100" />
                        ) : (
                            <span className="text-xs font-semibold tabular-nums text-gray-700">
                                {publishedPages} / {totalPages}
                            </span>
                        )}
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                        {!loading.pages && (
                            <div
                                className="h-full rounded-full bg-gradient-to-r from-brand-primary/80 to-brand-primary transition-all duration-700"
                                style={{ width: `${publishedPct}%` }}
                            />
                        )}
                    </div>
                    {!loading.pages && totalPages > 0 && (
                        <p className="mt-1.5 text-[11px] text-gray-400">
                            {publishedPct}% del contenido publicado
                        </p>
                    )}
                </div>

                <div className="h-px bg-gray-100" />

                {/* Collections */}
                <div>
                    <div className="mb-2 flex items-center gap-1.5">
                        <Database className="h-3.5 w-3.5 text-gray-400" />
                        <span className="text-xs font-medium text-gray-500">Colecciones de datos</span>
                    </div>
                    {loading.collections ? (
                        <div className="h-6 w-24 animate-pulse rounded bg-gray-100" />
                    ) : (
                        <div className="flex items-baseline gap-1.5">
                            <span className="text-xl font-bold tabular-nums text-gray-900">{totalCollections}</span>
                            <span className="text-xs text-gray-400">colecciones</span>
                            {totalItems > 0 && (
                                <>
                                    <span className="select-none text-xs text-gray-300">·</span>
                                    <span className="text-xs text-gray-400">{totalItems} ítems</span>
                                </>
                            )}
                        </div>
                    )}
                </div>

                <div className="h-px bg-gray-100" />

                {/* Users */}
                <div>
                    <div className="mb-2 flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5 text-gray-400" />
                        <span className="text-xs font-medium text-gray-500">Usuarios</span>
                    </div>
                    {loading.users ? (
                        <div className="h-8 w-full animate-pulse rounded-lg bg-gray-100" />
                    ) : pendingUsers > 0 ? (
                        <div className="flex items-center gap-2 rounded-lg border border-amber-200/80 bg-amber-50/80 px-3 py-2">
                            <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-500" />
                            <p className="flex-1 text-xs text-amber-700">
                                <span className="font-semibold">{pendingUsers} usuario{pendingUsers > 1 ? 's' : ''}</span>
                                {' '}desactivado{pendingUsers > 1 ? 's' : ''}.
                            </p>
                            <Link
                                to="/admin/users"
                                className="shrink-0 text-xs font-semibold text-amber-600 hover:text-amber-700"
                            >
                                Revisar →
                            </Link>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 text-emerald-600">
                            <CheckCircle className="h-4 w-4 shrink-0" />
                            <span className="text-xs font-semibold">Todos aprobados</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Quick actions */}
            <div className="px-5 pb-4 pt-1">
                <div className="mb-3 h-px bg-gray-100" />
                <p className="mb-1.5 px-1 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                    Acciones rápidas
                </p>
                {[
                    { label: 'Multimedia',            icon: ImageIcon, to: '/admin/multimedia' },
                    { label: 'Redirecciones',         icon: Link2,     to: '/admin/redirects' },
                    { label: 'Actividad',             icon: Activity,  to: '/admin/audit-log' },
                ].map(({ label, icon: Icon, to }) => (
                    <Link
                        key={to}
                        to={to}
                        className="group/item flex items-center gap-2.5 rounded-lg px-3 py-2 text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-900"
                    >
                        <Icon className="h-3.5 w-3.5 shrink-0" />
                        <span className="flex-1 text-xs">{label}</span>
                        <ArrowRight className="h-3 w-3 translate-x-0.5 opacity-0 transition-all duration-150 group-hover/item:translate-x-1 group-hover/item:opacity-50" />
                    </Link>
                ))}
            </div>
        </div>
    )
}

export default DashboardSiteSummary
