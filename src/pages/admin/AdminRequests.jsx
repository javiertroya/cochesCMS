import { useCallback, useEffect, useMemo, useState } from 'react'
import { ChevronRight, ImageIcon, Inbox, Mail, Phone, Search } from 'lucide-react'

import { Button } from '@/components/UI/coss/button'
import AdminPageHeader from '@/components/Admin/Layout/AdminPageHeader'
import AdminLoadingState from '@/components/Admin/UI/AdminLoadingState'
import AdminErrorState from '@/components/Admin/UI/AdminErrorState'
import FilterButton from '@/components/Admin/UI/FilterButton'
import RequestStatusBadge from '@/components/Admin/Requests/RequestStatusBadge'
import RequestDetailDialog from '@/components/Admin/Requests/RequestDetailDialog'
import { REQUEST_STATUSES, REQUEST_TYPE_OPTIONS, formatRequestDate, getRequestPreview } from '@/components/Admin/Requests/requestStatus'
import {
    deleteAdminRequest,
    getAdminRequests,
    updateAdminRequestStatus,
} from '@/services/request_service'

const AdminRequests = () => {
    const [requests, setRequests] = useState([])
    const [statusFilter, setStatusFilter] = useState('')
    const [typeFilter, setTypeFilter] = useState('')
    const [search, setSearch] = useState('')
    const [selected, setSelected] = useState(null)
    const [loading, setLoading] = useState(true)
    const [loadError, setLoadError] = useState(false)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')

    const loadRequests = useCallback(async () => {
        setLoading(true)
        setLoadError(false)
        try {
            const data = await getAdminRequests()
            setRequests(Array.isArray(data?.items) ? data.items : [])
        } catch {
            setLoadError(true)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        loadRequests()
    }, [loadRequests])

    const typeRequests = useMemo(
        () => (typeFilter ? requests.filter((request) => request.type === typeFilter) : requests),
        [requests, typeFilter],
    )

    const counts = useMemo(() => typeRequests.reduce((acc, request) => {
        acc[request.status] = (acc[request.status] ?? 0) + 1
        return acc
    }, {}), [typeRequests])

    const filteredRequests = useMemo(() => {
        const query = search.trim().toLowerCase()
        return typeRequests.filter((request) => {
            if (statusFilter && request.status !== statusFilter) return false
            if (!query) return true
            const { name = '', email = '', phone = '' } = request.data ?? {}
            const details = (request.summary ?? []).map((item) => item.value)
            return [name, email, phone, ...details].some((value) => String(value).toLowerCase().includes(query))
        })
    }, [typeRequests, statusFilter, search])

    const replaceRequest = (updated) => {
        setRequests((current) => current.map((item) => (item.id === updated.id ? updated : item)))
        setSelected((current) => (current?.id === updated.id ? updated : current))
    }

    const handleStatusChange = async (request, status) => {
        setSaving(true)
        setError('')
        try {
            replaceRequest(await updateAdminRequestStatus(request.id, status))
        } catch (err) {
            setError(err.message || 'No se pudo cambiar el estado.')
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (request) => {
        const name = request.data?.name || `#${request.id}`
        if (!window.confirm(`¿Eliminar la solicitud de ${name}? Esta acción no se puede deshacer.`)) return
        setError('')
        try {
            await deleteAdminRequest(request.id)
            setRequests((current) => current.filter((item) => item.id !== request.id))
            setSelected(null)
        } catch (err) {
            setError(err.message || 'No se pudo eliminar la solicitud.')
        }
    }

    return (
        <div className="h-full overflow-y-auto py-6 lg:py-8">
            <div className="space-y-6">
                <AdminPageHeader
                    icon={Inbox}
                    title="Solicitudes"
                    description="Mensajes enviados por los clientes desde los formularios de la web."
                >
                    <Button variant="outline" onClick={loadRequests} disabled={loading}>
                        Actualizar
                    </Button>
                </AdminPageHeader>

                {error && (
                    <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 bg-gray-50/60 px-4 py-3 sm:px-5">
                        <div className="flex flex-wrap items-center gap-2">
                            <FilterButton active={!statusFilter} count={typeRequests.length} onClick={() => setStatusFilter('')}>
                                Todas
                            </FilterButton>
                            {REQUEST_STATUSES.map((status) => (
                                <FilterButton
                                    key={status.value}
                                    active={statusFilter === status.value}
                                    count={counts[status.value] ?? 0}
                                    onClick={() => setStatusFilter(status.value)}
                                >
                                    {status.label}
                                </FilterButton>
                            ))}
                        </div>
                        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                        <select
                            value={typeFilter}
                            onChange={(event) => setTypeFilter(event.target.value)}
                            aria-label="Filtrar por tipo"
                            className="h-9 w-full rounded-full border border-gray-200 bg-white px-3 text-sm text-gray-600 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 sm:w-auto"
                        >
                            {REQUEST_TYPE_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                        </select>
                        <label className="relative w-full sm:w-64">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-300" />
                            <input
                                type="search"
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Buscar por nombre, coche…"
                                className="h-9 w-full rounded-full border border-gray-200 bg-white pl-9 pr-3 text-sm outline-none transition-shadow placeholder:text-gray-300 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
                            />
                        </label>
                        </div>
                    </div>

                    {loading ? (
                        <AdminLoadingState label="Cargando solicitudes…" />
                    ) : loadError ? (
                        <AdminErrorState
                            title="Error al cargar solicitudes"
                            description="No se han podido cargar las solicitudes. Inténtalo de nuevo."
                            onRetry={loadRequests}
                        />
                    ) : filteredRequests.length === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                            <Inbox className="h-8 w-8 text-gray-200" />
                            <p className="text-sm font-semibold text-gray-700">
                                {requests.length === 0 ? 'Todavía no hay solicitudes' : 'Sin resultados'}
                            </p>
                            <p className="max-w-xs text-xs leading-relaxed text-gray-400">
                                {requests.length === 0
                                    ? 'Cuando alguien envíe un formulario de la web aparecerá aquí.'
                                    : 'Prueba con otra búsqueda o cambia los filtros.'}
                            </p>
                        </div>
                    ) : (
                        <ul className="divide-y divide-gray-100">
                            {filteredRequests.map((request) => {
                                const data = request.data ?? {}
                                const isNew = request.status === 'nueva'
                                return (
                                    <li key={request.id}>
                                        <button
                                            type="button"
                                            onClick={() => setSelected(request)}
                                            className="grid w-full gap-2 px-4 py-4 text-left transition-colors hover:bg-gray-50/70 sm:px-5 lg:grid-cols-[minmax(0,14rem)_minmax(0,1fr)_8.5rem_9rem_1rem] lg:items-center lg:gap-5"
                                        >
                                            <div className="flex min-w-0 items-center gap-2">
                                                {isNew && <span className="h-2 w-2 shrink-0 rounded-full bg-blue-500" aria-label="Nueva" />}
                                                <div className="min-w-0">
                                                    <p className={`truncate text-sm text-gray-900 ${isNew ? 'font-bold' : 'font-semibold'}`}>
                                                        {data.name || `Solicitud #${request.id}`}
                                                    </p>
                                                    <p className="truncate text-xs text-gray-400">
                                                        {request.type_label ?? request.type}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="min-w-0">
                                                <p className="line-clamp-2 text-sm text-gray-600 lg:line-clamp-1">{getRequestPreview(request)}</p>
                                                <p className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400">
                                                    {data.phone && <span className="inline-flex items-center gap-1"><Phone className="h-3 w-3" />{data.phone}</span>}
                                                    {data.email && <span className="inline-flex min-w-0 items-center gap-1"><Mail className="h-3 w-3 shrink-0" /><span className="truncate">{data.email}</span></span>}
                                                    {data.attachments?.length > 0 && <span className="inline-flex items-center gap-1"><ImageIcon className="h-3 w-3" />{data.attachments.length}</span>}
                                                </p>
                                            </div>
                                            <div className="flex items-center justify-between gap-3 lg:contents">
                                                <RequestStatusBadge status={request.status} />
                                                <span className="text-xs text-gray-400 lg:text-right">{formatRequestDate(request.created_at)}</span>
                                                <ChevronRight className="hidden h-4 w-4 text-gray-300 lg:block" />
                                            </div>
                                        </button>
                                    </li>
                                )
                            })}
                        </ul>
                    )}
                </div>
            </div>

            <RequestDetailDialog
                request={selected}
                saving={saving}
                onClose={() => setSelected(null)}
                onStatusChange={handleStatusChange}
                onDelete={handleDelete}
            />
        </div>
    )
}

export default AdminRequests
