import { useCallback, useEffect, useMemo, useState } from 'react'
import { Activity, Search } from 'lucide-react'

import { Badge } from '@/components/UI/coss/badge'
import AdminPageHeader from '@/components/Admin/Layout/AdminPageHeader'
import AdminLoadingState from '@/components/Admin/UI/AdminLoadingState'
import AdminErrorState from '@/components/Admin/UI/AdminErrorState'
import { Spinner } from '@/components/UI/coss/spinner'
import { ViewButton } from '@/components/Admin/UI/ActionButtons'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/UI/coss/table'
import FilterButton from '@/components/Admin/UI/FilterButton'
import ChangesDialog from '@/components/Admin/AuditLog/ChangesDialog'
import { getAdminAuditLogs } from '@/services/admin_audit_service'
import { getResourceLabel } from '@/components/Admin/AuditLog/auditLabels'
import { formatDateTime, formatRelativeTime } from '@/utils/format'

const ACTION_OPTIONS = [
    { value: '', label: 'Todas' },
    { value: 'create', label: 'Crear' },
    { value: 'update', label: 'Editar' },
    { value: 'delete', label: 'Eliminar' },
]

const ACTION_META = {
    create: { label: 'Crear',    badge: 'success', border: 'border-l-emerald-500' },
    update: { label: 'Editar',   badge: 'info',    border: 'border-l-blue-500'    },
    delete: { label: 'Eliminar', badge: 'error',   border: 'border-l-red-500'     },
}

