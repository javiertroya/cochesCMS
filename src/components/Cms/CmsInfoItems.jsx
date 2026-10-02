import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Database, SearchX, X } from 'lucide-react'
import { Spinner } from '@/components/UI/coss/spinner'

import FilterBadge from '@/components/UI/FilterBadge'
import { getPublicCollectionBySlug } from '@/services/collection_service'
import { getTitle, getImageUrl } from '@/utils/collection'

// ── Helpers ───────────────────────────────────────────────────────────────────

const normalizeSchema = (raw) => {
    if (Array.isArray(raw)) return raw
    if (!raw) return []
    try { return JSON.parse(raw) } catch { return [] }
}

const toId = (value) => {
    if (value == null || value === '') return ''
    return String(value)
}

const matchRelationValue = (stored, filterValue) => {
    if (Array.isArray(stored)) return stored.some(v => String(v ?? '') === filterValue)
    return String(stored ?? '') === filterValue
}

const itemMatchesFilter = (item, field, filterValue) => {
    if (!filterValue) return true
    return matchRelationValue(item[field.name], filterValue)
}

const itemMatchesSecondLevelFilter = (item, secondLevelField, filterValue, relationData) => {
    if (!filterValue) return true

    const { parentFieldName, fieldName } = secondLevelField
    const parentData = relationData[parentFieldName]
    if (!parentData) return false

    const parentValue = item[parentFieldName]
    const parentLabels = Array.isArray(parentValue)
        ? parentValue.map(v => String(v ?? ''))
        : [String(parentValue ?? '')]

    return parentLabels.some(label => {
        const parentItem = parentData.byLabel[label]
        if (!parentItem) return false
        return matchRelationValue(parentItem[fieldName], filterValue)
    })
}

const itemMatchesBooleanFilter = (item, field, filterValue) => {
    if (!filterValue) return true
    const value = item[field.name] !== false
    if (filterValue === 'active') return value
    if (filterValue === 'inactive') return !value
    return true
}

// ── Filtros ───────────────────────────────────────────────────────────────────

