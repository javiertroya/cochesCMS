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
    getPublicCollectionBySlug,
    updateCollectionItem,
} from '@/services/collection_service'
import { getAdminMedia } from '@/services/media_service'

import AdminCollectionFilters from './AdminCollectionFilters'
import { CellValue, CourseCellValue } from './CollectionItemCells'
import ItemModal from './CollectionItemFields'
import ExpandedValueDialog from './ExpandedValueDialog'
import {
    getAdminFilterCollections,
    getAdminFilterDefinitions,
    getCollectionUploadTarget,
    itemMatchesAdminFilters,
    normalizeNewsImages,
} from './collectionItemsUtils'

const COURSE_DISPLAY_FIELDS = [
    { name: 'nombre', label: 'Nombre' },
    { name: 'descripcion', label: 'Descripción' },
    { name: 'grupo', label: 'Grupo' },
    { name: 'duracion', label: 'Duración' },
    { name: 'activo', label: 'Activo' },
]

const CollectionItemsManager = ({ collection }) => {
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(false)
    const [editItem, setEditItem] = useState(null)
    const [showCreate, setShowCreate] = useState(false)
    const [expandedValue, setExpandedValue] = useState(null)
    const [mediaItems, setMediaItems] = useState(null)
    const [courseRelationData, setCourseRelationData] = useState({ tecnicas: [], grupos: [] })
    const [filterRelationData, setFilterRelationData] = useState({})
    const [adminFilters, setAdminFilters] = useState({})
    const { confirm, confirmProps } = useConfirm()

    const fields = useMemo(() => collection.fields_schema ?? [], [collection.fields_schema])
    const uploadTarget = getCollectionUploadTarget(collection)
    const isCourseCollection = collection.slug === 'cursos' || collection.slug === 'cursos-iniciacion'
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
        if (!isCourseCollection) return

        Promise.all([
            getPublicCollectionBySlug('tecnicas').catch(() => ({ items: [] })),
            getPublicCollectionBySlug('grupos').catch(() => ({ items: [] })),
        ]).then(([tecnicas, grupos]) => {
            setCourseRelationData({
                tecnicas: tecnicas?.items ?? [],
                grupos: grupos?.items ?? [],
            })
        })
    }, [isCourseCollection])

    useEffect(() => {
        setAdminFilters({})
    }, [collection.id])

    useEffect(() => {
        const slugs = getAdminFilterCollections(collection.slug)
        if (slugs.length === 0) {
            setFilterRelationData({})
            return
        }

        let mounted = true
        Promise.all(
            slugs.map(slug =>
                getPublicCollectionBySlug(slug).catch(() => ({ items: [] }))
            )
        ).then(results => {
            if (!mounted) return
            const nextData = {}
            slugs.forEach((slug, index) => {
                nextData[slug] = results[index]?.items ?? []
            })
            setFilterRelationData(nextData)
        })

        return () => { mounted = false }
    }, [collection.slug])

    const relationData = useMemo(
        () => ({ ...filterRelationData, ...courseRelationData }),
        [filterRelationData, courseRelationData]
    )
    const displayFields = isCourseCollection ? COURSE_DISPLAY_FIELDS : fields
    const visibleItems = useMemo(
        () => items.filter(item => itemMatchesAdminFilters(item, collection.slug, adminFilters, relationData)),
        [items, collection.slug, adminFilters, relationData]
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
                relationData={relationData}
                filters={adminFilters}
                onChange={(key, value) => setAdminFilters(prev => ({ ...prev, [key]: value }))}
                onReset={() => setAdminFilters({})}
            />

            <div className="overflow-x-hidden">
                <table className="w-full table-fixed text-left text-sm">
                    <colgroup>
                        {displayFields.map(field => (
                            <col key={field.name} />
                        ))}
                        {displayFields.length === 0 && <col />}
                        <col className="w-20" />
                    </colgroup>
                    <thead className="border-b border-[#e5e7eb] bg-[#f6f7fb] text-xs uppercase tracking-wide text-[#6b7280]">
                        <tr>
                            {displayFields.map(field => (
                                <th key={field.name} className="px-2 py-3 font-semibold">
                                    {field.label}
                                    {['relation', 'relation-multi'].includes(field.type) && (
                                        <Link2 size={10} className="inline ml-1 text-blue-400" />
                                    )}
                                </th>
                            ))}
                            {displayFields.length === 0 && <th className="px-2 py-3 font-semibold">#</th>}
                            <th className="px-2 py-3 text-right font-semibold">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && (
                            <tr>
                                <td colSpan={displayFields.length + 2}>
                                    <AdminLoadingState label="Cargando elementos…" />
                                </td>
                            </tr>
                        )}
                        {!loading && error && (
                            <tr>
                                <td colSpan={displayFields.length + 2}>
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
                                <td colSpan={displayFields.length + 2}>
                                    <div className="flex flex-col items-center gap-2 py-14 text-center">
                                        <Database className="size-7 text-gray-200" />
                                        <p className="text-sm font-medium text-gray-400">Sin elementos</p>
                                        <p className="text-xs text-gray-300">Esta colección no tiene elementos todavía.</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                        {!loading && !error && items.length > 0 && visibleItems.length === 0 && (
                            <tr>
                                <td colSpan={displayFields.length + 2} className="py-8 text-center text-[#6b7280]">
                                    No hay elementos que coincidan con los filtros.
                                </td>
                            </tr>
                        )}
                        {visibleItems.map(item => (
                            <tr key={item.id} className="border-b border-[#eef0f4] last:border-0 hover:bg-[#fafafa]">
                                {displayFields.map(field => (
                                    <td key={field.name} className="min-w-0 px-2 py-3 align-top text-[#374151]">
                                        {isCourseCollection ? (
                                            <CourseCellValue
                                                column={field}
                                                item={item}
                                                relationData={courseRelationData}
                                                onExpand={setExpandedValue}
                                            />
                                        ) : (
                                            <CellValue
                                                field={field}
                                                value={collection.slug === 'noticias' && field.name === 'photo'
                                                    ? item.data?.images ?? item.data?.photo
                                                    : item.data?.[field.name]}
                                                knownMediaUrls={knownMediaUrls}
                                                onExpand={setExpandedValue}
                                                collectionSlug={collection.slug}
                                            />
                                        )}
                                    </td>
                                ))}
                                {displayFields.length === 0 && (
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
