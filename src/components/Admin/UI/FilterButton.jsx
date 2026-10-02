const FilterButton = ({ active, children, count, onClick }) => (
    <button
        type="button"
        onClick={onClick}
        className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
            active
                ? 'bg-brand-primary text-white shadow-sm shadow-blue-900/15'
                : 'bg-white text-gray-500 ring-1 ring-gray-200 hover:bg-gray-50'
        }`}
    >
        {children}
        {count !== undefined && (
            <span className="ml-1.5 rounded-full bg-current/10 px-1.5 py-px text-[10px] opacity-70">
                {count}
            </span>
        )}
    </button>
)

export default FilterButton
