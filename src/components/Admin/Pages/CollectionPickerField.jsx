import { useEffect, useMemo, useState } from 'react'

import { Spinner } from '@/components/UI/coss/spinner'
import { getCollections } from '@/services/collection_service'
import { getFilterableFields } from '@/components/Cms/collection/useCollectionFilters'
import { getDisplayFieldOptions, parseSchema } from '@/utils/collection'

// Filtros que se ofrecen por colección (el resto de colecciones: todos los disponibles)
const PREFERRED_FILTER_KEYS = {
    coches: ['marca', 'precio'],
}

const CollectionPickerField = ({ collection, showFilters, enabledFilters, displayFields, onChange }) => {
    const [collections, setCollections] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)

    useEffect(() => {
        getCollections()
            .then(setCollections)
            .catch(() => setError(true))
            .finally(() => setLoading(false))
    }, [])

    const selectedCollection = collections.find(c => c.slug === collection)

    const filterOptions = useMemo(() => {
        if (!selectedCollection) return []
        const preferredKeys = PREFERRED_FILTER_KEYS[selectedCollection.slug]
        return getFilterableFields(parseSchema(selectedCollection.fields_schema))
            .filter(field => !preferredKeys || preferredKeys.includes(field.name))
            .map(field => ({
                key: field.name,
                label: field.isPriceRange ? `${field.label ?? field.name} (barra de rangos)` : field.label ?? field.name,
            }))
    }, [selectedCollection])

    const displayFieldOptions = useMemo(() => {
        if (!selectedCollection) return []
        return getDisplayFieldOptions(parseSchema(selectedCollection.fields_schema))
    }, [selectedCollection])

    const handleCollectionChange = (slug) => {
        onChange({ collection: slug, showFilters: false, enabledFilters: [], displayFields: [] })
    }

    const handleShowFiltersToggle = () => {
        if (showFilters) {
            onChange({ collection, showFilters: false, enabledFilters: [] })
        } else {
            onChange({ collection, showFilters: true, enabledFilters: filterOptions.map(o => o.key) })
        }
    }

    const handleFilterToggle = (key) => {
        const current = enabledFilters ?? filterOptions.map(o => o.key)
        const next = current.includes(key)
            ? current.filter(k => k !== key)
            : [...current, key]
        onChange({ collection, showFilters, enabledFilters: next, displayFields })
    }

    const handleDisplayFieldToggle = (fieldName) => {
        const current = displayFields ?? []
        const next = current.includes(fieldName)
            ? current.filter(n => n !== fieldName)
            : [...current, fieldName]
        onChange({ collection, showFilters, enabledFilters, displayFields: next })
    }

    if (loading) {
        return (
            <div className="flex items-center gap-2 py-1">
                <Spinner className="h-4 w-4 text-gray-400" />
                <p className="text-sm text-gray-400">Cargando colecciones…</p>
            </div>
        )
    }

    if (error) {
        return (
            <p className="text-sm text-red-400">No se han podido cargar las colecciones.</p>
        )
    }

    if (collections.length === 0) {
        return <p className="text-sm text-gray-400">No hay colecciones disponibles.</p>
    }

    const activeFilters = enabledFilters ?? filterOptions.map(o => o.key)
    const activeDisplayFields = displayFields ?? []

    return (
        <div className="space-y-3">
            <select
                value={collection ?? ''}
                onChange={(e) => handleCollectionChange(e.target.value)}
                className="h-9 w-full rounded-lg border border-gray-200 bg-white pl-3 pr-9 text-sm text-gray-900 shadow-sm transition focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
            >
                <option value="">— Seleccionar colección —</option>
                {collections.map(c => (
                    <option key={c.id} value={c.slug}>{c.name}</option>
                ))}
            </select>

            {displayFieldOptions.length > 0 && (
                <div className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2.5 space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Campos de la tarjeta</p>
                    <p className="text-xs text-gray-400">El nombre siempre se muestra. Selecciona campos adicionales.</p>
                    {displayFieldOptions.map(field => (
                        <label key={field.name} className="flex cursor-pointer items-center gap-2.5">
                            <input
                                type="checkbox"
                                checked={activeDisplayFields.includes(field.name)}
                                onChange={() => handleDisplayFieldToggle(field.name)}
                                className="size-4 rounded border-gray-300 accent-brand-primary"
                            />
                            <span className="text-sm text-gray-700">{field.label ?? field.name}</span>
                        </label>
                    ))}
                </div>
            )}

            {filterOptions.length > 0 && (
                <>
                    <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2.5">
                        <div>
                            <p className="text-sm font-medium text-gray-700">Mostrar filtros</p>
                            <p className="text-xs text-gray-400">Permite al usuario filtrar los elementos.</p>
                        </div>
                        <button
                            type="button"
                            role="switch"
                            aria-checked={Boolean(showFilters)}
                            onClick={handleShowFiltersToggle}
                            className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/50 ${
                                showFilters ? 'bg-brand-primary' : 'bg-gray-200'
                            }`}
                        >
                            <span
                                className={`pointer-events-none inline-block size-4 rounded-full bg-white shadow-sm transition-transform ${
                                    showFilters ? 'translate-x-4.5' : 'translate-x-0.5'
                                }`}
                            />
                        </button>
                    </label>

                    {showFilters && (
                        <div className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2.5 space-y-2">
                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Filtros activos</p>
                            {filterOptions.map(option => (
                                <label key={option.key} className="flex cursor-pointer items-center gap-2.5">
                                    <input
                                        type="checkbox"
                                        checked={activeFilters.includes(option.key)}
                                        onChange={() => handleFilterToggle(option.key)}
                                        className="size-4 rounded border-gray-300 accent-brand-primary"
                                    />
                                    <span className="text-sm text-gray-700">{option.label}</span>
                                </label>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    )
}

export default CollectionPickerField
