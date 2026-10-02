const CmsDivider = ({ label }) => (
    <div className="flex items-center gap-4 py-8">
        <div className="h-px flex-1 bg-gray-200" />
        {label && <span className="shrink-0 text-xs font-medium uppercase tracking-widest text-gray-400">{label}</span>}
        {label && <div className="h-px flex-1 bg-gray-200" />}
    </div>
)

export default CmsDivider
