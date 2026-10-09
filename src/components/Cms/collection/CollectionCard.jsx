import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ArrowRight, ChevronLeft, ChevronRight, Database, ExternalLink } from 'lucide-react'

import { FeaturedBadge } from '@/components/UI/ImageGallery'
import { getImageUrls, getPriceField, getTitle, isFeatured, PRICE_FIELDS } from '@/utils/collection'
import { formatNumber, formatPrice } from '@/utils/format'
import { resolveMediaUrl } from '@/utils/media'

// Datos de la tarjeta: hasta 3 en la fila principal y el resto en una línea pequeña
const MAIN_SPECS = 3

const formatValue = (field, value) => {
    if (Array.isArray(value)) return value.join(', ')
    if (field?.type === 'boolean') return value ? 'Sí' : 'No'
    if (field?.type === 'number' && Number.isFinite(Number(value))) return formatNumber(value)
    return String(value)
}

const getSpecs = (item, schema, displayFields = []) => displayFields
    .filter(name => !PRICE_FIELDS.includes(name))
    .map(name => {
        const field = schema.find(f => f.name === name)
        const value = item[name]
        if (value == null || value === '' || (Array.isArray(value) && value.length === 0)) return null
        return { name, label: field?.label ?? name, display: formatValue(field, value) }
    })
    .filter(Boolean)

// Variante mediana (960 px) que genera el backend al subir: carga mucho más rápido en el listado
const toCardSize = (url) => url.replace(/\.webp$/i, '-md.webp')

const ARROW_CLASS = 'absolute top-1/2 z-10 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-900 shadow-md transition hover:bg-white lg:opacity-0 lg:group-hover:opacity-100'

// Fotos con flechas: solo se carga la visible y las flechas no abren el enlace de la tarjeta
const CardImageSlider = ({ images, alt }) => {
    const [index, setIndex] = useState(0)
    const [failed, setFailed] = useState({})
    const total = images.length
    const current = images[index % total]

    const go = (event, step) => {
        event.preventDefault()
        event.stopPropagation()
        setIndex(prev => (prev + step + total) % total)
    }

    return (
        <>
            <img
                key={current}
                src={resolveMediaUrl(failed[current] ? current : toCardSize(current))}
                alt={alt}
                loading="lazy"
                onError={() => setFailed(prev => ({ ...prev, [current]: true }))}
                className="size-full object-cover transition duration-700 ease-out group-hover:scale-[1.04]"
            />
            {total > 1 && (
                <>
                    <button type="button" onClick={e => go(e, -1)} aria-label="Foto anterior" className={`${ARROW_CLASS} left-3`}>
                        <ChevronLeft size={18} />
                    </button>
                    <button type="button" onClick={e => go(e, 1)} aria-label="Foto siguiente" className={`${ARROW_CLASS} right-3`}>
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

const CollectionCard = ({ item, schema, displayFields, collection }) => {
    const { pathname } = useLocation()
    const title = getTitle(item, schema)
    const images = getImageUrls(item, schema)
    const priceField = getPriceField(item)
    const specs = getSpecs(item, schema, displayFields)
    const externalHref = item.url ?? item.URL ?? null

    const card = (
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
                        {specs.slice(0, MAIN_SPECS).map(({ name, label, display }) => (
                            <div key={name} className="min-w-0 py-3 pr-2">
                                <dt className="truncate text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-gray-400">{label}</dt>
                                <dd className="mt-1 truncate text-sm font-medium text-gray-800" title={display}>{display}</dd>
                            </div>
                        ))}
                    </dl>
                )}

                {specs.length > MAIN_SPECS && (
                    <p className="mt-3 truncate text-xs text-gray-500">
                        {specs.slice(MAIN_SPECS).map(spec => spec.display).join(' · ')}
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
                {card}
            </a>
        )
    }

    // fromPath: la ficha lo usa para el breadcrumb (Inicio › Catálogo › Coche)
    return (
        <Link
            to={`/coleccion/${collection}/${item.id ?? item.local_id}`}
            state={{ fromPath: pathname }}
            className="block h-full"
        >
            {card}
        </Link>
    )
}

export default CollectionCard
