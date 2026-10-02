const LABEL = 'text-xs font-semibold text-[#9ca3af] uppercase tracking-wide'

const CollectionListHeader = () => (
    <div className="flex items-center gap-5 px-5 py-2.5 border-b bg-[#f9fafb]">
        <div className="w-12 shrink-0" />
        <div className="flex-1 min-w-0">
            <span className={LABEL}>Colección</span>
        </div>
        <div className="w-48 shrink-0">
            <span className={LABEL}>Campos / Ítems</span>
        </div>
        <div className="w-32 shrink-0" />
        <div className="w-18 shrink-0 flex justify-end">
            <span className={LABEL}>Acciones</span>
        </div>
    </div>
)

export default CollectionListHeader
