import { useEffect, useMemo, useState } from 'react'
import { Database, ExternalLink } from 'lucide-react'
import { Spinner } from '@/components/UI/coss/spinner'

import FilterBadge from '@/components/UI/FilterBadge'
import useCollection from '@/hooks/useCollection'
import { getTitle, getImageUrl } from '@/utils/collection'
import { getPublicCollectionBySlug } from '@/services/collection_service'

const normalizeSchema = (schema) => {
    if (Array.isArray(schema)) return schema
    if (!schema) return []

    try {
        const parsed = JSON.parse(schema)
        return Array.isArray(parsed) ? parsed : []
    } catch {
        return []
    }
}

const toId = (value) => {
    if (value == null || value === '') return ''
    return String(value)
}

const matchRelationValue = (stored, filterValue) => {
    if (Array.isArray(stored)) return stored.some(value => String(value ?? '') === filterValue)
    return String(stored ?? '') === filterValue
}

const itemMatchesFilter = (item, field, filterValue) => {
    if (!filterValue) return true
    return matchRelationValue(item[field.name], filterValue)
}

const itemMatchesSecondLevelFilter = (item, field, filterValue, relationData) => {
    if (!filterValue) return true

    const parentData = relationData[field.parentFieldName]
    if (!parentData) return false

    const parentValue = item[field.parentFieldName]
    const parentLabels = Array.isArray(parentValue)
        ? parentValue.map(value => String(value ?? ''))
        : [String(parentValue ?? '')]

    return parentLabels.some(label => {
        const parentItem = parentData.byLabel[label] ?? parentData.byId[toId(label)]
        if (!parentItem) return false
        return matchRelationValue(parentItem[field.fieldName], filterValue)
    })
}

const itemMatchesBooleanFilter = (item, field, filterValue) => {
    if (!filterValue) return true
    const value = item[field.name] !== false
    if (filterValue === 'active') return value
    if (filterValue === 'inactive') return !value
    return true
}

