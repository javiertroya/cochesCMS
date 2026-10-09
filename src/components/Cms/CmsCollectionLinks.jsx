import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ArrowRight, ChevronDown, ChevronLeft, ChevronRight, Database, ExternalLink, SlidersHorizontal, X } from 'lucide-react'
import { Spinner } from '@/components/UI/coss/spinner'

import FilterBadge from '@/components/UI/FilterBadge'
import PriceRangeFilter from '@/components/UI/PriceRangeFilter'
import useCollection from '@/hooks/useCollection'
import { FeaturedBadge } from '@/components/UI/ImageGallery'
import { formatPrice, getImageUrls, getPriceField, getTitle, isFeatured, PRICE_FIELDS, sortFeaturedFirst, STATUS_FIELDS } from '@/utils/collection'
import { getPublicCollectionBySlug } from '@/services/collection_service'
import { resolveMediaUrl } from '@/utils/media'

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

const itemMatchesPriceFilter = (item, field, range) => {
    if (!range) return true
    const price = Number(item[field.name])
    return Number.isFinite(price) && price >= range[0] && price <= range[1]
}

const CollectionFilters = ({
    relationFields,
    relationData,
    secondLevelFields,
    secondLevelRelationData,
    booleanFields,
    priceFields,
    priceLimits,
    usedCounts,
    filters,
    onChange,
}) => {
    if (relationFields.length === 0 && secondLevelFields.length === 0 && booleanFields.length === 0 && priceFields.length === 0) return null

    return (
        <div className="space-y-5">
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
                const relatedSchema = related?.schema ?? []
                const counts = usedCounts[field.name] ?? new Map()
                // Solo las opciones que tiene algún elemento publicado (p. ej. marcas con coches)
                const labels = (related?.items ?? [])
                    .map(option => getTitle(option, relatedSchema))
                    .filter(label => counts.has(label))
                    .sort((a, b) => a.localeCompare(b, 'es'))

                if (labels.length === 0) return null

                const total = [...counts.values()].reduce((sum, count) => sum + count, 0)
                const rows = [{ value: '', label: 'Todas', count: total }, ...labels.map(label => ({ value: label, label, count: counts.get(label) }))]

                return (
                    <FilterSection key={field.name} title={field.label ?? field.name}>
                        <ul className="-mx-2 space-y-0.5">
                            {rows.map(row => {
                                const active = (filters[field.name] ?? '') === row.value
                                return (
                                    <li key={row.value || '__all'}>
                                        <button
                                            type="button"
                                            onClick={() => onChange(field.name, row.value)}
                                            aria-pressed={active}
                                            className={`site-filter-option flex w-full items-center gap-3 rounded-md px-2 py-1.5 text-left text-sm transition ${
                                                active ? 'font-semibold text-gray-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                            }`}
                                        >
                                            <span className={`site-filter-dot flex size-3.5 shrink-0 items-center justify-center rounded-full border transition ${
                                                active ? 'border-brand-primary' : 'border-gray-300'
                                            }`}>
                                                {active && <span className="size-1.5 rounded-full bg-brand-primary" />}
                                            </span>
                                            <span className="min-w-0 flex-1 truncate">{row.label}</span>
                                            <span className="text-xs tabular-nums text-gray-400">{row.count}</span>
                                        </button>
                                    </li>
                                )
                            })}
                        </ul>
                    </FilterSection>
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

            {priceFields.map(field => (
                <FilterSection key={field.name} title={field.label?.replace(/\s*\(€\)\s*$/, '') ?? field.name}>
                    <PriceRangeFilter
                        max={priceLimits[field.name] ?? 0}
                        value={filters[field.name] ?? null}
                        onChange={value => onChange(field.name, value)}
                    />
                </FilterSection>
            ))}
        </div>
    )
}

// Bloque del panel de filtros: título en versalitas y línea fina de separación
const FilterSection = ({ title, children }) => (
    <section className="border-t border-gray-100 pt-5 first:border-t-0 first:pt-0">
        <h3 className="mb-3 text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-gray-400">{title}</h3>
        {children}
    </section>
)

const formatValue = (field, value) => {
    if (Array.isArray(value)) return value.join(', ')
    if (field?.type === 'boolean') return value ? 'Sí' : 'No'
    if (field?.type === 'number') {
        const number = Number(value)
        if (Number.isFinite(number)) return new Intl.NumberFormat('es-ES').format(number)
    }
    return String(value)
}

// Variante mediana (960 px) que genera el backend al subir: carga mucho más rápido en el listado
const toCardSize = (url) => url.replace(/\.webp$/i, '-md.webp')

// Fotos de la tarjeta con flechas: solo se carga la visible; las flechas no abren el enlace de la tarjeta
const CardImageSlider = ({ images, alt }) => {
    const [index, setIndex] = useState(0)
    const [failed, setFailed] = useState({})
    const total = images.length
    const current = images[index % total]
    const src = resolveMediaUrl(failed[current] ? current : toCardSize(current))

    const go = (event, step) => {
        event.preventDefault()
        event.stopPropagation()
        setIndex(prev => (prev + step + total) % total)
    }

    const arrowClass = 'absolute top-1/2 z-10 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-900 shadow-md transition hover:bg-white lg:opacity-0 lg:group-hover:opacity-100'

    return (
        <>
            <img
                key={current}
                src={src}
                alt={alt}
                loading="lazy"
                onError={() => setFailed(prev => ({ ...prev, [current]: true }))}
                className="size-full object-cover transition duration-700 ease-out group-hover:scale-[1.04]"
            />
            {total > 1 && (
                <>
                    <button type="button" onClick={e => go(e, -1)} aria-label="Foto anterior" className={`${arrowClass} left-3`}>
                        <ChevronLeft size={18} />
                    </button>
                    <button type="button" onClick={e => go(e, 1)} aria-label="Foto siguiente" className={`${arrowClass} right-3`}>
                        <ChevronRight size={18} />
                    </button>
                    <div className="pointer-events-none absolute inset-x-0 bottom-3 z-10 flex justify-center gap-1.5">
                        {images.slice(0, 8).map((url, dot) => (
                            <span
                                key={url}
                                className={`size-1.5 rounded-full transition ${dot === index % total ? 'bg-white' : 'bg-white/50'}`}
                            />
                        ))}
                    </div>
                    <span className="absolute right-3 top-3 z-10 rounded-full bg-black/55 px-2 py-0.5 text-[0.65rem] font-medium tabular-nums text-white">
                        {(index % total) + 1} / {total}
                    </span>
                </>
            )}
        </>
    )
}

const CollectionLinkCard = ({ item, schema, displayFields, collection }) => {
    const { pathname } = useLocation()
    const title = getTitle(item, schema)
    const images = getImageUrls(item, schema)
    const externalHref = item.url ?? item.URL ?? null
    const detailHref = `/coleccion/${collection}/${item.id ?? item.local_id}`
    const priceField = getPriceField(item)

    const specs = (displayFields ?? [])
        .filter(name => !PRICE_FIELDS.includes(name))
        .map(name => {
            const field = schema.find(f => f.name === name)
            const val = item[name]
            if (val == null || val === '' || (Array.isArray(val) && val.length === 0)) return null
            return { name, label: field?.label ?? name, display: formatValue(field, val) }
        })
        .filter(Boolean)

    const inner = (
        <article className="site-collection-card group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white transition duration-500 hover:-translate-y-1 hover:border-gray-300 hover:shadow-[0_24px_48px_-28px_rgba(0,0,0,0.35)]">
            <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                {isFeatured(item) && <FeaturedBadge className="absolute left-4 top-4 z-10" />}
                {images.length > 0 ? (
                    <CardImageSlider images={images} alt={title} />
                ) : (
                    <div className="flex size-full items-center justify-center">
                        <Database className="size-10 text-gray-300" />
                    </div>
                )}
            </div>

            <div className="flex flex-1 flex-col p-5 sm:p-6">
                <div className="flex items-start justify-between gap-4">
                    <h3 className="site-collection-title min-w-0 text-xl font-semibold leading-snug text-gray-900 line-clamp-2">
                        {title}
                    </h3>
                    {priceField && (
                        <p className="site-collection-price shrink-0 pt-0.5 text-lg font-semibold text-brand-primary">
                            {formatPrice(item[priceField])}
                        </p>
                    )}
                </div>

                {specs.length > 0 && (
                    <dl className="mt-5 grid grid-cols-3 border-y border-gray-100">
                        {specs.slice(0, 3).map(({ name, label, display }) => (
                            <div key={name} className="min-w-0 py-3 pr-2">
                                <dt className="truncate text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-gray-400">{label}</dt>
                                <dd className="mt-1 truncate text-sm font-medium text-gray-800" title={display}>{display}</dd>
                            </div>
                        ))}
                    </dl>
                )}

                {specs.length > 3 && (
                    <p className="mt-3 truncate text-xs text-gray-500">
                        {specs.slice(3).map(spec => spec.display).join(' · ')}
                    </p>
                )}

                <span className="site-service-link mt-auto inline-flex items-center gap-2 pt-6 text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-gray-900">
                    <span className="border-b border-current pb-0.5">{externalHref ? 'Abrir enlace' : 'Ver detalles'}</span>
                    {externalHref
                        ? <ExternalLink size={13} />
                        : <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />}
                </span>
            </div>
        </article>
    )

    if (externalHref) {
        return (
            <a href={externalHref} target="_blank" rel="noopener noreferrer" className="block h-full">
                {inner}
            </a>
        )
    }

    // fromPath: la ficha lo usa para el breadcrumb (Inicio › Catálogo › Coche)
    return <Link to={detailHref} state={{ fromPath: pathname }} className="block h-full">{inner}</Link>
}

const CmsCollectionLinks = ({ collection, title, subtitle, displayFields, showFilters, enabledFilters }) => {
    const { items, schema, loading, load } = useCollection(collection)
    const [relationData, setRelationData] = useState({})
    const [secondLevelRelationData, setSecondLevelRelationData] = useState({})
    const [filters, setFilters] = useState({})
    const [filtersOpen, setFiltersOpen] = useState(true)

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

    // Activo/destacado no son filtros para el visitante: los inactivos nunca se muestran
    // y los destacados salen siempre primero
    const booleanFields = useMemo(
        () => normalizedSchema.filter(field => field.type === 'boolean' && !STATUS_FIELDS.includes(field.name)),
        [normalizedSchema],
    )

    const priceFields = useMemo(
        () => normalizedSchema.filter(field => field.type === 'number' && PRICE_FIELDS.includes(field.name)),
        [normalizedSchema],
    )

    const activePriceFields = useMemo(() => {
        if (!enabledFilters) return priceFields
        return priceFields.filter(field => enabledFilters.includes(field.name))
    }, [priceFields, enabledFilters])

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
    const published = sortFeaturedFirst(items).filter(item => hasActiveFilter || item.activo !== false)
    const visible = published
        .filter(item => activeBooleanFields.every(field => itemMatchesBooleanFilter(item, field, filters[field.name])))
        .filter(item => activeRelationFields.every(field => itemMatchesFilter(item, field, filters[field.name])))
        .filter(item => activeSecondLevelFields.every(field => {
            const filterKey = `${field.parentFieldName}__${field.fieldName}`
            return itemMatchesSecondLevelFilter(item, field, filters[filterKey], relationData)
        }))
        .filter(item => activePriceFields.every(field => itemMatchesPriceFilter(item, field, filters[field.name])))

    if (published.length === 0) {
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

    // Valores de los elementos publicados: opciones de los filtros y tope de la barra de precio
    const usedCounts = Object.fromEntries(activeRelationFields.map(field => {
        const counts = new Map()
        published.forEach(item => {
            [item[field.name]].flat().filter(Boolean).forEach(value => {
                counts.set(String(value), (counts.get(String(value)) ?? 0) + 1)
            })
        })
        return [field.name, counts]
    }))
    const priceLimits = Object.fromEntries(activePriceFields.map(field => [
        field.name,
        Math.max(0, ...published.map(item => Number(item[field.name])).filter(Number.isFinite)),
    ]))
    const visiblePriceFields = activePriceFields.filter(field => priceLimits[field.name] > 0)
    const hasFiltersApplied = Object.values(filters).some(Boolean)

    return (
        <section className="py-10 lg:py-14">
            {(title || subtitle) && (
                <header className="mb-8 max-w-2xl lg:mb-10">
                    {title && (
                        <h2 className="site-section-title text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
                            {title}
                        </h2>
                    )}
                    {subtitle && <p className="mt-3 text-base leading-relaxed text-gray-500">{subtitle}</p>}
                </header>
            )}

            {/* Escritorio con filtros: caja lateral fija a la izquierda y tarjetas a la derecha */}
            <div className={showFilters ? 'lg:grid lg:grid-cols-[16rem_minmax(0,1fr)] lg:items-start lg:gap-10' : ''}>
                {showFilters && (
                    <aside className="site-filter-panel mb-8 rounded-xl bg-gray-50/80 p-5 lg:sticky lg:top-6 lg:mb-0 lg:p-6">
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex items-baseline gap-2.5">
                                <p className="flex items-center gap-2 self-center text-sm font-semibold text-gray-900">
                                    <SlidersHorizontal size={15} className="text-gray-500" />
                                    Filtros
                                </p>
                                <p className="text-xs tabular-nums text-gray-500">
                                    {visible.length} {visible.length === 1 ? 'resultado' : 'resultados'}
                                </p>
                            </div>
                            {/* Solo en móvil: abierto por defecto, se puede contraer. En escritorio siempre abierto */}
                            <button
                                type="button"
                                onClick={() => setFiltersOpen(open => !open)}
                                aria-expanded={filtersOpen}
                                className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-gray-500 transition hover:bg-white hover:text-gray-900 lg:hidden"
                            >
                                {filtersOpen ? 'Ocultar' : 'Mostrar'}
                                <ChevronDown size={14} className={`transition-transform ${filtersOpen ? 'rotate-180' : ''}`} />
                            </button>
                        </div>

                        <div className={`${filtersOpen ? 'mt-6' : 'hidden'} lg:mt-6 lg:block`}>
                            <CollectionFilters
                                relationFields={activeRelationFields}
                                relationData={relationData}
                                secondLevelFields={activeSecondLevelFields}
                                secondLevelRelationData={secondLevelRelationData}
                                booleanFields={activeBooleanFields}
                                priceFields={visiblePriceFields}
                                priceLimits={priceLimits}
                                usedCounts={usedCounts}
                                filters={filters}
                                onChange={(fieldName, value) => setFilters(prev => ({ ...prev, [fieldName]: value }))}
                            />
                            {hasFiltersApplied && (
                                <button
                                    type="button"
                                    onClick={() => setFilters({})}
                                    className="mt-6 inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 underline-offset-4 transition hover:text-gray-900 hover:underline"
                                >
                                    <X size={12} />
                                    Limpiar filtros
                                </button>
                            )}
                        </div>
                    </aside>
                )}

                {visible.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 rounded-2xl bg-gray-50 py-14 text-center">
                        <p className="text-sm font-semibold text-gray-700">Ningún resultado con estos filtros</p>
                        <button
                            type="button"
                            onClick={() => setFilters({})}
                            className="text-xs font-medium text-brand-primary underline underline-offset-4"
                        >
                            Limpiar filtros
                        </button>
                    </div>
                ) : (
                    <div className={`grid gap-6 sm:grid-cols-2 lg:gap-8 ${showFilters ? '2xl:grid-cols-3' : 'lg:grid-cols-3'}`}>
                        {visible.map(item => (
                            <CollectionLinkCard
                                key={item.id ?? item.local_id}
                                item={item}
                                schema={normalizedSchema}
                                displayFields={displayFields}
                                collection={collection}
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    )
}

export default CmsCollectionLinks
