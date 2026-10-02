import { Link } from 'react-router-dom'
import { FaArrowRight } from 'react-icons/fa'
import { FaCarSide, FaKey } from 'react-icons/fa6'
import {
    BookOpen, Boxes, Calendar, Cpu, FlaskConical, GraduationCap,
    Hammer, Laptop, Layers, Microscope, Monitor, Package,
    Printer, Settings, Star, Users, Wrench, Zap,
} from 'lucide-react'

import ScrollStack, { ScrollStackItem } from '@/components/UI/react-bits/scroll-stack'
import SectionHeading from '@/components/Cms/SectionHeading'

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
    blue:    'from-blue-900 to-blue-700',
    indigo:  'from-indigo-900 to-indigo-700',
    sky:     'from-sky-900 to-sky-700',
    violet:  'from-violet-900 to-violet-700',
    emerald: 'from-emerald-900 to-emerald-700',
    teal:    'from-teal-900 to-teal-700',
    rose:    'from-rose-900 to-rose-700',
    orange:  'from-orange-900 to-orange-700',
    slate:   'from-slate-900 to-slate-700',
}

const CmsServiceStack = ({ title, subtitle, items = [], showLinks = true }) => {
    if (items.length === 0) return null

    return (
        <section className="py-8">
            {title && (
                <SectionHeading subtitle={subtitle}>
                    {title}
                </SectionHeading>
            )}

            <ScrollStack useWindowScroll itemDistance={24}>
                {items.map((item, index) => {
                    const Icon = ICON_MAP[item.icon] ?? Wrench
                    const gradient = GRADIENT_MAP[item.gradient] ?? GRADIENT_MAP.blue
                    const itemBg = index % 2 === 0 ? 'bg-white' : 'bg-brand-light'

                    return (
                        <ScrollStackItem key={index} itemClassName={itemBg}>
                            <div className="flex h-full flex-col items-start gap-5 sm:flex-row sm:items-center sm:gap-10">
                                <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br ${gradient} text-white shadow-md sm:h-20 sm:w-20`}>
                                    <Icon className="size-7 sm:size-9" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h3 className="text-xl font-bold text-gray-900 sm:text-2xl">{item.title}</h3>
                                    <p className="mt-3 max-w-xl text-sm leading-relaxed text-gray-500 sm:text-base">{item.description}</p>
                                </div>
                                {showLinks && item.to && (
                                    <Link
                                        to={item.to}
                                        className="flex shrink-0 items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition-all hover:border-brand-primary hover:bg-brand-primary hover:text-white sm:px-5 sm:py-3"
                                    >
                                        {item.linkText || 'Explorar'}
                                        <FaArrowRight size={12} />
                                    </Link>
                                )}
                            </div>
                        </ScrollStackItem>
                    )
                })}
            </ScrollStack>
        </section>
    )
}

export default CmsServiceStack