const AdminAuditLog = () => {
    const [logs, setLogs] = useState([])
    const [search, setSearch] = useState('')
    const [actionFilter, setActionFilter] = useState('')
    const [resourceFilter, setResourceFilter] = useState('')
    const [selectedLog, setSelectedLog] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const loadLogs = useCallback(async () => {
        setLoading(true)
        setError('')
        try {
            const data = await getAdminAuditLogs({ limit: 500 })
            setLogs(Array.isArray(data) ? data : [])
        } catch (loadError) {
            setError(loadError.message || 'No se pudo cargar la actividad.')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        loadLogs()
    }, [loadLogs])

    const filteredLogs = useMemo(() => {
        const query = search.trim().toLowerCase()
        return logs.filter((log) => {
            const matchesSearch = !query
                || (log.user_email ?? '').toLowerCase().includes(query)
                || (log.resource_label ?? '').toLowerCase().includes(query)
                || (log.resource_type ?? '').toLowerCase().includes(query)
            const matchesAction = !actionFilter || log.action === actionFilter
            const matchesResource = !resourceFilter || log.resource_type === resourceFilter
            return matchesSearch && matchesAction && matchesResource
        })
    }, [logs, search, actionFilter, resourceFilter])

    const resourceOptions = useMemo(() => {
        const values = [...new Set(logs.map((log) => log.resource_type).filter(Boolean))]
        return [
            { value: '', label: 'Todos los tipos' },
            ...values.map((value) => ({ value, label: getResourceLabel(value) })),
        ]
    }, [logs])

    const isEmpty = !loading && logs.length === 0 && !actionFilter && !resourceFilter && !search

    return (
        <div className="h-full overflow-y-auto py-6 lg:py-8">
            <div className="space-y-6">
                <AdminPageHeader
                    icon={Activity}
                    title="Actividad"
                    description="Historial de acciones realizadas en el panel."
                >
                    <Badge variant="outline" className="h-7 rounded-full px-3 text-gray-500">
                        {loading ? <Spinner className="h-3.5 w-3.5 text-gray-400" /> : `${filteredLogs.length} registros`}
                    </Badge>
                </AdminPageHeader>

                {error && (
                    <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                    {loading ? (
                        <AdminLoadingState label="Cargando actividad…" />
                    ) : error ? (
                        <AdminErrorState
                            title="Error al cargar actividad"
                            description="No se ha podido cargar el historial de actividad. Inténtalo de nuevo."
                            onRetry={loadLogs}
                        />
                    ) : isEmpty ? (
                        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                            <Activity className="h-8 w-8 text-gray-200" />
                            <p className="text-sm font-semibold text-gray-700">Sin registros de actividad</p>
                            <p className="max-w-xs text-xs leading-relaxed text-gray-400">
                                Las acciones realizadas en el panel aparecerán aquí.
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Toolbar — filters + resource select + search */}
                            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 bg-gray-50/60 px-5 py-3">
                                <div className="flex flex-wrap items-center gap-2">
                                    {ACTION_OPTIONS.map((option) => (
                                        <FilterButton
                                            key={option.value}
                                            active={actionFilter === option.value}
                                            onClick={() => setActionFilter(option.value)}
                                        >
                                            {option.label}
                                        </FilterButton>
                                    ))}
                                </div>
                                <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto">
                                    <select
                                        value={resourceFilter}
                                        onChange={(event) => setResourceFilter(event.target.value)}
                                        className="h-9 rounded-full border border-gray-200 bg-white pl-3 pr-9 text-xs font-medium text-gray-500 outline-none transition-shadow focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
                                    >
                                        {resourceOptions.map((option) => (
                                            <option key={option.value} value={option.value}>{option.label}</option>
                                        ))}
                                    </select>
                                    <label className="relative min-w-0 flex-1 sm:w-64 sm:flex-none">
                                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-300" />
                                        <input
                                            type="search"
                                            value={search}
                                            onChange={(event) => setSearch(event.target.value)}
                                            placeholder="Buscar usuario o recurso"
                                            className="h-9 w-full rounded-full border border-gray-200 bg-white pl-9 pr-3 text-sm outline-none transition-shadow placeholder:text-gray-300 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
                                        />
                                    </label>
                                </div>
                            </div>

                            {filteredLogs.length === 0 ? (
                                <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                                    <Activity className="h-8 w-8 text-gray-200" />
                                    <p className="text-sm font-semibold text-gray-700">Sin resultados</p>
                                    <p className="max-w-xs text-xs leading-relaxed text-gray-400">
                                        Prueba con otro término de búsqueda o cambia los filtros.
                                    </p>
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-gray-50/60">
                                            <TableHead className="px-5">Fecha</TableHead>
                                            <TableHead>Usuario</TableHead>
                                            <TableHead>Acción</TableHead>
                                            <TableHead>Tipo</TableHead>
                                            <TableHead>Recurso</TableHead>
                                            <TableHead className="w-20 text-right">Cambios</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredLogs.map((log) => {
                                            const meta = ACTION_META[log.action] ?? ACTION_META.update
                                            const changes = log.changes ?? {}
                                            const changeCount = Object.keys(changes).length
                                            return (
                                                <TableRow key={log.id} className={`border-l-2 ${meta.border}`}>
                                                    <TableCell className="px-5 text-xs text-gray-400" title={formatDateTime(log.created_at)}>
                                                        {formatRelativeTime(log.created_at)}
                                                    </TableCell>
                                                    <TableCell className="text-xs text-gray-500">{log.user_email ?? 'Sistema'}</TableCell>
                                                    <TableCell>
                                                        <Badge variant={meta.badge}>{meta.label}</Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="rounded-md bg-gray-100 px-2 py-1 text-[11px] font-semibold text-gray-500">
                                                            {getResourceLabel(log.resource_type)}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="max-w-56 truncate font-medium text-gray-800">
                                                        {log.resource_label}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        {changeCount > 0 ? (
                                                            <ViewButton
                                                                onClick={() => setSelectedLog(log)}
                                                                title="Ver cambios"
                                                            />
                                                        ) : (
                                                            <span className="text-gray-300">-</span>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })}
                                    </TableBody>
                                </Table>
                            )}
                        </>
                    )}
                </div>
            </div>

            <ChangesDialog log={selectedLog} onClose={() => setSelectedLog(null)} />
        </div>
    )
}

export default AdminAuditLog
