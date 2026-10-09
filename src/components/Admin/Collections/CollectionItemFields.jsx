import { useEffect, useState } from 'react'
import { ImagePlus, Images, Link2, Trash2, UploadCloud, X } from 'lucide-react'

import { Button } from '@/components/UI/coss/button'
import MediaField from '@/components/Admin/Pages/MediaField'
import MediaPicker from '@/components/Admin/Multimedia/MediaPicker'
import { Spinner } from '@/components/UI/coss/spinner'
import { toastManager } from '@/components/UI/coss/toast'
import { getPublicCollectionBySlug } from '@/services/collection_service'
import { uploadImage } from '@/services/upload_service'

import { getItemLabel, INPUT_CLS, normalizeNewsImages } from './collectionItemsUtils'
import { IMAGE_ACCEPT, resolveMediaUrl } from '@/utils/media'
import { toImageList } from '@/utils/collection'

const sortByLabel = (items) =>
    [...items].sort((a, b) => getItemLabel(a).localeCompare(getItemLabel(b), 'es'))

const RelationField = ({ field, value, onChange, relatedItems }) => {
    const options = sortByLabel(relatedItems[field.collection] ?? [])
    return (
        <select
            value={value ?? ''}
            onChange={e => onChange(field.name, e.target.value || null)}
            className={INPUT_CLS}
        >
            <option value="">{field.required ? '— Selecciona una opción —' : '— Sin selección —'}</option>
            {options.map(item => {
                const label = getItemLabel(item)
                return <option key={item.id} value={label}>{label}</option>
            })}
        </select>
    )
}

const RelationMultiField = ({ field, value = [], onChange, relatedItems }) => {
    const options = relatedItems[field.collection] ?? []
    const selected = Array.isArray(value) ? value : []

    const toggle = (label) => {
        const next = selected.includes(label)
            ? selected.filter(v => v !== label)
            : [...selected, label]
        onChange(field.name, next)
    }

    return (
        <div className="max-h-48 overflow-y-auto space-y-1 rounded-lg border border-[#e5e7eb] bg-[#f9fafb] p-2">
            {options.length === 0 && (
                <div className="flex items-center gap-2 px-1 py-1">
                    <Spinner className="h-3.5 w-3.5 text-[#9ca3af]" />
                    <span className="text-xs text-[#9ca3af]">Cargando opciones…</span>
                </div>
            )}
            {options.map(item => {
                const label = getItemLabel(item)
                const checked = selected.includes(label)
                return (
                    <label key={item.id} className="flex items-center gap-2.5 cursor-pointer rounded-md px-2 py-1.5 hover:bg-white text-sm">
                        <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggle(label)}
                            className="size-4 rounded border-[#e5e7eb] accent-brand-primary"
                        />
                        <span className={checked ? 'font-medium text-[#111827]' : 'text-[#374151]'}>{label}</span>
                    </label>
                )
            })}
        </div>
    )
}

