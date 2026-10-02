const SeoScoreBar = ({ score, max = 4 }) => {
    const pct   = (score / max) * 100
    const color = score === max ? 'bg-emerald-500' : score >= 2 ? 'bg-amber-400' : 'bg-red-400'
    return (
        <div className="flex items-center gap-2.5">
            <div className="h-1.5 w-20 overflow-hidden rounded-full bg-gray-100">
                <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
            </div>
            <span className="tabular-nums text-xs text-gray-400">{score}/{max}</span>
        </div>
    )
}

export default SeoScoreBar
