import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { FaCarSide, FaKey } from 'react-icons/fa6'
import {
    BookOpen, Boxes, Calendar, Cpu, FlaskConical, GraduationCap,
    Hammer, Laptop, Layers, Microscope, Monitor, Package,
    Printer, Settings, Star, Users, Wrench, Zap,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { resolveMediaUrl } from '@/utils/media'

const ICON_MAP = {
    wrench:     Wrench,
    calendar:   Calendar,
    graduation: GraduationCap,
    users:      Users,
    flask:      FlaskConical,
    laptop:     Laptop,
    layers:     Layers,
    settings:   Settings,
    book:       BookOpen,
    cpu:        Cpu,
    hammer:     Hammer,
    zap:        Zap,
    star:       Star,
    printer:    Printer,
    microscope: Microscope,
    package:    Package,
    monitor:    Monitor,
    boxes:      Boxes,
    car:        FaCarSide,
    key:        FaKey,
}

const GRADIENT_MAP = {
    blue:    'from-blue-950 to-blue-800',
    indigo:  'from-indigo-950 to-indigo-800',
    sky:     'from-sky-950 to-sky-800',
    violet:  'from-violet-950 to-violet-800',
    emerald: 'from-emerald-950 to-emerald-800',
    teal:    'from-teal-950 to-teal-800',
    rose:    'from-rose-950 to-rose-800',
    orange:  'from-orange-950 to-orange-800',
    slate:   'from-slate-950 to-slate-800',
}

const pad = (n) => String(n).padStart(2, '0')

// Índice del servicio que cruza la franja central de la ventana
const useActiveIndex = (count) => {
    const refs = useRef([])
    const [active, setActive] = useState(0)

    useEffect(() => {
        const nodes = refs.current.slice(0, count).filter(Boolean)
        if (nodes.length === 0) return undefined

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) setActive(Number(entry.target.dataset.index))
                })
            },
            { rootMargin: '-45% 0px -45% 0px' },
        )
        nodes.forEach(node => observer.observe(node))
        return () => observer.disconnect()
    }, [count])

    return [active, refs]
}

// Panel visual: imagen del servicio o, si no tiene, un fondo con el icono
const ServiceVisual = ({ item, index, total, className }) => {
    const Icon = ICON_MAP[item.icon] ?? Wrench
    const gradient = GRADIENT_MAP[item.gradient] ?? GRADIENT_MAP.slate

    if (item.image) {
        return (
            <div className={cn('relative overflow-hidden rounded-2xl bg-brand-dark', className)}>
                <img src={resolveMediaUrl(item.image)} alt={item.title ?? ''} className="size-full object-cover" />
                <div className="absolute inset-0 bg-linear-to-t from-black/55 via-black/0 to-black/0" />
                <span className="absolute bottom-5 left-6 font-mono text-xs tracking-[0.3em] text-white/80">
                    {pad(index + 1)} / {pad(total)}
                </span>
            </div>
        )
    }

    return (
        <div className={cn('site-service-panel relative flex overflow-hidden rounded-2xl bg-linear-to-br text-white', gradient, className)}>
            <span
                aria-hidden="true"
                className="site-service-numeral pointer-events-none absolute -bottom-[0.18em] -right-[0.04em] select-none text-[11rem] font-semibold leading-none text-white/[0.06] lg:text-[16rem]"
            >
                {pad(index + 1)}
            </span>
            <div className="relative flex w-full flex-col justify-between p-6 lg:p-10">
                <Icon className="site-service-accent size-7 text-white/90 lg:size-9" />
                <span className="font-mono text-xs tracking-[0.3em] text-white/60">
                    {pad(index + 1)} / {pad(total)}
                </span>
            </div>
        </div>
    )
}

const ServiceLink = ({ item }) => (
    <Link
        to={item.to}
        className="site-service-link group/link mt-6 inline-flex items-center gap-3 text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-gray-900"
    >
        <span className="border-b border-current pb-1">{item.linkText || 'Explorar'}</span>
        <ArrowRight size={14} className="transition-transform duration-300 group-hover/link:translate-x-1" />
    </Link>
)

const CmsServiceStack = ({ title, subtitle, items = [], showLinks = true }) => {
    const [active, refs] = useActiveIndex(items.length)

    if (items.length === 0) return null

    return (
        <section className="py-14 lg:py-20">
            {(title || subtitle) && (
                <header className="mb-10 max-w-2xl lg:mb-4">
                    <p className="site-service-accent mb-4 flex items-center gap-3 text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-brand-primary">
                        <span className="h-px w-10 bg-current" />
                        {pad(items.length)} {items.length === 1 ? 'servicio' : 'servicios'}
                    </p>
                    {title && (
                        <h2 className="site-section-title text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
                            {title}
                        </h2>
                    )}
                    {subtitle && <p className="mt-4 text-base leading-relaxed text-gray-500">{subtitle}</p>}
                </header>
            )}

            <div className="grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-20">
                {/* Panel fijo (escritorio): cambia con el servicio activo */}
                <div className="hidden lg:block">
                    <div className="sticky top-[15vh] h-[70vh] max-h-[40rem]">
                        {items.map((item, index) => (
                            <ServiceVisual
                                key={index}
                                item={item}
                                index={index}
                                total={items.length}
                                className={cn(
                                    'absolute inset-0 transition-opacity duration-700 ease-out',
                                    index === active ? 'opacity-100' : 'opacity-0',
                                )}
                            />
                        ))}
                        <div className="absolute -bottom-6 left-0 right-0 h-px bg-gray-200">
                            <div
                                className="site-service-progress h-px bg-brand-primary transition-all duration-700 ease-out"
                                style={{ width: `${((active + 1) / items.length) * 100}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Lista de servicios */}
                <ol className="border-t border-gray-200 lg:border-t-0">
                    {items.map((item, index) => (
                        <li
                            key={index}
                            ref={node => { refs.current[index] = node }}
                            data-index={index}
                            className={cn(
                                'border-b border-gray-200 py-8 transition-opacity duration-500',
                                'lg:flex lg:min-h-[60vh] lg:items-center lg:border-b-0 lg:py-0',
                                index === active ? 'lg:opacity-100' : 'lg:opacity-30',
                            )}
                        >
                            <div className="w-full">
                                <ServiceVisual
                                    item={item}
                                    index={index}
                                    total={items.length}
                                    className="mb-6 aspect-[16/10] lg:hidden"
                                />
                                <div className="flex gap-5 sm:gap-8">
                                    <span className="site-service-accent pt-1.5 font-mono text-xs tracking-[0.2em] text-brand-primary">
                                        {pad(index + 1)}
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="text-2xl font-semibold leading-tight text-gray-900 sm:text-3xl lg:text-4xl">
                                            {item.title}
                                        </h3>
                                        {item.description && (
                                            <p className="mt-4 max-w-lg text-[0.95rem] leading-relaxed text-gray-500">
                                                {item.description}
                                            </p>
                                        )}
                                        {showLinks && item.to && <ServiceLink item={item} />}
                                    </div>
                                </div>
                            </div>
                        </li>
                    ))}
                </ol>
            </div>
        </section>
    )
}

export default CmsServiceStack