const CollectionFilters = ({ relationFields, relationData, secondLevelFields, secondLevelRelationData, booleanFields, filters, onChange }) => {
    if (relationFields.length === 0 && secondLevelFields.length === 0 && booleanFields.length === 0) return null

    return (
        <div className="space-y-4">
            {booleanFields.map(field => (
                <div key={field.name} className="space-y-2">
                    <p className="text-sm font-medium text-slate-700">{field.label ?? field.name}</p>
                    <div className="flex flex-wrap gap-2">
                        <FilterBadge active={!filters[field.name]} onClick={() => onChange(field.name, '')}>
                            Todos
                        </FilterBadge>
                        <FilterBadge active={filters[field.name] === 'active'} onClick={() => onChange(field.name, 'active')}>
                            Activos
                        </FilterBadge>
                        <FilterBadge active={filters[field.name] === 'inactive'} onClick={() => onChange(field.name, 'inactive')}>
                            No activos
                        </FilterBadge>
                    </div>
                </div>
            ))}

            {relationFields.map(field => {
                const related = relationData[field.name]
                const options = related?.items ?? []
                const relatedSchema = related?.schema ?? []

                if (options.length === 0) return null

                return (
                    <div key={field.name} className="space-y-2">
                        <p className="text-sm font-medium text-slate-700">{field.label ?? field.name}</p>
                        <div className="flex flex-wrap gap-2">
                            <FilterBadge
                                active={!filters[field.name]}
                                onClick={() => onChange(field.name, '')}
                            >
                                Todos
                            </FilterBadge>
                            {options.map(option => {
                                const label = getTitle(option, relatedSchema)
                                return (
                                    <FilterBadge
                                        key={option.id}
                                        active={filters[field.name] === label}
                                        onClick={() => onChange(field.name, label)}
                                    >
                                        {label}
                                    </FilterBadge>
                                )
                            })}
                        </div>
                    </div>
                )
            })}

            {secondLevelFields.map(field => {
                const filterKey = `${field.parentFieldName}__${field.fieldName}`
                const related = secondLevelRelationData[field.collection]
                const options = related?.items ?? []
                const relatedSchema = related?.schema ?? []

                if (options.length === 0) return null

                return (
                    <div key={filterKey} className="space-y-2">
                        <p className="text-sm font-medium text-slate-700">{field.label}</p>
                        <div className="flex flex-wrap gap-2">
                            <FilterBadge
                                active={!filters[filterKey]}
                                onClick={() => onChange(filterKey, '')}
                            >
                                Todos
                            </FilterBadge>
                            {options.map(option => {
                                const label = getTitle(option, relatedSchema)
                                return (
                                    <FilterBadge
                                        key={option.id}
                                        active={filters[filterKey] === label}
                                        onClick={() => onChange(filterKey, label)}
                                    >
                                        {label}
                                    </FilterBadge>
                                )
                            })}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

// ── Tarjeta ───────────────────────────────────────────────────────────────────

const InfoCard = ({ item, schema, displayFields, onClick }) => {
    const title = getTitle(item, schema)
    const imageUrl = getImageUrl(item, schema)

    const tags = (displayFields ?? [])
        .map(name => {
            const field = schema.find(f => f.name === name)
            const val = item[name]
            if (val == null || val === '') return null
            const label = field?.label ?? name
            const display = Array.isArray(val) ? val.join(', ') : String(val)
            return { label, display }
        })
        .filter(Boolean)

    return (
        <button
            type="button"
            onClick={onClick}
            className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white text-left shadow-sm transition hover:border-brand-primary hover:shadow-md"
        >
            <div className="flex aspect-square items-center justify-center overflow-hidden bg-gray-50">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={title}
                        className="size-full object-cover transition group-hover:scale-105"
                    />
                ) : (
                    <Database className="size-12 text-gray-300" />
                )}
            </div>

            <div className="flex flex-1 flex-col gap-2 p-4">
                <p className="font-semibold text-gray-900 leading-snug line-clamp-2">{title}</p>

                {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                        {tags.map(({ label, display }) => (
                            <span
                                key={label}
                                className="inline-flex items-center rounded-full bg-brand-light px-2.5 py-0.5 text-xs font-medium text-brand-primary"
                            >
                                {display}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </button>
    )
}

// ── Drawer de detalle para elementos de coleccion ─────────────────────────────

const FieldValue = ({ field, value }) => {
    if (value == null || value === '') return <span className="text-gray-400">—</span>

    if (field.type === 'image') {
        return (
            <img
                src={value}
                alt={field.label ?? field.name}
                className="max-h-64 w-auto rounded-lg object-contain"
            />
        )
    }
    if (field.type === 'boolean') {
        return <span>{value ? 'Sí' : 'No'}</span>
    }
    if (Array.isArray(value)) {
        return (
            <div className="flex flex-wrap gap-1.5">
                {value.map((v, i) => (
                    <span key={i} className="rounded-full bg-brand-light px-2.5 py-0.5 text-xs font-medium text-brand-primary">
                        {String(v)}
                    </span>
                ))}
            </div>
        )
    }
    if (field.type === 'textarea') {
        return <p className="whitespace-pre-wrap text-sm text-gray-700">{String(value)}</p>
    }
    return <span className="text-sm text-gray-700">{String(value)}</span>
}

const InfoDrawer = ({ item, schema, onClose, children }) => {
    const title = getTitle(item, schema)
    const imageUrl = getImageUrl(item, schema)

    const detailFields = schema.filter(f => {
        const val = item[f.name]
        return val != null && val !== ''
    })

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={onClose}
            />

            <div className="relative flex h-full w-full max-w-lg flex-col bg-white shadow-2xl overflow-y-auto">
                <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                    <h2 className="text-lg font-bold text-gray-900 leading-tight pr-8">{title}</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex size-8 shrink-0 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="flex flex-col gap-6 px-6 py-5">
                    {imageUrl && (
                        <div className="overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                            <img
                                src={imageUrl}
                                alt={title}
                                className="max-h-72 w-full object-contain p-4"
                            />
                        </div>
                    )}

                    {detailFields.map(field => (
                        <div key={field.name}>
                            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-gray-400">
                                {field.label ?? field.name}
                            </p>
                            <FieldValue field={field} value={item[field.name]} />
                        </div>
                    ))}

                    {children}
                </div>
            </div>
        </div>
    )
}

// ── Componente principal ──────────────────────────────────────────────────────

const CmsInfoItems = ({ collection, displayFields, showFilters, enabledFilters }) => {
    const navigate = useNavigate()
    const location = useLocation()
    const [collectionData, setCollectionData] = useState(null)
    const [relationData, setRelationData] = useState({})
    const [secondLevelRelationData, setSecondLevelRelationData] = useState({})
    const [filters, setFilters] = useState({})
    const [loading, setLoading] = useState(false)

    const schema = useMemo(
        () => normalizeSchema(collectionData?.collection?.fields_schema),
        [collectionData],
    )

    const relationFields = useMemo(
        () => schema.filter(f => (f.type === 'relation' || f.type === 'relation-multi') && f.collection),
        [schema],
    )

    const secondLevelFields = useMemo(() => {
        const result = []
        for (const field of relationFields) {
            const related = relationData[field.name]
            if (!related) continue
            for (const subField of related.schema) {
                if ((subField.type === 'relation' || subField.type === 'relation-multi') && subField.collection) {
                    result.push({
                        fieldName: subField.name,
                        collection: subField.collection,
                        label: subField.label ?? subField.name,
                        type: subField.type,
                        parentFieldName: field.name,
                        parentType: field.type,
                    })
                }
            }
        }
        return result
    }, [relationFields, relationData])

    const booleanFields = useMemo(
        () => schema.filter(field => field.type === 'boolean'),
        [schema],
    )

    const activeRelationFields = useMemo(() => {
        if (!enabledFilters) return relationFields
        return relationFields.filter(f => enabledFilters.includes(f.name))
    }, [relationFields, enabledFilters])

    const activeSecondLevelFields = useMemo(() => {
        if (!enabledFilters) return secondLevelFields
        return secondLevelFields.filter(f => enabledFilters.includes(`${f.parentFieldName}__${f.fieldName}`))
    }, [secondLevelFields, enabledFilters])

    const activeBooleanFields = useMemo(() => {
        if (!enabledFilters) return booleanFields
        return booleanFields.filter(field => enabledFilters.includes(field.name))
    }, [booleanFields, enabledFilters])

    useEffect(() => {
        if (!collection) return
        let isMounted = true
        setLoading(true)
        setFilters({})
        getPublicCollectionBySlug(collection)
            .then(data => { if (isMounted) setCollectionData(data) })
            .catch(() => { if (isMounted) setCollectionData(null) })
            .finally(() => { if (isMounted) setLoading(false) })
        return () => { isMounted = false }
    }, [collection])

    useEffect(() => {
        if (relationFields.length === 0) { setRelationData({}); return }
        let isMounted = true
        Promise.all(
            relationFields.map(async field => {
                try {
                    const data = await getPublicCollectionBySlug(field.collection)
                    const relatedSchema = normalizeSchema(data?.collection?.fields_schema)
                    const items = data?.items ?? []
                    const byId = Object.fromEntries(items.map(item => [toId(item.id), item]))
                    const byLabel = Object.fromEntries(items.map(item => [getTitle(item, relatedSchema), item]))
                    return [field.name, { items, schema: relatedSchema, byId, byLabel }]
                } catch {
                    return [field.name, { items: [], schema: [], byId: {}, byLabel: {} }]
                }
            }),
        ).then(entries => { if (isMounted) setRelationData(Object.fromEntries(entries)) })
        return () => { isMounted = false }
    }, [relationFields])

    useEffect(() => {
        const uniqueCollections = [...new Set(secondLevelFields.map(f => f.collection))]
        if (uniqueCollections.length === 0) { setSecondLevelRelationData({}); return }
        let isMounted = true
        Promise.all(
            uniqueCollections.map(async collectionSlug => {
                try {
                    const data = await getPublicCollectionBySlug(collectionSlug)
                    const relatedSchema = normalizeSchema(data?.collection?.fields_schema)
                    const items = data?.items ?? []
                    const byId = Object.fromEntries(items.map(item => [toId(item.id), item]))
                    const byLabel = Object.fromEntries(items.map(item => [getTitle(item, relatedSchema), item]))
                    return [collectionSlug, { items, schema: relatedSchema, byId, byLabel }]
                } catch {
                    return [collectionSlug, { items: [], schema: [], byId: {}, byLabel: {} }]
                }
            }),
        ).then(entries => { if (isMounted) setSecondLevelRelationData(Object.fromEntries(entries)) })
        return () => { isMounted = false }
    }, [secondLevelFields])

    const visibleItems = useMemo(() => {
        const hasActiveFilter = activeBooleanFields.some(field => field.name === 'activo')
        const items = (collectionData?.items ?? []).filter(item => hasActiveFilter || item.activo !== false)
        return items
            .filter(item => activeBooleanFields.every(field => itemMatchesBooleanFilter(item, field, filters[field.name])))
            .filter(item => activeRelationFields.every(field => itemMatchesFilter(item, field, filters[field.name])))
            .filter(item => activeSecondLevelFields.every(field => {
                const filterKey = `${field.parentFieldName}__${field.fieldName}`
                return itemMatchesSecondLevelFilter(item, field, filters[filterKey], relationData)
            }))
    }, [collectionData, filters, activeRelationFields, activeSecondLevelFields, activeBooleanFields, relationData])

    if (!collection) {
        return <p className="py-8 text-slate-600">Selecciona una colección para mostrar sus elementos.</p>
    }

    if (loading) {
        return (
            <section className="py-8">
                <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                    <Spinner className="h-7 w-7 text-gray-300" />
                    <p className="text-sm text-gray-400">Cargando elementos…</p>
                </div>
            </section>
        )
    }

    const hasActiveFilter = activeBooleanFields.some(field => field.name === 'activo')
    const allPublished = (collectionData?.items ?? []).filter(item => hasActiveFilter || item.activo !== false)

    if (allPublished.length === 0) {
        return (
            <section className="py-8">
                <div className="flex flex-col items-center gap-3 rounded-xl bg-gray-50 py-14 text-center">
                    <Database className="size-8 text-gray-300" />
                    <div>
                        <p className="text-sm font-semibold text-gray-700">Sin elementos</p>
                        <p className="mt-0.5 text-xs text-gray-400">No hay elementos publicados en esta colección.</p>
                    </div>
                </div>
            </section>
        )
    }

    return (
        <section className="space-y-6 py-8">
            {showFilters && (
                <CollectionFilters
                    relationFields={activeRelationFields}
                    relationData={relationData}
                    secondLevelFields={activeSecondLevelFields}
                    secondLevelRelationData={secondLevelRelationData}
                    booleanFields={activeBooleanFields}
                    filters={filters}
                    onChange={(name, value) => setFilters(prev => ({ ...prev, [name]: value }))}
                />
            )}
            {visibleItems.length === 0 ? (
                <div className="flex flex-col items-center gap-3 rounded-xl bg-gray-50 py-14 text-center">
                    <SearchX className="size-8 text-gray-300" />
                    <div>
                        <p className="text-sm font-semibold text-gray-700">Sin resultados</p>
                        <p className="mt-0.5 text-xs text-gray-400">No hay elementos que coincidan con los filtros seleccionados.</p>
                    </div>
                </div>
            ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {visibleItems.map(item => (
                        <InfoCard
                            key={item.id ?? item.local_id}
                            item={item}
                            schema={schema}
                            displayFields={displayFields}
                            onClick={() => navigate(
                                `/coleccion/${collection}/${item.id ?? item.local_id}`,
                                { state: { fromPath: location.pathname } },
                            )}
                        />
                    ))}
                </div>
            )}
        </section>
    )
}

export { InfoDrawer }
export default CmsInfoItems
