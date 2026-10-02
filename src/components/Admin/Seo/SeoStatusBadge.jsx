const SeoStatusBadge = ({ score }) => {
    if (score === 4)
        return (
            <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
                Completo
            </span>
        )
    if (score >= 2)
        return (
            <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-200">
                Parcial
            </span>
        )
    return (
        <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600 ring-1 ring-red-200">
            Incompleto
        </span>
    )
}

export default SeoStatusBadge
