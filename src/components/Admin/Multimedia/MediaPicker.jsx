import { useEffect, useRef, useState } from 'react'
import { FilmIcon, FolderOpen, ImageIcon, Loader2, UploadCloud } from 'lucide-react'

import {
    Sheet,
    SheetHeader,
    SheetPanel,
    SheetPopup,
    SheetTitle,
} from '@/components/UI/coss/sheet'
import { Button } from '@/components/UI/coss/button'
import { toastManager } from '@/components/UI/coss/toast'
import { uploadImage } from '@/services/upload_service'
import useMediaLibrary from '@/hooks/admin/useMediaLibrary'
import { MEDIA_ACCEPT, getThumbnailUrl } from '@/utils/media'

// ............................................................................
const MediaPicker = ({ open, onClose, onSelect }) => {
    const media = useMediaLibrary({ lazy: true })
    const fileInputRef = useRef(null)
    const [uploading, setUploading] = useState(false)
    const [categoryFilter, setCategoryFilter] = useState(null)

    useEffect(() => {
        if (open) {
            media.reload()
            media.loadCategories()
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open])

    const filteredItems = categoryFilter === null
        ? media.items
        : media.items.filter(item => item.category_id === categoryFilter)

    const handleFileChange = async (event) => {
        const file = event.target.files?.[0]
        if (!file) return

        setUploading(true)
        try {
            const response = await uploadImage('media', file, categoryFilter)
            await media.reload()
            onSelect(response.url)
        } catch (error) {
            toastManager.add({
                title: 'Error',
                description: error.message || 'No se pudo subir el archivo.',
                type: 'error',
            })
        } finally {
            setUploading(false)
            event.target.value = ''
        }
    }

    return (
        <Sheet open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose() }}>
            <SheetPopup side="right" className="max-w-lg">
                <SheetHeader>
                    <SheetTitle>Biblioteca de multimedia</SheetTitle>
                </SheetHeader>

                <SheetPanel>
                    <div className="space-y-4">
                        {/* Toolbar */}
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-[#6b7280]">
                                {filteredItems.length} {filteredItems.length === 1 ? 'archivo' : 'archivos'} — haz clic para seleccionar
                            </p>
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                loading={uploading}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <UploadCloud size={14} />
                                Subir nuevo
                            </Button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept={MEDIA_ACCEPT}
                                className="sr-only"
                                onChange={handleFileChange}
                            />
                        </div>

                        {/* Category pills */}
                        {media.categories.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                                <button
                                    type="button"
                                    onClick={() => setCategoryFilter(null)}
                                    className={`flex h-6 items-center rounded-full px-2.5 text-xs font-medium transition ${
                                        categoryFilter === null
                                            ? 'bg-brand-primary text-white'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    Todas
                                </button>
                                {media.categories.map(cat => (
                                    <button
                                        key={cat.id}
                                        type="button"
                                        onClick={() => setCategoryFilter(cat.id)}
                                        className={`flex h-6 items-center gap-1 rounded-full px-2.5 text-xs font-medium transition ${
                                            categoryFilter === cat.id
                                                ? 'bg-brand-primary text-white'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                    >
                                        <FolderOpen size={10} />
                                        {cat.name}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Grid */}
                        {media.loading ? (
                            <div className="flex justify-center py-10">
                                <Loader2 className="animate-spin text-gray-300" size={28} />
                            </div>
                        ) : filteredItems.length === 0 ? (
                            <div className="flex flex-col items-center gap-2 py-10 text-[#9ca3af]">
                                <ImageIcon size={36} className="opacity-40" />
                                <p className="text-sm">Sin archivos{categoryFilter !== null ? ' en esta categoría' : ' en la biblioteca'}</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-3 gap-3">
                                {filteredItems.map(item => (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => onSelect(item.url)}
                                        className="group relative overflow-hidden rounded-lg border border-[#dcdfea] bg-[#f6f7fb] text-left transition hover:border-blue-400 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                                    >
                                        <div className="aspect-square overflow-hidden">
                                            {item.type === 'image' ? (
                                                <img
                                                    src={getThumbnailUrl(item)}
                                                    loading="lazy"
                                                    alt={item.original_name}
                                                    className="h-full w-full object-cover transition group-hover:scale-105"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center">
                                                    <FilmIcon size={28} className="text-[#9ca3af]" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="px-2 py-1.5">
                                            <p className="truncate text-xs text-[#6b7280]" title={item.original_name}>
                                                {item.original_name}
                                            </p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </SheetPanel>
            </SheetPopup>
        </Sheet>
    )
}

export default MediaPicker
