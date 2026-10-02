import { Button } from '@/components/UI/coss/button'
import { getItemLabel } from './collectionItemsUtils'

const AdminCollectionFilters = ({ definitions, relationData, filters, onChange, onReset }) => {
    if (definitions.length === 0) return null

    const hasActiveFilters = Object.values(filters).some(Boolean)

    return (
        <div className="flex flex-wrap items-end gap-3 border-b border-[#eef0f4] bg-[#fbfcfe] px-5 py-4">
            {definitions.map(definition => {
                if (definition.type === 'boolean') {
                    return (
                        <label key={definition.key} className="flex min-w-40 flex-col gap-1.5">
                            <span className="text-xs font-semibold uppercase tracking-wide text-[#6b7280]">{definition.label}</span>
                            <select
                                value={filters[definition.key] ?? ''}
                                onChange={(event) => onChange(definition.key, event.target.value)}
                                className="h-9 rounded-lg border border-[#e5e7eb] bg-white px-3 text-sm text-[#374151] shadow-sm focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary/20"
                            >
                                <option value="">Todos</option>
                                <option value="active">Activos</option>
                                <option value="inactive">No activos</option>
                            </select>
                        </label>
                    )
                }

                const options = relationData[definition.collection] ?? []

                return (
                    <label key={definition.key} className="flex min-w-44 flex-col gap-1.5">
                        <span className="text-xs font-semibold uppercase tracking-wide text-[#6b7280]">{definition.label}</span>
                        <select
                            value={filters[definition.key] ?? ''}
                            onChange={(event) => onChange(definition.key, event.target.value)}
                            className="h-9 rounded-lg border border-[#e5e7eb] bg-white px-3 text-sm text-[#374151] shadow-sm focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary/20"
                        >
                            <option value="">Todos</option>
                            {options.map(option => {
                                const label = getItemLabel(option)
                                return <option key={option.id ?? label} value={label}>{label}</option>
                            })}
                        </select>
                    </label>
                )
            })}

            {hasActiveFilters && (
                <Button type="button" variant="outline" size="sm" onClick={onReset}>
                    Limpiar filtros
                </Button>
            )}
        </div>
    )
}

export default AdminCollectionFilters
