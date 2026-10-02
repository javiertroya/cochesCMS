import { useCallback, useEffect, useMemo, useState } from 'react'
import { ArrowRight, Info, Link2, Pencil, Plus, Trash2 } from 'lucide-react'

import { Button } from '@/components/UI/coss/button'
import AdminPageHeader from '@/components/Admin/Layout/AdminPageHeader'
import AdminLoadingState from '@/components/Admin/UI/AdminLoadingState'
import AdminErrorState from '@/components/Admin/UI/AdminErrorState'
import FilterButton from '@/components/Admin/UI/FilterButton'
import RedirectTypeBadge from '@/components/Admin/Redirects/RedirectTypeBadge'
import RedirectFormDialog from '@/components/Admin/Redirects/RedirectFormDialog'
import RedirectInfoDialog from '@/components/Admin/Redirects/RedirectInfoDialog'
import {
    createAdminRedirect,
    deleteAdminRedirect,
    getAdminRedirects,
    updateAdminRedirect,
} from '@/services/admin_redirect_service'

const TYPE_OPTIONS = [
    { value: '', label: 'Todas' },
    { value: '301', label: '301 Permanente' },
    { value: '302', label: '302 Temporal' },
]

const STATUS_OPTIONS = [
    { value: '', label: 'Todas' },
    { value: 'active', label: 'Activas' },
    { value: 'inactive', label: 'Inactivas' },
]

