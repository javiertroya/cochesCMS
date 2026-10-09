import { useEffect, useState } from 'react'
import { Database, Link2, Plus, Trash2, X } from 'lucide-react'

import { Button } from '@/components/UI/coss/button'
import { getCollections } from '@/services/collection_service'

const FIELD_TYPES = [
    { value: 'text',           label: 'Texto' },
    { value: 'textarea',       label: 'Texto largo' },
    { value: 'number',         label: 'Número' },
    { value: 'boolean',        label: 'Sí / No' },
    { value: 'date',           label: 'Fecha' },
    { value: 'time',           label: 'Hora' },
    { value: 'image',          label: 'Imagen' },
    { value: 'relation',       label: 'Relación (uno)' },
    { value: 'relation-multi', label: 'Relación (varios)' },
]

const isRelation = (type) => ['relation', 'relation-multi'].includes(type)

const toSlug = (str) =>
    str.trim().toLowerCase()
        .normalize('NFD').replace(/[̀-ͯ]/g, '')
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')

const DEFAULT_FIELDS = [
    { name: 'name', label: 'Nombre', type: 'text', required: true, collection: '', locked: true },
]

const EmptyField = () => ({
    name: '',
    label: '',
    type: 'text',
    required: false,
    multiple: false,
    collection: '',
    locked: false,
})

