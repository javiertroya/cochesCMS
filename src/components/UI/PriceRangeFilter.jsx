import { cn } from '@/lib/utils'

export const PRICE_STEP = 5000

const formatEuros = (value) =>
    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value)

const formatShort = (value) => (value === 0 ? '0' : `${value / 1000}k`)

// Pulgares de los dos sliders superpuestos: solo ellos reciben el ratón, no la pista
const THUMB = cn(
    'pointer-events-none absolute inset-x-0 top-1/2 h-0 w-full -translate-y-1/2 appearance-none bg-transparent',
    '[&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:size-5 [&::-webkit-slider-thumb]:cursor-grab',
    '[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2',
    '[&::-webkit-slider-thumb]:border-brand-primary [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow',
    '[&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:size-5 [&::-moz-range-thumb]:cursor-grab',
    '[&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-brand-primary',
    '[&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:shadow',
)

// Barra de precio por tramos de 5.000 €: value = [min, max] o null (sin filtro)
const PriceRangeFilter = ({ label = 'Precio', max, value, onChange }) => {
    const limit = Math.max(PRICE_STEP, Math.ceil(max / PRICE_STEP) * PRICE_STEP)
    const [low, high] = value ?? [0, limit]
    const steps = limit / PRICE_STEP

    const update = (nextLow, nextHigh) => {
        const isFullRange = nextLow === 0 && nextHigh >= limit
        onChange(isFullRange ? null : [nextLow, nextHigh])
    }

    const summary = !value
        ? 'Todos los precios'
        : low === 0
            ? `Hasta ${formatEuros(high)}`
            : high >= limit
                ? `Desde ${formatEuros(low)}`
                : `${formatEuros(low)} – ${formatEuros(high)}`

    // Etiquetas de los tramos: todas si caben, si no una de cada varias
    const labelEvery = Math.ceil(steps / 8)

    return (
        <div className="site-price-filter space-y-3">
            <div className="flex items-baseline justify-between gap-3">
                <p className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-gray-500">{label}</p>
                <p className="text-sm font-medium text-gray-900">{summary}</p>
            </div>

            <div className="relative h-6">
                <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-gray-200" />
                <div
                    className="site-price-filter-fill absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-brand-primary"
                    style={{ left: `${(low / limit) * 100}%`, right: `${100 - (high / limit) * 100}%` }}
                />
                <input
                    type="range"
                    min={0}
                    max={limit}
                    step={PRICE_STEP}
                    value={low}
                    onChange={e => update(Math.min(Number(e.target.value), high - PRICE_STEP), high)}
                    aria-label="Precio mínimo"
                    className={THUMB}
                />
                <input
                    type="range"
                    min={0}
                    max={limit}
                    step={PRICE_STEP}
                    value={high}
                    onChange={e => update(low, Math.max(Number(e.target.value), low + PRICE_STEP))}
                    aria-label="Precio máximo"
                    className={THUMB}
                />
            </div>

            <div className="relative h-4 text-[0.65rem] text-gray-400">
                {Array.from({ length: steps + 1 }, (_, index) => index).map(index => {
                    if (index % labelEvery !== 0 && index !== steps) return null
                    const amount = index * PRICE_STEP
                    return (
                        <span
                            key={index}
                            className={cn(
                                'absolute tabular-nums',
                                index === 0 ? 'translate-x-0' : index === steps ? '-translate-x-full' : '-translate-x-1/2',
                            )}
                            style={{ left: `${(index / steps) * 100}%` }}
                        >
                            {formatShort(amount)}
                        </span>
                    )
                })}
            </div>
        </div>
    )
}

export default PriceRangeFilter