const AdminRedirects = () => {
    const [redirects, setRedirects] = useState([])
    const [search, setSearch] = useState('')
    const [typeFilter, setTypeFilter] = useState('')
    const [statusFilter, setStatusFilter] = useState('')
    const [editing, setEditing] = useState(null)
    const [isCreating, setIsCreating] = useState(false)
    const [isInfoOpen, setIsInfoOpen] = useState(false)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const [loadError, setLoadError] = useState(false)

    const loadRedirects = useCallback(async () => {
        setLoading(true)
        setError('')
        setLoadError(false)
        try {
            const data = await getAdminRedirects()
            setRedirects(Array.isArray(data) ? data : [])
        } catch (err) {
            setLoadError(true)
            setError(err.message || 'No se pudieron cargar las redirecciones.')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        loadRedirects()
    }, [loadRedirects])

    const filteredRedirects = useMemo(() => {
        const query = search.trim().toLowerCase()
        return redirects.filter((redirect) => {
            const matchesSearch = !query
                || redirect.from_path.toLowerCase().includes(query)
                || redirect.to_path.toLowerCase().includes(query)
            const matchesType = !typeFilter || String(redirect.status_code) === typeFilter
            const matchesStatus = !statusFilter
                || (statusFilter === 'active' ? redirect.is_active : !redirect.is_active)
            return matchesSearch && matchesType && matchesStatus
        })
    }, [redirects, search, typeFilter, statusFilter])

    const handleSubmit = async (payload) => {
        setSaving(true)
        setError('')
        try {
            if (editing) {
                const updated = await updateAdminRedirect(editing.id, payload)
                setRedirects((current) => current.map((r) => r.id === editing.id ? updated : r))
                setEditing(null)
                return
            }
            const created = await createAdminRedirect(payload)
            setRedirects((current) => [created, ...current])
            setIsCreating(false)
        } catch (saveError) {
            setError(saveError.message || 'No se pudo guardar la redirección.')
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (redirect) => {
        if (window.confirm(`¿Eliminar la redirección ${redirect.from_path}?`)) {
            setError('')
            try {
                await deleteAdminRedirect(redirect.id)
                setRedirects((current) => current.filter((item) => item.id !== redirect.id))
            } catch (deleteError) {
                setError(deleteError.message || 'No se pudo eliminar la redirección.')
            }
        }
    }

    return (
        <div className="h-full overflow-y-auto py-6 lg:py-8">
            <div className="space-y-6">
                <AdminPageHeader
                    icon={Link2}
                    title="Redirecciones"
                    description="Gestiona redirecciones de URL del sitio."
                >
                    <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={() => setIsInfoOpen(true)}>
                            <Info className="h-4 w-4" />
                            Cómo funciona
                        </Button>
                        <Button onClick={() => setIsCreating(true)}>
                            <Plus className="h-4 w-4" />
                            Nueva redirección
                        </Button>
                    </div>
                </AdminPageHeader>

                {error && (
                    <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                    {/* Toolbar — two independent filter groups + search */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 bg-gray-50/60 px-5 py-3">
                        <div className="flex flex-wrap items-center gap-2">
                            {TYPE_OPTIONS.map((option) => (
                                <FilterButton
                                    key={option.value}
                                    active={typeFilter === option.value}
                                    onClick={() => setTypeFilter(option.value)}
                                >
                                    {option.label}
                                </FilterButton>
                            ))}
                            <span className="mx-1 hidden h-5 w-px bg-gray-200 sm:block" />
                            {STATUS_OPTIONS.map((option) => (
                                <FilterButton
                                    key={option.value}
                                    active={statusFilter === option.value}
                                    onClick={() => setStatusFilter(option.value)}
                                >
                                    {option.label}
                                </FilterButton>
                            ))}
                        </div>
                        <label className="relative w-full sm:w-64">
                            <ArrowRight className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-300" />
                            <input
                                type="search"
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Buscar por ruta..."
                                className="h-9 w-full rounded-full border border-gray-200 bg-white pl-9 pr-3 text-sm outline-none transition-shadow placeholder:text-gray-300 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
                            />
                        </label>
                    </div>

                    {loading ? (
                        <AdminLoadingState label="Cargando redirecciones…" />
                    ) : loadError ? (
                        <AdminErrorState
                            title="Error al cargar redirecciones"
                            description="No se han podido cargar las redirecciones. Inténtalo de nuevo."
                            onRetry={loadRedirects}
                        />
                    ) : filteredRedirects.length === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                            <Link2 className="h-8 w-8 text-gray-200" />
                            <p className="text-sm font-semibold text-gray-700">
                                {redirects.length === 0 ? 'Sin redirecciones' : 'Sin resultados'}
                            </p>
                            <p className="max-w-xs text-xs leading-relaxed text-gray-400">
                                {redirects.length === 0
                                    ? 'Crea la primera redirección para evitar errores 404 en rutas antiguas.'
                                    : 'Prueba con otra búsqueda o cambia los filtros activos.'}
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {filteredRedirects.map((redirect) => (
                                <div
                                    key={redirect.id}
                                    className="grid gap-3 px-5 py-4 transition-colors hover:bg-gray-50/70 lg:grid-cols-[minmax(0,1fr)_9rem_7rem_5rem] lg:items-center"
                                >
                                    <div className="flex min-w-0 items-center gap-3">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-primary text-white shadow-sm">
                                            <Link2 className="h-4 w-4" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="truncate font-mono text-xs text-gray-400">{redirect.from_path}</p>
                                            <div className="mt-1 flex min-w-0 items-center gap-1.5">
                                                <ArrowRight className="h-3 w-3 shrink-0 text-gray-300" />
                                                <p className="truncate font-mono text-xs font-semibold text-brand-primary">
                                                    {redirect.to_path}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <RedirectTypeBadge statusCode={redirect.status_code} />
                                    <div className="flex items-center gap-1.5">
                                        <span className={`h-2 w-2 rounded-full ${redirect.is_active ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                                        <span className={`text-sm font-medium ${redirect.is_active ? 'text-emerald-600' : 'text-gray-400'}`}>
                                            {redirect.is_active ? 'Activa' : 'Inactiva'}
                                        </span>
                                    </div>
                                    <div className="flex justify-start gap-1.5 lg:justify-end">
                                        <Button size="icon-sm" variant="ghost" onClick={() => setEditing(redirect)} aria-label="Editar redirección">
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button size="icon-sm" variant="ghost" onClick={() => handleDelete(redirect)} aria-label="Eliminar redirección">
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {(isCreating || editing) && (
                <RedirectFormDialog
                    key={editing?.id ?? 'new'}
                    open={isCreating || !!editing}
                    redirect={editing}
                    saving={saving}
                    onClose={() => { setIsCreating(false); setEditing(null) }}
                    onSubmit={handleSubmit}
                />
            )}

            <RedirectInfoDialog open={isInfoOpen} onClose={() => setIsInfoOpen(false)} />
        </div>
    )
}

export default AdminRedirects