const NewCollectionModal = ({ onClose, onSave }) => {
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [fields, setFields] = useState(DEFAULT_FIELDS)
    const [error, setError] = useState('')
    const [existingCollections, setExistingCollections] = useState([])

    useEffect(() => {
        getCollections()
            .then(data => setExistingCollections(data))
            .catch(() => {})
    }, [])

    const addField = () => setFields(prev => [...prev, EmptyField()])

    const updateField = (idx, key, value) => {
        setFields(prev => prev.map((f, i) => {
            if (i !== idx) return f
            const updated = { ...f, [key]: value }
            if (key === 'label' && !f.locked && (f.name === '' || f.name === toSlug(f.label))) {
                updated.name = toSlug(value)
            }
            return updated
        }))
    }

    const removeField = (idx) => {
        setFields(prev => prev.filter((_, i) => i !== idx))
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        const trimmed = name.trim()
        if (!trimmed) { setError('El nombre es obligatorio.'); return }

        const slug = toSlug(trimmed)
        const fields_schema = fields
            .filter(f => f.name && f.label)
            .map(({ name, label, type, required, multiple, collection }) => ({
                name,
                label,
                type,
                ...(required ? { required: true } : {}),
                ...(type === 'image' && multiple ? { multiple: true } : {}),
                ...(isRelation(type) && collection ? { collection, storeAs: 'name' } : {}),
            }))

        onSave({ name: trimmed, slug, description: description.trim(), fields_schema })
        onClose()
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4">
            <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/20 flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="flex size-9 items-center justify-center rounded-lg bg-blue-50 text-brand-primary">
                            <Database size={18} />
                        </div>
                        <h2 className="text-lg font-bold text-slate-900">Nueva colección</h2>
                    </div>
                    <button type="button" onClick={onClose}
                        className="flex size-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700">
                        <X size={18} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden">
                    <div className="overflow-y-auto px-6 py-5 space-y-5">
                        {/* Nombre y descripción */}
                        <div className="space-y-4">
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-[#374151]">
                                    Nombre <span className="text-red-500">*</span>
                                </label>
                                <input type="text" value={name}
                                    onChange={e => { setName(e.target.value); setError('') }}
                                    placeholder="Ej: Proyectos, Talleres, Patrocinadores…"
                                    className="h-10 w-full rounded-lg border border-[#d1d5db] bg-white px-3 text-sm focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary/30"
                                    autoFocus
                                />
                                {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-[#374151]">Descripción</label>
                                <textarea value={description} onChange={e => setDescription(e.target.value)}
                                    placeholder="Para qué se usa esta colección…" rows={2}
                                    className="w-full resize-none rounded-lg border border-[#d1d5db] bg-white px-3 py-2 text-sm focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary/30"
                                />
                            </div>
                        </div>

                        {/* Campos */}
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-semibold text-[#111827]">Campos</h3>
                                <button type="button" onClick={addField}
                                    className="flex items-center gap-1.5 text-xs font-medium text-brand-primary hover:underline">
                                    <Plus size={13} />
                                    Añadir campo
                                </button>
                            </div>

                            <div className="space-y-3">
                                {fields.map((field, idx) => (
                                    <div key={idx} className={`rounded-xl border p-3 space-y-2 ${
                                        field.locked
                                            ? 'border-brand-primary/20 bg-blue-50/40'
                                            : 'border-[#e5e7eb] bg-[#f9fafb]'
                                    }`}>
                                        <div className="flex items-center gap-2">
                                            {/* Label */}
                                            <div className="flex-1">
                                                <input type="text" value={field.label}
                                                    onChange={e => updateField(idx, 'label', e.target.value)}
                                                    placeholder="Etiqueta del campo"
                                                    disabled={field.locked}
                                                    className={`h-8 w-full rounded-lg border px-2.5 text-sm focus:border-brand-primary focus:outline-none ${
                                                        field.locked
                                                            ? 'border-brand-primary/20 bg-white text-brand-primary font-medium cursor-default'
                                                            : 'border-[#d1d5db] bg-white'
                                                    }`}
                                                />
                                            </div>

                                            {/* Tipo */}
                                            <select value={field.type}
                                                onChange={e => updateField(idx, 'type', e.target.value)}
                                                disabled={field.locked}
                                                className={`h-8 rounded-lg border pl-2 pr-7 text-sm focus:border-brand-primary focus:outline-none ${
                                                    field.locked
                                                        ? 'border-brand-primary/20 bg-white text-brand-primary cursor-default'
                                                        : 'border-[#d1d5db] bg-white'
                                                }`}>
                                                {FIELD_TYPES.map(t => (
                                                    <option key={t.value} value={t.value}>{t.label}</option>
                                                ))}
                                            </select>

                                            {/* Eliminar — oculto en campos bloqueados */}
                                            {field.locked ? (
                                                <div className="size-8 shrink-0 flex items-center justify-center">
                                                    <span className="text-[10px] text-brand-primary/60 font-medium">base</span>
                                                </div>
                                            ) : (
                                                <button type="button" onClick={() => removeField(idx)}
                                                    className="flex size-8 shrink-0 items-center justify-center rounded-lg text-[#9ca3af] hover:bg-red-50 hover:text-red-500 transition">
                                                    <Trash2 size={13} />
                                                </button>
                                            )}
                                        </div>

                                        {/* Nombre técnico + requerido (solo campos no bloqueados) */}
                                        {!field.locked && (
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1">
                                                    <input type="text" value={field.name}
                                                        onChange={e => updateField(idx, 'name', e.target.value)}
                                                        placeholder="nombre_campo (auto)"
                                                        className="h-7 w-full rounded-md border border-[#e5e7eb] bg-white px-2 text-xs font-mono text-[#6b7280] focus:border-brand-primary focus:outline-none"
                                                    />
                                                </div>
                                                <label className="flex items-center gap-1 text-xs text-[#6b7280] shrink-0 cursor-pointer">
                                                    <input type="checkbox" checked={field.required}
                                                        onChange={e => updateField(idx, 'required', e.target.checked)}
                                                        className="size-3.5 rounded" />
                                                    Requerido
                                                </label>
                                                {field.type === 'image' && (
                                                    <label className="flex items-center gap-1 text-xs text-[#6b7280] shrink-0 cursor-pointer">
                                                        <input type="checkbox" checked={!!field.multiple}
                                                            onChange={e => updateField(idx, 'multiple', e.target.checked)}
                                                            className="size-3.5 rounded" />
                                                        Varias imágenes
                                                    </label>
                                                )}
                                            </div>
                                        )}

                                        {/* Colección relacionada — desplegable con colecciones existentes */}
                                        {isRelation(field.type) && (
                                            <div className="flex items-center gap-2">
                                                <Link2 size={13} className="text-brand-primary shrink-0" />
                                                {existingCollections.length > 0 ? (
                                                    <select
                                                        value={field.collection}
                                                        onChange={e => updateField(idx, 'collection', e.target.value)}
                                                        className="h-7 flex-1 rounded-md border border-brand-primary/30 bg-blue-50 pl-2 pr-7 text-xs font-medium text-brand-primary focus:border-brand-primary focus:outline-none"
                                                    >
                                                        <option value="">— Selecciona una colección —</option>
                                                        {existingCollections.map(col => (
                                                            <option key={col.id} value={col.slug}>
                                                                {col.name} ({col.slug})
                                                            </option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    <input type="text" value={field.collection}
                                                        onChange={e => updateField(idx, 'collection', e.target.value)}
                                                        placeholder="slug-de-la-coleccion"
                                                        className="h-7 flex-1 rounded-md border border-brand-primary/30 bg-blue-50 px-2 text-xs font-mono text-brand-primary focus:border-brand-primary focus:outline-none"
                                                    />
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-2 border-t border-slate-200 px-6 py-4 shrink-0">
                        <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
                        <Button type="submit">Crear colección</Button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default NewCollectionModal
