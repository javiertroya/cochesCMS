import { formatNumber } from '@/utils/format'

const AnalyticsTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
        <div className="rounded-lg border bg-white px-3 py-2 shadow-md text-xs">
            <p className="mb-1 font-medium text-[#374151]">{label}</p>
            {payload.map((p) => (
                <p key={p.dataKey} className="font-semibold" style={{ color: p.color }}>
                    {formatNumber(p.value)} {p.name}
                </p>
            ))}
        </div>
    )
}

export default AnalyticsTooltip
