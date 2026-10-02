import { Search } from 'lucide-react'
import FilterButton from '@/components/Admin/UI/FilterButton'

const Toolbar = ({
    filters = [],
    activeFilter,
    onFilterChange,
    search,
    onSearchChange,
    searchPlaceholder = 'Buscar…',
    filteredCount,
    totalCount,
}) => {
    const isFiltered = filteredCount !== undefined && totalCount !== undefined && filteredCount < totalCount

    return (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 bg-gray-50/60 px-5 py-3">
            <div className="flex flex-wrap items-center gap-2">
                {filters.map(f => (
                    <FilterButton
                        key={f.value}
                        active={activeFilter === f.value}
                        onClick={() => onFilterChange(f.value)}
                        count={f.count}
                    >
                        {f.label}
                    </FilterButton>
                ))}
            </div>
            <div className="flex w-full flex-wrap items-center justify-end gap-3 sm:w-auto">
                {isFiltered && (
                    <span className="text-xs text-gray-400">
                        {filteredCount} de {totalCount}
                    </span>
                )}
                <label className="relative w-full sm:w-72">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-300" />
                    <input
                        type="search"
                        value={search}
                        onChange={e => onSearchChange(e.target.value)}
                        placeholder={searchPlaceholder}
                        className="h-9 w-full rounded-full border border-gray-200 bg-white pl-9 pr-3 text-sm outline-none transition-shadow placeholder:text-gray-300 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
                    />
                </label>
            </div>
        </div>
    )
}

export default Toolbar
