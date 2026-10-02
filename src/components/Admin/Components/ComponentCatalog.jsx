import { useState } from 'react'
import { Layers3, Search } from 'lucide-react'

const ComponentCard = ({ componentType }) => (
    <article className="flex flex-col overflow-hidden rounded-xl border border-[#e5e7eb] bg-white shadow-sm transition-shadow hover:shadow-md">
        {/* Card header */}
        <div className="flex items-start gap-3 border-b border-[#f3f4f6] px-5 py-4">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                <Layers3 size={17} className="text-brand-primary" />
            </div>
            <div className="min-w-0">
                <h2 className="truncate font-semibold text-[#111827]">{componentType.name}</h2>
                <p className="mt-0.5 text-xs font-mono text-[#9ca3af]">{componentType.type}</p>
            </div>
        </div>

        {/* Description */}
        <div className="px-5 py-3">
            <p className="min-h-10 text-sm leading-relaxed text-[#6b7280]">
                {componentType.description || 'Sin descripción.'}
            </p>
        </div>

        {/* Props preview */}
        {componentType.default_props && Object.keys(componentType.default_props).length > 0 && (
            <div className="border-t border-[#f3f4f6] px-5 py-3">
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-[#9ca3af]">
                    Props por defecto
                </p>
                <pre className="max-h-36 overflow-auto rounded-lg bg-[#f8fafc] p-3 text-xs leading-relaxed text-[#374151]">
                    {JSON.stringify(componentType.default_props, null, 2)}
                </pre>
            </div>
        )}
    </article>
)

const ComponentCatalog = ({ componentTypes }) => {
    const [query, setQuery] = useState('')

    const filtered = query.trim()
        ? componentTypes.filter(c =>
            c.name.toLowerCase().includes(query.toLowerCase()) ||
            c.type.toLowerCase().includes(query.toLowerCase()),
        )
        : componentTypes

    return (
        <div className="space-y-4">
            {/* Search */}
            <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af]" />
                <input
                    type="search"
                    placeholder="Buscar componente…"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    className="h-10 w-full rounded-lg border border-[#e5e7eb] bg-white pl-9 pr-4 text-sm text-[#111827] placeholder:text-[#9ca3af] focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary/20 sm:max-w-xs"
                />
            </div>

            {/* Grid */}
            {filtered.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {filtered.map(ct => (
                        <ComponentCard key={ct.type} componentType={ct} />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-[#d1d5db] py-16 text-center text-[#9ca3af]">
                    <Layers3 size={32} className="opacity-40" />
                    <p className="text-sm">No hay componentes que coincidan.</p>
                </div>
            )}
        </div>
    )
}

export default ComponentCatalog
