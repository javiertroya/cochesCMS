import { useCallback, useEffect, useMemo, useState } from 'react'
import { Database, Link2, Lock, Plus } from 'lucide-react'

import { Button } from '@/components/UI/coss/button'
import { DeleteButton, EditButton } from '@/components/Admin/UI/ActionButtons'
import ConfirmDialog from '@/components/Admin/UI/ConfirmDialog'
import AdminLoadingState from '@/components/Admin/UI/AdminLoadingState'
import AdminErrorState from '@/components/Admin/UI/AdminErrorState'
import useConfirm from '@/hooks/admin/useConfirm'
import { toastManager } from '@/components/UI/coss/toast'
import {
    createCollectionItem,
    deleteCollectionItem,
    getCollectionItems,
    updateCollectionItem,
} from '@/services/collection_service'
import { getAdminMedia } from '@/services/media_service'

import AdminCollectionFilters from './AdminCollectionFilters'
import { CellValue } from './CollectionItemCells'
import ItemModal from './CollectionItemFields'
import ExpandedValueDialog from './ExpandedValueDialog'
import {
    getAdminFilterDefinitions,
    getCollectionUploadTarget,
    itemMatchesAdminFilters,
    normalizeNewsImages,
} from './collectionItemsUtils'

const CollectionItemsManager = ({ collection }) => {
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(false)
    const [editItem, setEditItem] = useState(null)
    const [showCreate, setShowCreate] = useState(false)
    const [expandedValue, setExpandedValue] = useState(null)
    const [mediaItems, setMediaItems] = useState(null)
    const [adminFilters, setAdminFilters] = useState({})
    const { confirm, confirmProps } = useConfirm()

    const fields = useMemo(() => collection.fields_schema ?? [], [collection.fields_schema])
    const uploadTarget = getCollectionUploadTarget(collection)
    const filterDefinitions = useMemo(() => getAdminFilterDefinitions(collection.slug), [collection.slug])
    const hasImageFields = useMemo(() => fields.some(field => field.type === 'image'), [fields])
    const knownMediaUrls = useMemo(
        () => mediaItems ? new Set(mediaItems.map(media => media.url)) : null,
        [mediaItems]
    )

    useEffect(() => {
        if (!hasImageFields) return
        getAdminMedia().then(setMediaItems).catch(() => {})
    }, [hasImageFields])

    useEffect(() => {
        setAdminFilters({})
    }, [collection.id])

    // Columnas de la tabla: una por campo (o "#" si no hay campos) + Acciones
    const columnCount = Math.max(fields.length, 1) + 1
    const visibleItems = useMemo(
        () => items.filter(item => itemMatchesAdminFilters(item, adminFilters)),
        [items, adminFilters]
    )

    const load = useCallback(async () => {
        setLoading(true)
        setError(false)
        try {
            const data = await getCollectionItems(collection.id)
            setItems(data)
        } catch {
            setError(true)
            toastManager.add({ title: 'Error', description: 'No se pudieron cargar los elementos.', type: 'error' })
        } finally {
            setLoading(false)
        }
    }, [collection.id])

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            load()
        }, 0)

        return () => window.clearTimeout(timeoutId)
    }, [load])

    const handleSave = async (formData) => {
        const payload = { ...formData }

        if (collection.slug === 'noticias') {
            const images = Array.isArray(payload.photo)
                ? payload.photo
                : normalizeNewsImages(payload)

            payload.images = images
            payload.photo = images[0] ?? ''
        }

        try {
            if (editItem) {
                await updateCollectionItem(collection.id, editItem.id, payload)
                toastManager.add({ title: 'Guardado', description: 'Elemento actualizado.', type: 'success' })
            } else {
                await createCollectionItem(collection.id, payload)
                toastManager.add({ title: 'Creado', description: 'Elemento añadido.', type: 'success' })
            }
            setEditItem(null)
            setShowCreate(false)
            await load()
        } catch {
            toastManager.add({ title: 'Error', description: 'No se pudo guardar el elemento.', type: 'error' })
        }
    }

    const handleToggle = async (item, field) => {
        const current = item.data?.[field.name] ?? field.default ?? false
        const data = { ...item.data, [field.name]: !current }
        setItems(prev => prev.map(currentItem => currentItem.id === item.id ? { ...currentItem, data } : currentItem))
        try {
            await updateCollectionItem(collection.id, item.id, data)
        } catch {
            setItems(prev => prev.map(currentItem => currentItem.id === item.id ? item : currentItem))
            toastManager.add({ title: 'Error', description: 'No se pudo actualizar el elemento.', type: 'error' })
        }
    }

    const handleDelete = async (item) => {
        const ok = await confirm('¿Eliminar este elemento? Esta acción no se puede deshacer.')
        if (!ok) return
        try {
            await deleteCollectionItem(collection.id, item.id)
            setItems(prev => prev.filter(currentItem => currentItem.id !== item.id))
            toastManager.add({ title: 'Eliminado', description: 'Elemento eliminado.', type: 'success' })
        } catch (err) {
            const msg = err?.detail ?? 'No se pudo eliminar. Puede que esté referenciado por otros registros.'
            toastManager.add({ title: 'Error', description: msg, type: 'error' })
        }
    }

    return (
        <div className="rounded-lg border border-[#dcdfea] bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#dcdfea] px-5 py-4">
                <div>
                    <h2 className="text-xl font-bold text-[#111827]">{collection.name}</h2>
                    {collection.description && (
                        <p className="text-sm text-[#6b7280]">{collection.description}</p>
                    )}
                    {collection.is_locked && (
                        <p className="mt-1 flex items-center gap-1 text-xs text-amber-600">
                            <Lock size={11} />
                            Colección protegida — no se puede eliminar
                        </p>
                    )}
                </div>
                <Button onClick={() => setShowCreate(true)}>
                    <Plus size={16} />
                    Nuevo elemento
                </Button>
            </div>

            <AdminCollectionFilters
                definitions={filterDefinitions}
                filters={adminFilters}
                onChange={(key, value) => setAdminFilters(prev => ({ ...prev, [key]: value }))}
                onReset={() => setAdminFilters({})}
            />

            <div className="overflow-x-auto">
                <table
                    className="w-full table-fixed text-left text-sm"
                    // Ancho mínimo por columna: en móvil la tabla se desplaza en horizontal en vez de aplastarse
                    style={{ minWidth: `${Math.max(fields.length, 1) * 9 + 5}rem` }}
                >
                    <colgroup>
                        {fields.map(field => (
                            <col key={field.name} />
                        ))}
                        {fields.length === 0 && <col />}
                        <col className="w-20" style={{ width: '5rem' }} />
                    </colgroup>
                    <thead className="border-b border-[#e5e7eb] bg-[#f6f7fb] text-xs uppercase tracking-wide text-[#6b7280]">
                        <tr>
                            {fields.map(field => (
                                <th key={field.name} className="px-2 py-3 font-semibold">
                                    {field.label}
                                    {['relation', 'relation-multi'].includes(field.type) && (
                                        <Link2 size={10} className="inline ml-1 text-blue-400" />
                                    )}
                                </th>
                            ))}
                            {fields.length === 0 && <th className="px-2 py-3 font-semibold">#</th>}
                            <th className="px-2 py-3 text-right font-semibold">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && (
                            <tr>
                                <td colSpan={columnCount}>
                                    <AdminLoadingState label="Cargando elementos…" />
                                </td>
                            </tr>
                        )}
                        {!loading && error && (
                            <tr>
                                <td colSpan={columnCount}>
                                    <AdminErrorState
                                        title="Error al cargar elementos"
                                        description="No se han podido cargar los elementos de esta colección."
                                        onRetry={load}
                                    />
                                </td>
                            </tr>
                        )}
                        {!loading && !error && items.length === 0 && (
                            <tr>
                                <td colSpan={columnCount}>
                                    <div className="sticky left-0 flex w-[calc(100vw-2.25rem)] flex-col items-center gap-2 py-14 text-center sm:w-[calc(100vw-3.25rem)] lg:w-auto">
                                        <Database className="size-7 text-gray-200" />
                                        <p className="text-sm font-medium text-gray-400">Sin elementos</p>
                                        <p className="text-xs text-gray-300">Esta colección no tiene elementos todavía.</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                        {!loading && !error && items.length > 0 && visibleItems.length === 0 && (
                            <tr>
                                <td colSpan={columnCount} className="py-8 text-center text-[#6b7280]">
                                    No hay elementos que coincidan con los filtros.
                                </td>
                            </tr>
                        )}
                        {visibleItems.map(item => (
                            <tr key={item.id} className="border-b border-[#eef0f4] last:border-0 hover:bg-[#fafafa]">
                                {fields.map(field => (
                                    <td key={field.name} className="min-w-0 px-2 py-3 align-top text-[#374151]">
                                        <CellValue
                                            field={field}
                                            value={collection.slug === 'noticias' && field.name === 'photo'
                                                ? item.data?.images ?? item.data?.photo
                                                : item.data?.[field.name]}
                                            knownMediaUrls={knownMediaUrls}
                                            onExpand={setExpandedValue}
                                            onToggle={() => handleToggle(item, field)}
                                            collectionSlug={collection.slug}
                                        />
                                    </td>
                                ))}
                                {fields.length === 0 && (
                                    <td className="px-2 py-3 font-mono text-xs text-[#9ca3af]">#{item.id}</td>
                                )}
                                <td className="px-2 py-3 align-top">
                                    <div className="flex justify-end gap-1">
                                        <EditButton onClick={() => setEditItem(item)} />
                                        <DeleteButton onClick={() => handleDelete(item)} />
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {(showCreate || editItem) && (
                <ItemModal
                    fields={fields}
                    initial={editItem?.data ?? null}
                    uploadTarget={uploadTarget}
                    collectionSlug={collection.slug}
                    onSave={handleSave}
                    onClose={() => { setShowCreate(false); setEditItem(null) }}
                />
            )}

            <ExpandedValueDialog
                item={expandedValue}
                onClose={() => setExpandedValue(null)}
            />

            <ConfirmDialog {...confirmProps} />
        </div>
    )
}

export default CollectionItemsManager
