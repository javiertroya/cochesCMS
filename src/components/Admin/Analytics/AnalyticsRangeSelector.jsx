const RANGE_OPTIONS = [
    { value: '7d',  label: '7d'  },
    { value: '30d', label: '30d' },
    { value: '90d', label: '90d' },
]

const AnalyticsRangeSelector = ({ range, onChange }) => (
    <div className="flex rounded-lg border border-[#dcdfea] bg-[#f9fafb] p-1">
        {RANGE_OPTIONS.map((opt) => (
            <button
                key={opt.value}
                onClick={() => onChange(opt.value)}
                className={`min-w-10 rounded px-3 py-1.5 text-xs font-medium transition-colors ${
                    range === opt.value
                        ? 'bg-white text-[#111827] shadow-sm'
                        : 'text-[#6b7280] hover:text-[#111827]'
                }`}
            >
                {opt.label}
            </button>
        ))}
    </div>
)

export default AnalyticsRangeSelector
