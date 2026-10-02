import { Navigation, ChevronRight, ChevronUp, ChevronDown } from 'lucide-react'

const NavNodeCard = ({ node, siblings, siblingIndex, onSwap, saving, depth = 0 }) => {
    const isPublished = node.is_published
    const isFirst     = siblingIndex === 0
    const isLast      = siblingIndex === siblings.length - 1

    return (
        <div className={depth > 0 ? 'ml-8 mt-1.5' : ''}>
            <div
                className={`flex items-center gap-3 rounded-xl border bg-white px-4 py-3 transition-shadow hover:shadow-sm ${
                    depth > 0 ? 'border-gray-100' : 'border-gray-200 shadow-xs'
                }`}
            >
                {depth > 0 && (
                    <ChevronRight className="-ml-1 h-3.5 w-3.5 shrink-0 text-gray-300" />
                )}
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                    <Navigation className="h-4 w-4 text-brand-primary" />
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-medium text-gray-900">{node.title}</span>
                        <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                                isPublished
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : 'bg-gray-100 text-gray-500'
                            }`}
                        >
                            {isPublished ? 'Publicada' : 'Borrador'}
                        </span>
                    </div>
                    <p className="mt-0.5 font-mono text-xs text-gray-400">{node.slug}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                        <p className="text-[10px] text-gray-400">Posición</p>
                        <p className="text-sm font-semibold text-gray-700">{node.nav_order ?? '—'}</p>
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <button
                            onClick={() => onSwap(node, siblings[siblingIndex - 1])}
                            disabled={isFirst || saving}
                            className="flex h-6 w-6 items-center justify-center rounded-md text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:pointer-events-none disabled:opacity-20"
                            aria-label="Subir"
                        >
                            <ChevronUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                            onClick={() => onSwap(node, siblings[siblingIndex + 1])}
                            disabled={isLast || saving}
                            className="flex h-6 w-6 items-center justify-center rounded-md text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:pointer-events-none disabled:opacity-20"
                            aria-label="Bajar"
                        >
                            <ChevronDown className="h-3.5 w-3.5" />
                        </button>
                    </div>
                </div>
            </div>
            {node.children.length > 0 && (
                <div className="mt-1.5 space-y-1.5 border-l-2 border-gray-100 pl-4 ml-4">
                    {node.children.map((child, idx) => (
                        <NavNodeCard
                            key={child.slug}
                            node={child}
                            siblings={node.children}
                            siblingIndex={idx}
                            onSwap={onSwap}
                            saving={saving}
                            depth={depth + 1}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

export default NavNodeCard