const CollectionFilters = ({
    relationFields,
    relationData,
    secondLevelFields,
    secondLevelRelationData,
    booleanFields,
    filters,
    onChange,
}) => {
    if (relationFields.length === 0 && secondLevelFields.length === 0 && booleanFields.length === 0) return null

    return (
        <div className="mb-6 space-y-4">
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
                            <FilterBadge active={!filters[field.name]} onClick={() => onChange(field.name, '')}>
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
                            <FilterBadge active={!filters[filterKey]} onClick={() => onChange(filterKey, '')}>
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

const CollectionLinkCard = ({ item, schema, displayFields }) => {
    const title = getTitle(item, schema)
    const imageUrl = getImageUrl(item, schema)
    const href = item.url ?? item.URL ?? null

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

    const inner = (
        <div className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:border-brand-primary hover:shadow-md">
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

                {href && (
                    <span className="mt-auto flex items-center gap-1 text-xs font-medium text-brand-primary opacity-0 transition group-hover:opacity-100">
                        Abrir <ExternalLink size={11} />
                    </span>
                )}
            </div>
        </div>
    )

    if (!href) return <div>{inner}</div>

    return (
        <a href={href} target="_blank" rel="noopener noreferrer" className="block">
            {inner}
        </a>
    )
}

const CmsCollectionLinks = ({ collection, displayFields, showFilters, enabledFilters }) => {
    const { items, schema, loading, load } = useCollection(collection)
    const [relationData, setRelationData] = useState({})
    const [secondLevelRelationData, setSecondLevelRelationData] = useState({})
    const [filters, setFilters] = useState({})

    useEffect(() => { load() }, [load])

    const normalizedSchema = useMemo(() => normalizeSchema(schema), [schema])

    const relationFields = useMemo(
        () => normalizedSchema.filter(field => (
            (field.type === 'relation' || field.type === 'relation-multi') && field.collection
        )),
        [normalizedSchema],
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
                        parentFieldName: field.name,
                    })
                }
            }
        }
        return result
    }, [relationFields, relationData])

    const booleanFields = useMemo(
        () => normalizedSchema.filter(field => field.type === 'boolean'),
        [normalizedSchema],
    )

    const activeRelationFields = useMemo(() => {
        if (!enabledFilters) return relationFields
        return relationFields.filter(field => enabledFilters.includes(field.name))
    }, [relationFields, enabledFilters])

    const activeSecondLevelFields = useMemo(() => {
        if (!enabledFilters) return secondLevelFields
        return secondLevelFields.filter(field => enabledFilters.includes(`${field.parentFieldName}__${field.fieldName}`))
    }, [secondLevelFields, enabledFilters])

    const activeBooleanFields = useMemo(() => {
        if (!enabledFilters) return booleanFields
        return booleanFields.filter(field => enabledFilters.includes(field.name))
    }, [booleanFields, enabledFilters])

    useEffect(() => {
        let isMounted = true

        const loadRelations = async () => {
            if (relationFields.length === 0) {
                setRelationData({})
                return
            }

            const entries = await Promise.all(
                relationFields.map(async field => {
                    try {
                        const data = await getPublicCollectionBySlug(field.collection)
                        const relatedSchema = normalizeSchema(data?.collection?.fields_schema)
                        const relatedItems = data?.items ?? []
                        const byId = Object.fromEntries(relatedItems.map(item => [toId(item.id), item]))
                        const byLabel = Object.fromEntries(relatedItems.map(item => [getTitle(item, relatedSchema), item]))

                        return [field.name, { items: relatedItems, schema: relatedSchema, byId, byLabel }]
                    } catch {
                        return [field.name, { items: [], schema: [], byId: {}, byLabel: {} }]
                    }
                }),
            )

            if (isMounted) setRelationData(Object.fromEntries(entries))
        }

        loadRelations()

        return () => { isMounted = false }
    }, [relationFields])

    useEffect(() => {
        let isMounted = true

        const loadSecondLevel = async () => {
            const uniqueCollections = [...new Set(secondLevelFields.map(field => field.collection))]

            if (uniqueCollections.length === 0) {
                setSecondLevelRelationData({})
                return
            }

            const entries = await Promise.all(
                uniqueCollections.map(async slug => {
                    try {
                        const data = await getPublicCollectionBySlug(slug)
                        const relatedSchema = normalizeSchema(data?.collection?.fields_schema)
                        const relatedItems = data?.items ?? []
                        const byId = Object.fromEntries(relatedItems.map(item => [toId(item.id), item]))
                        const byLabel = Object.fromEntries(relatedItems.map(item => [getTitle(item, relatedSchema), item]))

                        return [slug, { items: relatedItems, schema: relatedSchema, byId, byLabel }]
                    } catch {
                        return [slug, { items: [], schema: [], byId: {}, byLabel: {} }]
                    }
                }),
            )

            if (isMounted) setSecondLevelRelationData(Object.fromEntries(entries))
        }

        loadSecondLevel()

        return () => { isMounted = false }
    }, [secondLevelFields])

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
    const visible = items
        .filter(item => hasActiveFilter || item.activo !== false)
        .filter(item => activeBooleanFields.every(field => itemMatchesBooleanFilter(item, field, filters[field.name])))
        .filter(item => activeRelationFields.every(field => itemMatchesFilter(item, field, filters[field.name])))
        .filter(item => activeSecondLevelFields.every(field => {
            const filterKey = `${field.parentFieldName}__${field.fieldName}`
            return itemMatchesSecondLevelFilter(item, field, filters[filterKey], relationData)
        }))

    if (visible.length === 0) {
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
        <section className="py-8">
            {showFilters && (
                <CollectionFilters
                    relationFields={activeRelationFields}
                    relationData={relationData}
                    secondLevelFields={activeSecondLevelFields}
                    secondLevelRelationData={secondLevelRelationData}
                    booleanFields={activeBooleanFields}
                    filters={filters}
                    onChange={(fieldName, value) => setFilters(prev => ({ ...prev, [fieldName]: value }))}
                />
            )}

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {visible.map(item => (
                    <CollectionLinkCard
                        key={item.id ?? item.local_id}
                        item={item}
                        schema={normalizedSchema}
                        displayFields={displayFields}
                    />
                ))}
            </div>
        </section>
    )
}

export default CmsCollectionLinks
