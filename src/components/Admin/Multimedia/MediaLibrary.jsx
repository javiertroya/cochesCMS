import { useRef, useState } from 'react'
import {
    Copy, FilmIcon, FileText, FolderOpen, ImageIcon,
    Link2, Loader2, Pencil, RefreshCw, Search, Settings2, Trash2, Upload
} from 'lucide-react'

import { Button } from '@/components/UI/coss/button'
import { DeleteButton, EditButton } from '@/components/Admin/UI/ActionButtons'
import Toolbar from '@/components/Admin/UI/Toolbar'
import { toastManager } from '@/components/UI/coss/toast'
import {
    Sheet,
    SheetHeader,
    SheetPanel,
    SheetPopup,
    SheetTitle,
} from '@/components/UI/coss/sheet'
import { uploadImage } from '@/services/upload_service'
import { post } from '@/services/api'
import useMediaLibrary from '@/hooks/admin/useMediaLibrary'
import AdminPageHeader from '@/components/Admin/Layout/AdminPageHeader'
import { MEDIA_ACCEPT, getThumbnailUrl, resolveMediaUrl } from '@/utils/media'

// ............................................................................
function formatBytes(bytes) {
    if (!bytes) return '–'
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function FileTypeIcon({ mimeType, className }) {
    if (mimeType?.startsWith('image/')) return <ImageIcon className={className} />
    if (mimeType?.startsWith('video/')) return <FilmIcon className={className} />
    return <FileText className={className} />
}

function locationLabel(ref) {
    if (ref.location === 'seo_image') return 'Imagen SEO'
    if (ref.location === 'header_slides') return 'Cabecera / Carrusel'
    if (ref.location === 'component') return `Componente: ${ref.component_type || '–'}`
    return ref.location
}

const TYPE_OPTIONS = [
    { value: 'all',   label: 'Todos' },
    { value: 'image', label: 'Imágenes' },
    { value: 'video', label: 'Vídeos' },
]


// ............................................................................
function CategoryPanel({ open, onClose, categories, categoriesLoading, onCreate, onRename, onDelete }) {
    const [newName, setNewName] = useState('')
    const [creating, setCreating] = useState(false)
    const [editingId, setEditingId] = useState(null)
    const [editingValue, setEditingValue] = useState('')

    async function handleCreate(e) {
        e.preventDefault()
        if (!newName.trim()) return
        setCreating(true)
        try {
            await onCreate(newName.trim())
            setNewName('')
        } finally {
            setCreating(false)
        }
    }

    function startRename(cat) {
        setEditingId(cat.id)
        setEditingValue(cat.name)
    }

    async function commitRename(cat) {
        if (!editingValue.trim() || editingValue.trim() === cat.name) {
            setEditingId(null)
            return
        }
        try {
            await onRename(cat.id, editingValue.trim())
        } finally {
            setEditingId(null)
        }
    }

    return (
        <Sheet open={open} onOpenChange={isOpen => { if (!isOpen) onClose() }}>
            <SheetPopup side="right" className="max-w-sm">
                <SheetHeader>
                    <SheetTitle>Gestionar categorías</SheetTitle>
                </SheetHeader>
                <SheetPanel>
                    <div className="space-y-4">
                        {/* Create */}
                        <form onSubmit={handleCreate} className="flex gap-2">
                            <input
                                type="text"
                                value={newName}
                                onChange={e => setNewName(e.target.value)}
                                placeholder="Nueva categoría…"
                                className="h-8 flex-1 rounded-lg border border-gray-200 px-3 text-sm outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
                            />
                            <Button type="submit" size="sm" loading={creating} disabled={!newName.trim()}>
                                Crear
                            </Button>
                        </form>

                        {/* List */}
                        {categoriesLoading ? (
                            <div className="flex justify-center py-6">
                                <Loader2 className="animate-spin text-gray-300" size={24} />
                            </div>
                        ) : categories.length === 0 ? (
                            <p className="py-6 text-center text-sm text-gray-400">Sin categorías aún</p>
                        ) : (
                            <ul className="space-y-1">
                                {categories.map(cat => (
                                    <li key={cat.id} className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-gray-50">
                                        <FolderOpen size={15} className="shrink-0 text-amber-400" />
                                        {editingId === cat.id ? (
                                            <input
                                                autoFocus
                                                type="text"
                                                value={editingValue}
                                                onChange={e => setEditingValue(e.target.value)}
                                                onBlur={() => commitRename(cat)}
                                                onKeyDown={e => {
                                                    if (e.key === 'Enter') { e.preventDefault(); commitRename(cat) }
                                                    if (e.key === 'Escape') setEditingId(null)
                                                }}
                                                className="h-7 flex-1 rounded border border-brand-primary px-2 text-sm outline-none ring-2 ring-brand-primary/20"
                                            />
                                        ) : (
                                            <span className="flex-1 truncate text-sm text-gray-700">{cat.name}</span>
                                        )}
                                        {editingId !== cat.id && (
                                            <>
                                                <EditButton onClick={() => startRename(cat)} title="Renombrar categoría" />
                                                <DeleteButton onClick={() => onDelete(cat.id)} title="Eliminar categoría" />
                                            </>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </SheetPanel>
            </SheetPopup>
        </Sheet>
    )
}


// ............................................................................
function RefsPanel({ item, open, onClose, refs, loading }) {
    return (
        <Sheet open={open} onOpenChange={isOpen => { if (!isOpen) onClose() }}>
            <SheetPopup side="right" className="max-w-md">
                <SheetHeader>
                    <SheetTitle>Referencias de «{item?.original_name}»</SheetTitle>
                </SheetHeader>
                <SheetPanel>
                    {loading ? (
                        <div className="flex justify-center py-10">
                            <Loader2 className="animate-spin text-gray-300" size={28} />
                        </div>
                    ) : !refs || refs.length === 0 ? (
                        <div className="flex flex-col items-center gap-2 py-10 text-gray-400">
                            <Link2 size={32} className="opacity-30" />
                            <p className="text-sm">Este archivo no está referenciado en ninguna página.</p>
                        </div>
                    ) : (
                        <ul className="space-y-2">
                            {refs.map((ref, i) => (
                                <li key={i} className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                                    <p className="text-sm font-medium text-gray-800">{ref.page_title}</p>
                                    <p className="mt-0.5 text-xs text-gray-400">
                                        <span className="font-mono">{ref.page_slug}</span>
                                        <span className="mx-1.5 text-gray-300">·</span>
                                        {locationLabel(ref)}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    )}
                </SheetPanel>
            </SheetPopup>
        </Sheet>
    )
}


// ............................................................................
function MediaCard({ item, categories, onDelete, onCopyUrl, onUpdateName, onUpdateCategory, onShowRefs }) {
    const [editingName, setEditingName] = useState(false)
    const [nameValue, setNameValue] = useState(item.original_name)

    function startEdit() {
        setNameValue(item.original_name)
        setEditingName(true)
    }

    async function commitName() {
        setEditingName(false)
        const trimmed = nameValue.trim()
        if (!trimmed || trimmed === item.original_name) return
        try {
            await onUpdateName(item.id, trimmed)
        } catch {
            setNameValue(item.original_name)
        }
    }

    async function handleCategoryChange(e) {
        const val = e.target.value
        if (val === '') {
            onUpdateCategory(item.id, null)
        } else {
            onUpdateCategory(item.id, parseInt(val, 10))
        }
    }

    return (
        <div className="group overflow-hidden rounded-xl border border-gray-100 bg-white transition-shadow hover:shadow-md">
            {/* Thumbnail */}
            <div className="flex aspect-square items-center justify-center overflow-hidden bg-gray-50">
                {item.type === 'image' ? (
                    <img
                        src={getThumbnailUrl(item)}
                        alt={item.original_name}
                        loading="lazy"
                        className="h-full w-full object-cover"
                        onError={e => { e.target.style.display = 'none' }}
                    />
                ) : (
                    <FileTypeIcon mimeType={item.mime_type} className="h-8 w-8 text-gray-300" />
                )}
            </div>

            {/* Info */}
            <div className="p-2.5">
                {/* Editable name */}
                {editingName ? (
                    <input
                        autoFocus
                        type="text"
                        value={nameValue}
                        onChange={e => setNameValue(e.target.value)}
                        onBlur={commitName}
                        onKeyDown={e => {
                            if (e.key === 'Enter') { e.preventDefault(); commitName() }
                            if (e.key === 'Escape') { setEditingName(false); setNameValue(item.original_name) }
                        }}
                        className="w-full rounded border border-brand-primary px-1.5 py-0.5 text-xs outline-none ring-2 ring-brand-primary/20"
                    />
                ) : (
                    <button
                        type="button"
                        onClick={startEdit}
                        className="group/name flex w-full items-center gap-1 text-left"
                        title="Haz clic para editar el nombre"
                    >
                        <p className="truncate text-xs font-medium text-gray-700" title={item.original_name}>
                            {item.original_name}
                        </p>
                        <Pencil size={10} className="hidden shrink-0 text-gray-300 group-hover/name:block" />
                    </button>
                )}

                <p className="mt-0.5 text-[11px] text-gray-400">{formatBytes(item.file_size)}</p>

                {/* Category select */}
                <select
                    value={item.category_id ?? ''}
                    onChange={handleCategoryChange}
                    className="mt-1.5 w-full rounded-md border border-gray-200 bg-white px-1.5 py-0.5 text-[11px] text-gray-500 outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20"
                >
                    <option value="">Sin categoría</option>
                    {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                </select>

                {/* Actions */}
                <div className="mt-2 flex gap-1">
                    <button
                        type="button"
                        onClick={() => onCopyUrl(item.url)}
                        className="flex h-6 flex-1 items-center justify-center gap-1 rounded-md border border-gray-200 bg-white px-1.5 py-1 text-[11px] text-gray-500 transition hover:bg-gray-50"
                    >
                        <Copy size={11} />
                        Copiar
                    </button>

                    {item.ref_count > 0 && (
                        <button
                            type="button"
                            onClick={() => onShowRefs(item)}
                            className="flex h-6 items-center gap-0.5 rounded-md border border-blue-200 bg-blue-50 px-1.5 text-[11px] font-medium text-blue-600 transition hover:bg-blue-100"
                            title="Ver referencias"
                        >
                            <Link2 size={10} />
                            {item.ref_count}
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={() => onDelete(item.id)}
                        className="flex h-6 w-6 items-center justify-center rounded-md border border-gray-200 bg-white text-red-500 transition hover:border-red-200 hover:bg-red-50"
                        aria-label="Eliminar archivo"
                    >
                        <Trash2 size={11} />
                    </button>
                </div>
            </div>
        </div>
    )
}


// ............................................................................
const MediaLibrary = () => {
    const media = useMediaLibrary()
    const fileInputRef = useRef(null)
    const [uploading, setUploading] = useState(false)
    const [typeFilter, setTypeFilter] = useState('all')
    const [categoryFilter, setCategoryFilter] = useState(null)
    const [search, setSearch] = useState('')
    const [isDragOver, setIsDragOver] = useState(false)
    const [syncing, setSyncing] = useState(false)
    const [showCategoryPanel, setShowCategoryPanel] = useState(false)
    const [refsItem, setRefsItem] = useState(null)
    const [refsData, setRefsData] = useState(null)
    const [refsLoading, setRefsLoading] = useState(false)

    const counts = media.items.reduce((acc, item) => {
        acc.all += 1
        if (item.type === 'image') acc.image += 1
        if (item.type === 'video') acc.video += 1
        return acc
    }, { all: 0, image: 0, video: 0 })

    const filteredItems = media.items.filter(item => {
        const matchesType = typeFilter === 'all' || item.type === typeFilter
        const matchesCategory = categoryFilter === null || item.category_id === categoryFilter
        const q = search.toLowerCase()
        const matchesSearch = !search || (
            item.original_name?.toLowerCase().includes(q) ||
            item.filename?.toLowerCase().includes(q)
        )
        return matchesType && matchesCategory && matchesSearch
    })

    // Upload uses the active category filter so files land in the right folder
    async function handleFiles(fileList) {
        if (!fileList?.length) return
        setUploading(true)
        try {
            for (const file of Array.from(fileList)) {
                await uploadImage('media', file, categoryFilter)
            }
            await media.reload()
            toastManager.add({ title: 'Subido', description: 'Archivo subido correctamente.', type: 'success' })
        } catch (error) {
            toastManager.add({ title: 'Error', description: error.message || 'No se pudo subir el archivo.', type: 'error' })
        } finally {
            setUploading(false)
        }
    }

    const handleFileChange = async (event) => {
        await handleFiles(event.target.files)
        event.target.value = ''
    }

    function onDragOver(e) { e.preventDefault(); setIsDragOver(true) }
    function onDragLeave(e) { if (!e.currentTarget.contains(e.relatedTarget)) setIsDragOver(false) }
    async function onDrop(e) { e.preventDefault(); setIsDragOver(false); await handleFiles(e.dataTransfer.files) }

    function copyUrl(url) {
        navigator.clipboard.writeText(new URL(resolveMediaUrl(url), window.location.origin).href)
            .then(() => toastManager.add({ title: 'URL copiada', type: 'success' }))
    }

    async function handleSync() {
        setSyncing(true)
        try {
            const result = await post('/admin/media/sync', {})
            await media.reload()
            const msg = result.synced === 0
                ? 'No se encontraron archivos nuevos.'
                : `${result.synced} archivo${result.synced !== 1 ? 's' : ''} registrado${result.synced !== 1 ? 's' : ''}.`
            toastManager.add({ title: 'Sincronizado', description: msg, type: 'success' })
        } catch {
            toastManager.add({ title: 'Error', description: 'No se pudo sincronizar.', type: 'error' })
        } finally {
            setSyncing(false)
        }
    }

    async function handleShowRefs(item) {
        setRefsItem(item)
        setRefsData(null)
        setRefsLoading(true)
        try {
            const data = await media.getReferences(item.id)
            setRefsData(data)
        } catch {
            toastManager.add({ title: 'Error', description: 'No se pudieron cargar las referencias.', type: 'error' })
        } finally {
            setRefsLoading(false)
        }
    }

    async function handleUpdateCategory(id, categoryId) {
        if (categoryId === null) {
            await media.clearItemCategory(id)
        } else {
            await media.updateMediaItem(id, { category_id: categoryId })
        }
    }

    return (
        <div className="space-y-6">
            <AdminPageHeader
                icon={ImageIcon}
                title="Multimedia"
                description="Gestiona las imágenes y archivos subidos al servidor"
            >
                <div className="flex items-center gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowCategoryPanel(true)}
                        title="Gestionar categorías"
                    >
                        <Settings2 size={15} />
                        Categorías
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        loading={syncing}
                        onClick={handleSync}
                        title="Registrar en la tabla media todos los archivos existentes en el servidor"
                    >
                        <RefreshCw size={15} />
                        Sincronizar
                    </Button>
                    <Button
                        type="button"
                        loading={uploading}
                        onClick={() => fileInputRef.current?.click()}
                        title={categoryFilter ? `Subir a: ${media.categories.find(c => c.id === categoryFilter)?.name}` : 'Subir archivo'}
                    >
                        <Upload size={16} />
                        Subir archivo
                    </Button>
                </div>
            </AdminPageHeader>
            <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={MEDIA_ACCEPT}
                className="sr-only"
                onChange={handleFileChange}
            />

            <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                <Toolbar
                    filters={TYPE_OPTIONS.map(({ value, label }) => ({ value, label, count: counts[value] }))}
                    activeFilter={typeFilter}
                    onFilterChange={setTypeFilter}
                    search={search}
                    onSearchChange={setSearch}
                    searchPlaceholder="Buscar por nombre..."
                    filteredCount={filteredItems.length}
                    totalCount={media.items.length}
                />

                {/* Category pills */}
                {media.categories.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 border-b border-gray-100 px-5 py-2.5">
                        <button
                            type="button"
                            onClick={() => setCategoryFilter(null)}
                            className={`flex h-7 items-center gap-1.5 rounded-full px-3 text-xs font-medium transition ${
                                categoryFilter === null
                                    ? 'bg-brand-primary text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            Todas
                        </button>
                        {media.categories.map(cat => {
                            const count = media.items.filter(i => i.category_id === cat.id).length
                            return (
                                <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => setCategoryFilter(cat.id)}
                                    className={`flex h-7 items-center gap-1.5 rounded-full px-3 text-xs font-medium transition ${
                                        categoryFilter === cat.id
                                            ? 'bg-brand-primary text-white'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    <FolderOpen size={11} />
                                    {cat.name}
                                    <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                                        categoryFilter === cat.id ? 'bg-white/20' : 'bg-gray-200'
                                    }`}>
                                        {count}
                                    </span>
                                </button>
                            )
                        })}
                        {categoryFilter !== null && (
                            <span className="ml-1 text-[11px] text-gray-400">
                                Los archivos subidos ahora irán a «{media.categories.find(c => c.id === categoryFilter)?.name}»
                            </span>
                        )}
                    </div>
                )}

                {/* Content */}
                <div
                    className={`relative min-h-80 ${isDragOver ? 'bg-gray-50' : ''}`}
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    onDrop={onDrop}
                >
                    {isDragOver && (
                        <div className="pointer-events-none absolute inset-3 z-10 flex items-center justify-center rounded-xl border-2 border-dashed border-brand-primary bg-white/80">
                            <div className="text-center">
                                <Upload size={28} className="mx-auto mb-2 text-brand-primary" />
                                <p className="text-sm font-semibold text-gray-900">Suelta los archivos para subirlos</p>
                                {categoryFilter !== null && (
                                    <p className="mt-1 text-xs text-gray-500">
                                        → {media.categories.find(c => c.id === categoryFilter)?.name}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {media.loading ? (
                        <div className="flex items-center justify-center p-16">
                            <Loader2 className="animate-spin text-gray-300" size={36} />
                        </div>
                    ) : media.items.length === 0 ? (
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="m-6 flex w-[calc(100%-3rem)] cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-gray-200 py-16 text-center transition hover:border-gray-300 hover:bg-gray-50"
                        >
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
                                <Upload size={24} className="text-gray-400" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-semibold text-gray-700">Arrastra archivos aquí</p>
                                <p className="text-xs text-gray-400">o haz clic para seleccionar archivos</p>
                            </div>
                        </button>
                    ) : filteredItems.length === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                            <Search className="h-8 w-8 text-gray-200" />
                            <p className="text-sm font-semibold text-gray-700">Sin resultados</p>
                            <p className="max-w-xs text-xs leading-relaxed text-gray-400">
                                Prueba con otra búsqueda o cambia el filtro activo.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                            {filteredItems.map(item => (
                                <MediaCard
                                    key={item.id}
                                    item={item}
                                    categories={media.categories}
                                    onDelete={media.deleteMedia}
                                    onCopyUrl={copyUrl}
                                    onUpdateName={(id, name) => media.updateMediaItem(id, { original_name: name })}
                                    onUpdateCategory={handleUpdateCategory}
                                    onShowRefs={handleShowRefs}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </section>

            <CategoryPanel
                open={showCategoryPanel}
                onClose={() => setShowCategoryPanel(false)}
                categories={media.categories}
                categoriesLoading={media.categoriesLoading}
                onCreate={media.createCategory}
                onRename={media.renameCategory}
                onDelete={media.deleteCategory}
            />

            <RefsPanel
                open={!!refsItem}
                onClose={() => setRefsItem(null)}
                item={refsItem}
                refs={refsData}
                loading={refsLoading}
            />
        </div>
    )
}

export default MediaLibrary
