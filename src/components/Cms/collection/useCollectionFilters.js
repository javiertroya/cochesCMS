import { useState } from 'react'

import { isPublished, PRICE_FIELDS, sortFeaturedFirst, STATUS_FIELDS } from '@/utils/collection'

const isRelationField = (field) => ['relation', 'relation-multi'].includes(field.type) && field.collection

// Activo/destacado no se filtran: los inactivos nunca se muestran y los destacados van primero
const isOptionField = (field) =>
    isRelationField(field) || (field.type === 'boolean' && !STATUS_FIELDS.includes(field.name))

const isPriceField = (field) => field.type === 'number' && PRICE_FIELDS.includes(field.name)

// Campos de un esquema que se pueden ofrecer como filtro (lo usa también el panel)
export const getFilterableFields = (schema) =>
    schema.filter(field => isOptionField(field) || isPriceField(field))
        .map(field => ({ ...field, isPriceRange: isPriceField(field) }))

// Valores de un elemento para un filtro de opciones (las relaciones guardan el nombre)
const optionValues = (item, field) => {
    if (field.type === 'boolean') return [item[field.name] === true ? 'Sí' : 'No']
    return [item[field.name]].flat().filter(Boolean).map(String)
}

// Opciones con su número de elementos, ordenadas alfabéticamente
const countOptions = (items, field) => {
    const counts = new Map()
    items.forEach(item => optionValues(item, field).forEach(value => {
        counts.set(value, (counts.get(value) ?? 0) + 1)
    }))
    return [...counts.entries()]
        .map(([value, count]) => ({ value, count }))
        .sort((a, b) => a.value.localeCompare(b.value, 'es'))
}

const maxPrice = (items, field) =>
    Math.max(0, ...items.map(item => Number(item[field.name])).filter(Number.isFinite))

const matchesFilter = (item, field, value) => {
    if (!value) return true
    if (field.isPriceRange) {
        const price = Number(item[field.name])
        return Number.isFinite(price) && price >= value[0] && price <= value[1]
    }
    return optionValues(item, field).includes(value)
}

/**
 * Filtros públicos de una colección (componente "Colección con enlaces").
 * enabledFilters: nombres de campo elegidos en el panel; sin valor = todos los posibles.
 */
const useCollectionFilters = ({ items, schema, enabledFilters }) => {
    const [filters, setFilters] = useState({})

    const isEnabled = (field) => !enabledFilters || enabledFilters.includes(field.name)
    const filterFields = getFilterableFields(schema).filter(isEnabled)

    const published = sortFeaturedFirst(items.filter(isPublished))
    const visible = published.filter(item => filterFields.every(field => matchesFilter(item, field, filters[field.name])))

    const optionFilters = filterFields
        .filter(field => !field.isPriceRange)
        .map(field => ({ field, options: countOptions(published, field), total: published.length }))
        .filter(({ options }) => options.length > 0)

    const priceFilters = filterFields
        .filter(field => field.isPriceRange)
        .map(field => ({ field, max: maxPrice(published, field) }))
        .filter(({ max }) => max > 0)

    return {
        published,
        visible,
        optionFilters,
        priceFilters,
        filters,
        setFilter: (name, value) => setFilters(prev => ({ ...prev, [name]: value })),
        clearFilters: () => setFilters({}),
        hasFiltersApplied: Object.values(filters).some(Boolean),
    }
}

export default useCollectionFilters
