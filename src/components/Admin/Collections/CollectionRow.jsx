import { ChevronRight, Database, Lock } from 'lucide-react'

import { DeleteButton } from '@/components/Admin/UI/ActionButtons'

const CollectionRow = ({ collection, onView, onDelete }) => {
    const fieldCount = collection.fields_schema?.length ?? 0
    const itemCount  = collection.item_count ?? 0

    return (
        <div
            className="flex items-center gap-5 px-5 py-4 cursor-pointer transition-colors hover:bg-[#f6f7fb]"
            onClick={onView}
        >
            <div className="w-12 h-12 shrink-0 flex items-center justify-center rounded-xl bg-violet-100">
                <Database className="h-5 w-5 text-violet-700" />
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <p className="font-semibold text-base truncate leading-tight text-[#111827]">
                        {collection.name}
                    </p>
                    {collection.is_locked && (
                        <Lock size={12} className="shrink-0 text-amber-500" title="Colección protegida" />
                    )}
                </div>
                {collection.description ? (
                    <p className="text-xs text-[#9ca3af] truncate mt-0.5">{collection.description}</p>
                ) : (
                    <p className="text-xs text-[#d1d5db] mt-0.5 italic">Sin descripción</p>
                )}
            </div>

            <div className="w-48 shrink-0 flex items-center gap-3">
                <div className="text-center">
                    <p className="text-sm font-semibold text-[#111827]">{fieldCount}</p>
                    <p className="text-[11px] text-[#9ca3af]">campo{fieldCount !== 1 ? 's' : ''}</p>
                </div>
                <div className="w-px h-6 bg-[#e5e7eb]" />
                <div className="text-center">
                    <p className="text-sm font-semibold text-[#111827]">{itemCount}</p>
                    <p className="text-[11px] text-[#9ca3af]">ítem{itemCount !== 1 ? 's' : ''}</p>
                </div>
            </div>

            <div className="w-32 shrink-0">
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#e5e7eb] px-3 py-1.5 text-xs font-medium text-[#6b7280] transition-colors hover:bg-brand-primary hover:text-white hover:border-transparent">
                    Ver ítems
                    <ChevronRight className="h-3.5 w-3.5" />
                </span>
            </div>

            <div
                className="w-18 shrink-0 flex items-center justify-end gap-1.5"
                onClick={e => e.stopPropagation()}
            >
                {!collection.is_locked && (
                    <DeleteButton title="Eliminar colección" onClick={() => onDelete(collection)} />
                )}
            </div>
        </div>
    )
}

export default CollectionRow
