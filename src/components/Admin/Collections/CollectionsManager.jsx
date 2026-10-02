import { useCallback, useEffect, useState } from 'react'
import { ChevronLeft, Database, Inbox, Plus } from 'lucide-react'
import { Button } from '@/components/UI/coss/button'

import CollectionRow from '@/components/Admin/Collections/CollectionRow'
import CollectionListHeader from '@/components/Admin/Collections/CollectionListHeader'
import CollectionItemsManager from '@/components/Admin/Collections/CollectionItemsManager'
import NewCollectionModal from '@/components/Admin/Collections/NewCollectionModal'
import ConfirmDialog from '@/components/Admin/UI/ConfirmDialog'
import AdminPageHeader from '@/components/Admin/Layout/AdminPageHeader'
import AdminLoadingState from '@/components/Admin/UI/AdminLoadingState'
import AdminErrorState from '@/components/Admin/UI/AdminErrorState'
import Toolbar from '@/components/Admin/UI/Toolbar'
import useConfirm from '@/hooks/admin/useConfirm'
import { toastManager } from '@/components/UI/coss/toast'
import { getCollections, createCollection, deleteCollection } from '@/services/collection_service'

const CollectionsManager = () => {
    const [collections, setCollections]           = useState([])
    const [loading, setLoading]                   = useState(false)
    const [error, setError]                       = useState(false)
    const [activeCollection, setActiveCollection] = useState(null)
    const [showNewModal, setShowNewModal]          = useState(false)
    const [search, setSearch]                     = useState('')
    const { confirm, confirmProps }               = useConfirm()

    const load = useCallback(async () => {
        setLoading(true)
        setError(false)
        try {
            const data = await getCollections()
            setCollections(data)
        } catch {
            setError(true)
            toastManager.add({ title: 'Error', description: 'No se pudieron cargar las colecciones.', type: 'error' })
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { load() }, [load])

    const handleSaveCollection = async (newCol) => {
        try {
            const created = await createCollection(newCol)
            setCollections(prev => [...prev, { ...created, item_count: 0 }])
            setShowNewModal(false)
            toastManager.add({ title: 'Colección creada', description: `"${created.name}" lista para usar.`, type: 'success' })
        } catch {
            toastManager.add({ title: 'Error', description: 'No se pudo crear la colección.', type: 'error' })
        }
    }

    const handleDeleteCollection = async (col) => {
        const ok = await confirm(`¿Eliminar la colección "${col.name}"? Esta acción no se puede deshacer.`)
        if (!ok) return
        try {
            await deleteCollection(col.id)
            setCollections(prev => prev.filter(c => c.id !== col.id))
            if (activeCollection?.id === col.id) setActiveCollection(null)
            toastManager.add({ title: 'Eliminada', description: `La colección "${col.name}" se ha eliminado.`, type: 'success' })
        } catch (err) {
            const msg = err?.detail ?? err?.message ?? 'No se pudo eliminar la colección.'
            toastManager.add({ title: 'Error', description: msg, type: 'error' })
        }
    }

    const filtered = collections.filter(c =>
        !search || c.name.toLowerCase().includes(search.toLowerCase())
    )

    if (activeCollection) {
        const fieldCount = activeCollection.fields_schema?.length ?? 0
        const itemCount  = activeCollection.item_count ?? 0

        return (
            <div className="h-full overflow-y-auto py-6 lg:py-8">
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => setActiveCollection(null)}
                            className="flex items-center gap-1.5 text-sm text-[#9ca3af] hover:text-[#111827] transition-colors"
                        >
                            <ChevronLeft className="h-4 w-4" />
                            Volver a colecciones
                        </button>
                        <div className="flex items-center gap-4 text-sm text-[#9ca3af]">
                            <span>
                                <strong className="text-[#111827]">{fieldCount}</strong>{' '}
                                campo{fieldCount !== 1 ? 's' : ''}
                            </span>
                            <span className="w-px h-4 bg-[#e5e7eb] inline-block" />
                            <span>
                                <strong className="text-[#111827]">{itemCount}</strong>{' '}
                                ítem{itemCount !== 1 ? 's' : ''}
                            </span>
                        </div>
                    </div>

                    <CollectionItemsManager
                        key={activeCollection.id}
                        collection={activeCollection}
                    />
                </div>
            </div>
        )
    }

    return (
        <>
            <div className="h-full overflow-y-auto py-6 lg:py-8">
                <div className="space-y-6">
                    <AdminPageHeader
                        icon={Database}
                        title="Colecciones"
                        description="Crea y administra conjuntos de datos dinámicos."
                    >
                        <Button onClick={() => setShowNewModal(true)}>
                            <Plus size={16} />
                            Nueva colección
                        </Button>
                    </AdminPageHeader>

                    <div className="rounded-xl border border-[#e5e7eb] bg-white shadow-sm overflow-hidden">
                        <Toolbar
                            filters={[]}
                            search={search}
                            onSearchChange={setSearch}
                            searchPlaceholder="Buscar colección…"
                            filteredCount={filtered.length}
                            totalCount={collections.length}
                        />

                        {loading ? (
                            <AdminLoadingState label="Cargando colecciones…" />
                        ) : error ? (
                            <AdminErrorState
                                title="Error al cargar colecciones"
                                description="No se han podido cargar las colecciones. Inténtalo de nuevo."
                                onRetry={load}
                            />
                        ) : collections.length === 0 ? (
                            <div className="flex flex-col items-center gap-2 py-14 text-center">
                                <Database size={28} className="text-[#d1d5db]" />
                                <p className="text-sm font-medium text-[#9ca3af]">Sin colecciones</p>
                                <p className="text-xs text-[#d1d5db]">Crea una colección para almacenar datos dinámicos.</p>
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="flex flex-col items-center gap-2 py-14 text-center">
                                <Inbox size={28} className="text-[#d1d5db]" />
                                <p className="text-sm font-medium text-[#9ca3af]">Sin resultados</p>
                                <p className="text-xs text-[#d1d5db]">Prueba con otro término de búsqueda.</p>
                            </div>
                        ) : (
                            <>
                                <CollectionListHeader />
                                <div className="divide-y divide-[#f3f4f6]">
                                    {filtered.map(col => (
                                        <CollectionRow
                                            key={col.id}
                                            collection={col}
                                            onView={() => setActiveCollection(col)}
                                            onDelete={handleDeleteCollection}
                                        />
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {showNewModal && (
                <NewCollectionModal
                    onClose={() => setShowNewModal(false)}
                    onSave={handleSaveCollection}
                />
            )}

            <ConfirmDialog {...confirmProps} />
        </>
    )
}

export default CollectionsManager
