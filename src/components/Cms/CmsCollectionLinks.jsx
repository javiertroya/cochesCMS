import { useEffect } from 'react'
import { Database } from 'lucide-react'

import { Spinner } from '@/components/UI/coss/spinner'
import useCollection from '@/hooks/useCollection'

import CollectionCard from './collection/CollectionCard'
import CollectionFilters from './collection/CollectionFilters'
import useCollectionFilters from './collection/useCollectionFilters'

const EmptyState = ({ title, children }) => (
    <div className="flex flex-col items-center gap-2 rounded-2xl bg-gray-50 py-14 text-center">
        <Database className="size-8 text-gray-300" />
        <p className="text-sm font-semibold text-gray-700">{title}</p>
        {children}
    </div>
)

// Listado de una colección en tarjetas, con filtros opcionales (p. ej. el catálogo de coches)
const CmsCollectionLinks = ({ collection, title, subtitle, displayFields, showFilters, enabledFilters }) => {
    const { items, schema, loading, load } = useCollection(collection)
    const {
        published, visible, optionFilters, priceFilters,
        filters, setFilter, clearFilters, hasFiltersApplied,
    } = useCollectionFilters({ items, schema, enabledFilters })

    useEffect(() => { load() }, [load])

    if (!collection) {
        return <p className="py-8 text-slate-600">Selecciona una colección para mostrar sus elementos.</p>
    }

    if (loading) {
        return (
            <section className="flex flex-col items-center justify-center gap-3 py-24 text-center">
                <Spinner className="h-7 w-7 text-gray-300" />
                <p className="text-sm text-gray-400">Cargando elementos…</p>
            </section>
        )
    }

    if (published.length === 0) {
        return (
            <section className="py-8">
                <EmptyState title="Sin elementos">
                    <p className="text-xs text-gray-400">No hay elementos publicados en esta colección.</p>
                </EmptyState>
            </section>
        )
    }

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

            {/* Con filtros en escritorio: caja lateral fija a la izquierda y tarjetas a la derecha */}
            <div className={showFilters ? 'lg:grid lg:grid-cols-[16rem_minmax(0,1fr)] lg:items-start lg:gap-10' : ''}>
                {showFilters && (
                    <CollectionFilters
                        optionFilters={optionFilters}
                        priceFilters={priceFilters}
                        filters={filters}
                        resultCount={visible.length}
                        hasFiltersApplied={hasFiltersApplied}
                        onChange={setFilter}
                        onClear={clearFilters}
                    />
                )}

                {visible.length === 0 ? (
                    <EmptyState title="Ningún resultado con estos filtros">
                        <button
                            type="button"
                            onClick={clearFilters}
                            className="text-xs font-medium text-brand-primary underline underline-offset-4"
                        >
                            Limpiar filtros
                        </button>
                    </EmptyState>
                ) : (
                    <div className={`grid gap-6 sm:grid-cols-2 lg:gap-8 ${showFilters ? '2xl:grid-cols-3' : 'lg:grid-cols-3'}`}>
                        {visible.map(item => (
                            <CollectionCard
                                key={item.id ?? item.local_id}
                                item={item}
                                schema={schema}
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
