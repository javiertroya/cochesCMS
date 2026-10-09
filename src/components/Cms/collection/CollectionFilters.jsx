import { useState } from 'react'
import { ChevronDown, SlidersHorizontal, X } from 'lucide-react'

import PriceRangeFilter from '@/components/UI/PriceRangeFilter'

// Bloque del panel: título en versalitas y línea fina de separación
const FilterSection = ({ title, children }) => (
    <section className="border-t border-gray-100 pt-5 first:border-t-0 first:pt-0">
        <h3 className="mb-3 text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-gray-400">{title}</h3>
        {children}
    </section>
)

// Lista de opciones con círculo de selección y número de elementos
const OptionList = ({ rows, selected, onSelect }) => (
    <ul className="-mx-2 space-y-0.5">
        {rows.map(row => {
            const active = (selected ?? '') === row.value
            return (
                <li key={row.value || '__all'}>
                    <button
                        type="button"
                        onClick={() => onSelect(row.value)}
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
)

const fieldTitle = (field) => (field.label ?? field.name).replace(/\s*\(€\)\s*$/, '')

/**
 * Panel lateral de filtros. En móvil empieza abierto y se puede contraer;
 * en escritorio está siempre abierto.
 */
const CollectionFilters = ({
    optionFilters,
    priceFilters,
    filters,
    resultCount,
    hasFiltersApplied,
    onChange,
    onClear,
}) => {
    const [open, setOpen] = useState(true)

    return (
        <aside className="site-filter-panel mb-8 rounded-xl bg-gray-50/80 p-5 lg:sticky lg:top-6 lg:mb-0 lg:p-6">
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-baseline gap-2.5">
                    <p className="flex items-center gap-2 self-center text-sm font-semibold text-gray-900">
                        <SlidersHorizontal size={15} className="text-gray-500" />
                        Filtros
                    </p>
                    <p className="text-xs tabular-nums text-gray-500">
                        {resultCount} {resultCount === 1 ? 'resultado' : 'resultados'}
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => setOpen(prev => !prev)}
                    aria-expanded={open}
                    className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-gray-500 transition hover:bg-white hover:text-gray-900 lg:hidden"
                >
                    {open ? 'Ocultar' : 'Mostrar'}
                    <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
                </button>
            </div>

            <div className={`${open ? 'mt-6' : 'hidden'} space-y-5 lg:mt-6 lg:block`}>
                {optionFilters.map(({ field, options, total }) => (
                    <FilterSection key={field.name} title={fieldTitle(field)}>
                        <OptionList
                            rows={[
                                { value: '', label: field.type === 'boolean' ? 'Todos' : 'Todas', count: total },
                                ...options.map(option => ({ ...option, label: option.value })),
                            ]}
                            selected={filters[field.name]}
                            onSelect={value => onChange(field.name, value)}
                        />
                    </FilterSection>
                ))}

                {priceFilters.map(({ field, max }) => (
                    <FilterSection key={field.name} title={fieldTitle(field)}>
                        <PriceRangeFilter
                            max={max}
                            value={filters[field.name] ?? null}
                            onChange={value => onChange(field.name, value)}
                        />
                    </FilterSection>
                ))}

                {hasFiltersApplied && (
                    <button
                        type="button"
                        onClick={onClear}
                        className="inline-flex items-center gap-1.5 pt-1 text-xs font-medium text-gray-500 underline-offset-4 transition hover:text-gray-900 hover:underline"
                    >
                        <X size={12} />
                        Limpiar filtros
                    </button>
                )}
            </div>
        </aside>
    )
}

export default CollectionFilters