const ImagesField = ({ value = [], onChange, target = 'media', hint }) => {
    const [uploading, setUploading] = useState(false)
    const [pickerOpen, setPickerOpen] = useState(false)
    const images = Array.isArray(value) ? value : []

    const addImages = (nextImages) => {
        const cleanImages = nextImages
            .filter(url => typeof url === 'string' && url.trim())
            .map(url => url.trim())
        onChange([...new Set([...images, ...cleanImages])])
    }

    const removeImage = (url) => {
        onChange(images.filter(image => image !== url))
    }

    const handleUpload = async (event) => {
        const files = Array.from(event.target.files ?? [])
        if (files.length === 0) return

        setUploading(true)
        try {
            const uploaded = await Promise.all(files.map(file => uploadImage(target, file)))
            addImages(uploaded.map(item => item.url))
            toastManager.add({
                title: files.length > 1 ? 'Imágenes subidas' : 'Imagen subida',
                description: files.length > 1
                    ? 'Las imágenes se han añadido correctamente.'
                    : 'La imagen se ha añadido correctamente.',
                type: 'success',
            })
        } catch (err) {
            const message = err.message || 'No se pudieron subir las imágenes.'
            toastManager.add({
                title: 'Error al subir imágenes',
                description: message,
                type: 'error',
            })
        } finally {
            setUploading(false)
            event.target.value = ''
        }
    }

    return (
        <div className="space-y-3">
            {images.length > 0 ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {images.map((url, index) => (
                        <div key={url} className="group relative overflow-hidden rounded-lg border border-[#e5e7eb] bg-[#f9fafb]">
                            <img src={resolveMediaUrl(url)} alt="" className="h-28 w-full object-cover" />
                            {index === 0 && (
                                <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-semibold text-[#374151] shadow-sm">
                                    Portada
                                </span>
                            )}
                            <Button
                                type="button"
                                variant="destructive"
                                size="icon-sm"
                                className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100"
                                onClick={() => removeImage(url)}
                                aria-label="Quitar imagen"
                            >
                                <Trash2 size={13} />
                            </Button>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-[#e5e7eb] bg-[#f9fafb] p-6 text-sm text-[#6b7280]">
                    <ImagePlus size={18} className="mr-2 text-[#9ca3af]" />
                    Sin imágenes añadidas
                </div>
            )}

            <div className="flex flex-wrap gap-2">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    loading={uploading}
                    render={<label />}
                >
                    <UploadCloud size={14} />
                    {uploading ? 'Subiendo...' : 'Subir imágenes'}
                    <input
                        type="file"
                        accept={IMAGE_ACCEPT}
                        multiple
                        className="sr-only"
                        onChange={handleUpload}
                    />
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setPickerOpen(true)}
                >
                    <Images size={14} />
                    Desde biblioteca
                </Button>
                {images.length > 0 && (
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onChange([])}
                    >
                        <X size={14} />
                        Quitar todas
                    </Button>
                )}
            </div>

            <p className="text-xs text-[#6b7280]">
                {hint ?? 'La primera imagen se usará como portada.'}
            </p>

            <MediaPicker
                open={pickerOpen}
                onClose={() => setPickerOpen(false)}
                onSelect={(url) => {
                    addImages([url])
                    setPickerOpen(false)
                }}
            />
        </div>
    )
}

const FieldInput = ({ field, value, onChange, relatedItems, uploadTarget, collectionSlug }) => {
    if (field.type === 'relation') {
        return <RelationField field={field} value={value} onChange={onChange} relatedItems={relatedItems} />
    }
    if (field.type === 'relation-multi') {
        return <RelationMultiField field={field} value={value} onChange={onChange} relatedItems={relatedItems} />
    }
    if (field.type === 'image') {
        const isNewsPhoto = collectionSlug === 'noticias' && field.name === 'photo'
        if (isNewsPhoto || field.multiple) {
            return (
                <ImagesField
                    target={uploadTarget}
                    value={value}
                    onChange={(nextValue) => onChange(field.name, nextValue)}
                    hint={isNewsPhoto ? 'La primera imagen se usará como portada de la noticia.' : undefined}
                />
            )
        }

        return (
            <MediaField
                target={uploadTarget}
                value={value ?? ''}
                onChange={(nextValue) => onChange(field.name, nextValue)}
            />
        )
    }

    const common = {
        value: value ?? '',
        onChange: e => onChange(field.name, e.target.type === 'checkbox' ? e.target.checked : e.target.value),
        className: INPUT_CLS,
    }

    if (field.type === 'textarea') return <textarea rows={3} {...common} />
    if (field.type === 'boolean') return (
        <input
            type="checkbox"
            checked={!!value}
            onChange={e => onChange(field.name, e.target.checked)}
            className="size-4 rounded border-[#e5e7eb]"
        />
    )
    if (field.type === 'number') return <input type="number" {...common} />
    if (field.type === 'date') return <input type="date" {...common} />
    if (field.type === 'time') return <input type="time" {...common} />
    return <input type="text" {...common} />
}

const ItemModal = ({ fields, initial, uploadTarget, collectionSlug, onSave, onClose }) => {
    const [form, setForm] = useState(() => {
        const base = {}
        fields.forEach(f => {
            if (collectionSlug === 'noticias' && f.name === 'photo') {
                base[f.name] = normalizeNewsImages(initial)
            } else if (f.type === 'image' && f.multiple) {
                base[f.name] = toImageList(initial?.[f.name])
            } else {
                base[f.name] = initial?.[f.name]
                    ?? (!initial && f.default !== undefined ? f.default : undefined)
                    ?? (f.type === 'relation-multi' ? [] : f.type === 'boolean' ? false : '')
            }
        })
        return base
    })
    const [relatedItems, setRelatedItems] = useState({})

    useEffect(() => {
        const relationSlugs = [...new Set(
            fields
                .filter(f => ['relation', 'relation-multi'].includes(f.type) && f.collection)
                .map(f => f.collection)
        )]
        if (relationSlugs.length === 0) return

        Promise.all(relationSlugs.map(slug =>
            getPublicCollectionBySlug(slug).catch(() => ({ items: [] }))
        )).then(results => {
            const map = {}
            relationSlugs.forEach((slug, i) => { map[slug] = results[i]?.items ?? [] })
            setRelatedItems(map)
        })
    }, [fields])

    const [errors, setErrors] = useState({})

    const setField = (name, val) => {
        setForm(prev => ({ ...prev, [name]: val }))
        setErrors(prev => ({ ...prev, [name]: undefined }))
    }

    const isEmpty = (value) =>
        value == null || (typeof value === 'string' && !value.trim()) || (Array.isArray(value) && value.length === 0)

    const handleSave = () => {
        const nextErrors = {}
        fields.forEach(field => {
            if (field.required && field.type !== 'boolean' && isEmpty(form[field.name])) {
                nextErrors[field.name] = 'Este campo es obligatorio.'
            }
        })
        setErrors(nextErrors)
        if (Object.keys(nextErrors).length === 0) onSave(form)
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
                <div className="border-b border-[#f3f4f6] px-6 py-4">
                    <h3 className="text-base font-bold text-[#111827]">
                        {initial ? 'Editar elemento' : 'Nuevo elemento'}
                    </h3>
                </div>

                <div className="max-h-[60vh] overflow-y-auto px-6 py-4 space-y-4">
                    {fields.map(field => (
                        <div key={field.name}>
                            <label className="mb-1 block text-xs font-semibold text-[#374151]">
                                {field.label}
                                {field.required && <span className="ml-1 text-red-500">*</span>}
                                {['relation', 'relation-multi'].includes(field.type) && (
                                    <span className="ml-2 inline-flex items-center gap-0.5 text-[#9ca3af] font-normal">
                                        <Link2 size={10} />
                                        {field.collection}
                                    </span>
                                )}
                            </label>
                            <FieldInput
                                field={field}
                                value={form[field.name]}
                                onChange={setField}
                                relatedItems={relatedItems}
                                uploadTarget={uploadTarget}
                                collectionSlug={collectionSlug}
                            />
                            {errors[field.name] && (
                                <p className="mt-1 text-xs font-medium text-red-600">{errors[field.name]}</p>
                            )}
                        </div>
                    ))}
                    {fields.length === 0 && (
                        <p className="text-sm text-[#9ca3af]">Esta colección no tiene campos definidos.</p>
                    )}
                </div>

                <div className="flex justify-end gap-2 border-t border-[#f3f4f6] px-6 py-4">
                    <Button variant="outline" size="sm" onClick={onClose}>Cancelar</Button>
                    <Button size="sm" onClick={handleSave}>Guardar</Button>
                </div>
            </div>
        </div>
    )
}

export default ItemModal
