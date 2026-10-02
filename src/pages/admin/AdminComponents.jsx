import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { ChevronDown, Layers3, Search } from 'lucide-react'

import { Button } from '@/components/UI/coss/button'
import { toastManager } from '@/components/UI/coss/toast'
import ComponentEditorList from '@/components/Admin/Pages/ComponentEditorList'
import { getAdminCmsPages, getCmsComponentTypes, updateCmsPage } from '@/services/cms_service'
import { makeCmsComponent, pageToDraft } from '@/utils/admin/cmsEditor'
import AdminPageHeader from '@/components/Admin/Layout/AdminPageHeader'

const AdminComponents = () => {
    const location = useLocation()
    const initialPageId = location.state?.pageId ?? null

    const [pages, setPages] = useState([])
    const [componentTypes, setComponentTypes] = useState([])
    const [selectedPageId, setSelectedPageId] = useState(initialPageId)
    const [draft, setDraft] = useState({ components: [] })
    const [saving, setSaving] = useState(false)
    const [dirty, setDirty] = useState(false)
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')

    useEffect(() => {
        Promise.all([getAdminCmsPages(), getCmsComponentTypes()])
            .then(([pagesData, typesData]) => {
                setPages(pagesData)
                setComponentTypes(typesData)
                if (initialPageId) {
                    const page = pagesData.find((p) => p.id === Number(initialPageId))
                    if (page) {
                        setDraft({ components: pageToDraft(page).components })
                    }
                }
            })
            .catch(() => {
                toastManager.add({ title: 'Error', description: 'No se pudieron cargar los datos.', type: 'error' })
            })
            .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const selectedPage = pages.find((p) => p.id === selectedPageId)

    const handlePageSelect = (pageId) => {
        if (dirty && !window.confirm('Hay cambios sin guardar. ¿Descartar?')) return
        const numId = pageId ? Number(pageId) : null
        setSelectedPageId(numId)
        const page = pages.find((p) => p.id === numId)
        setDraft({ components: page ? pageToDraft(page).components : [] })
        setDirty(false)
        setSearch('')
    }

    const handleAddComponent = (ct) => {
        setDraft((prev) => ({ components: [...prev.components, makeCmsComponent(ct)] }))
        setDirty(true)
    }

    const handleDeleteComponent = (index) => {
        setDraft((prev) => ({ components: prev.components.filter((_, i) => i !== index) }))
        setDirty(true)
    }

    const handleMoveComponent = (index, direction) => {
        setDraft((prev) => {
            const components = [...prev.components]
            const target = direction === 'up' ? index - 1 : index + 1
            if (target < 0 || target >= components.length) return prev
            ;[components[index], components[target]] = [components[target], components[index]]
            return { components }
        })
        setDirty(true)
    }

    const handleUpdateComponentProps = (index, updater) => {
        setDraft((prev) => ({
            components: prev.components.map((c, i) => {
                if (i !== index) return c
                const nextProps = typeof updater === 'function' ? updater(c.props ?? {}) : updater
                return { ...c, props: nextProps }
            }),
        }))
        setDirty(true)
    }

    const handleSave = async () => {
        if (!selectedPage || !selectedPageId) return
        setSaving(true)
        try {
            const updated = await updateCmsPage(selectedPageId, { components: draft.components })
            setPages((prev) => prev.map((p) => (p.id === selectedPageId ? { ...p, ...updated } : p)))
            setDirty(false)
            toastManager.add({ title: 'Guardado', description: 'Los cambios se han guardado.', type: 'success' })
        } catch (error) {
            toastManager.add({ title: 'Error', description: error.message || 'No se pudo guardar.', type: 'error' })
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="h-full overflow-y-auto py-6 lg:py-8">
            <div className="space-y-6">

                <AdminPageHeader
                    icon={Layers3}
                    title="Componentes"
                    description="Gestiona los componentes de contenido de cada página."
                >
                    {dirty && selectedPageId && (
                        <Button onClick={handleSave} disabled={saving}>
                            {saving ? 'Guardando…' : 'Guardar cambios'}
                        </Button>
                    )}
                </AdminPageHeader>

                {/* Unified card: page selector toolbar + component editor */}
                <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">

                    {/* Page selector toolbar */}
                    <div className="flex flex-wrap items-center gap-3 border-b border-gray-100 bg-gray-50/60 px-5 py-3">
                        <div className="flex flex-wrap items-center gap-3">
                            <span className="shrink-0 text-sm font-medium text-gray-600">Página</span>
                            <div className="relative">
                                <select
                                    value={selectedPageId ?? ''}
                                    onChange={(e) => handlePageSelect(e.target.value)}
                                    disabled={loading}
                                    className="h-9 appearance-none rounded-full border border-gray-200 bg-white pl-4 pr-9 text-sm text-gray-900 shadow-sm transition focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 disabled:opacity-50"
                                >
                                    <option value="">Selecciona una página…</option>
                                    {pages.map((p) => (
                                        <option key={p.id} value={p.id}>{p.title}</option>
                                    ))}
                                </select>
                                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            </div>
                            {selectedPage && (
                                <span className="font-mono text-xs text-gray-400">/{selectedPage.slug}</span>
                            )}
                        </div>
                        {selectedPageId && (
                            <label className="relative ml-auto w-full sm:w-64">
                                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-300" />
                                <input
                                    type="search"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Buscar componente…"
                                    className="h-9 w-full rounded-full border border-gray-200 bg-white pl-9 pr-3 text-sm outline-none transition-shadow placeholder:text-gray-300 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
                                />
                            </label>
                        )}
                    </div>

                    {/* Content */}
                    {!selectedPageId ? (
                        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                            <Layers3 className="h-8 w-8 text-gray-200" />
                            <p className="text-sm font-semibold text-gray-700">Selecciona una página</p>
                            <p className="max-w-xs text-xs leading-relaxed text-gray-400">
                                Elige una página en el selector para gestionar sus componentes.
                            </p>
                        </div>
                    ) : (
                        <ComponentEditorList
                            draft={draft}
                            componentTypes={componentTypes}
                            onUpdateComponentProps={handleUpdateComponentProps}
                            onAddComponent={handleAddComponent}
                            onDeleteComponent={handleDeleteComponent}
                            onMoveComponent={handleMoveComponent}
                            filterQuery={search}
                            seamless
                        />
                    )}

                </div>

            </div>
        </div>
    )
}

export default AdminComponents
