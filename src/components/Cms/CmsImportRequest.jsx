import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ArrowRight, Check, Link2, Search } from 'lucide-react'

import SectionHeading from './SectionHeading'
import ImportSearchForm from './forms/ImportSearchForm'
import ImportFoundForm from './forms/ImportFoundForm'

// Opciones: el hash de la URL (#busqueda / #encontrado) abre directamente el formulario
const OPTIONS = {
    busqueda: { Icon: Search },
    encontrado: { Icon: Link2 },
}

const OptionCard = ({ option, title, text, button, active, onSelect }) => {
    const { Icon } = OPTIONS[option]
    return (
        <button
            type="button"
            onClick={() => onSelect(option)}
            aria-pressed={active}
            aria-controls="import-request-form"
            className={`group relative flex h-full flex-col items-start rounded-2xl border-2 bg-white p-6 text-left shadow-sm transition sm:p-8 ${
                active
                    ? 'border-brand-primary ring-4 ring-brand-primary/10'
                    : 'border-gray-100 hover:-translate-y-0.5 hover:border-brand-primary/40 hover:shadow-md'
            }`}
        >
            {active && (
                <span className="absolute right-4 top-4 flex size-7 items-center justify-center rounded-full bg-brand-primary text-white">
                    <Check className="size-4" />
                </span>
            )}
            <span className="flex size-14 items-center justify-center rounded-2xl bg-linear-to-br from-brand-dark to-brand-primary text-white shadow-md">
                <Icon className="size-7" />
            </span>
            <span className="mt-5 text-xl font-bold text-gray-900 sm:text-2xl">{title}</span>
            {text && <span className="mt-2 flex-1 text-sm leading-relaxed text-gray-500 sm:text-base">{text}</span>}
            {button && (
                <span className={`mt-6 inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition ${
                    active ? 'bg-brand-primary text-white' : 'bg-gray-50 text-gray-800 group-hover:bg-brand-primary group-hover:text-white'
                }`}>
                    {button}
                    <ArrowRight className="size-4" />
                </span>
            )}
        </button>
    )
}

const CmsImportRequest = ({
    anchor,
    title,
    subtitle,
    searchCardTitle,
    searchCardText,
    searchCardButton,
    foundCardTitle,
    foundCardText,
    foundCardButton,
    searchFormTitle,
    searchFormIntro,
    foundFormTitle,
    foundFormIntro,
    successMessage,
}) => {
    const { hash, pathname, search } = useLocation()
    const navigate = useNavigate()
    const formRef = useRef(null)
    const hashOption = hash.replace('#', '')
    const [selected, setSelected] = useState(OPTIONS[hashOption] ? hashOption : null)

    // Enlaces externos a /importacion#busqueda o #encontrado
    useEffect(() => {
        if (OPTIONS[hashOption]) setSelected(hashOption)
    }, [hashOption])

    useEffect(() => {
        if (selected) formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, [selected])

    const handleSelect = (option) => {
        setSelected(option)
        navigate(`${pathname}${search}#${option}`, { replace: true })
    }

    const isSearch = selected === 'busqueda'
    const formTitle = isSearch ? searchFormTitle : foundFormTitle
    const formIntro = isSearch ? searchFormIntro : foundFormIntro

    return (
        <section id={anchor || undefined} className="py-10 sm:py-14">
            {title && <SectionHeading subtitle={subtitle}>{title}</SectionHeading>}

            <div className="grid gap-5 md:grid-cols-2 md:gap-6">
                <OptionCard
                    option="busqueda"
                    title={searchCardTitle || 'Búscame un coche'}
                    text={searchCardText}
                    button={searchCardButton}
                    active={selected === 'busqueda'}
                    onSelect={handleSelect}
                />
                <OptionCard
                    option="encontrado"
                    title={foundCardTitle || 'Ya lo he encontrado'}
                    text={foundCardText}
                    button={foundCardButton}
                    active={selected === 'encontrado'}
                    onSelect={handleSelect}
                />
            </div>

            {selected && (
                <div
                    ref={formRef}
                    id="import-request-form"
                    className="mx-auto mt-10 max-w-3xl scroll-mt-32 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-8"
                >
                    {formTitle && <h3 className="text-xl font-bold text-gray-900 sm:text-2xl">{formTitle}</h3>}
                    {formIntro && <p className="mt-2 text-sm leading-relaxed text-gray-500">{formIntro}</p>}
                    <div className="mt-6">
                        {/* key: al cambiar de opción el formulario empieza limpio */}
                        {isSearch
                            ? <ImportSearchForm key="busqueda" successMessage={successMessage} />
                            : <ImportFoundForm key="encontrado" successMessage={successMessage} />}
                    </div>
                </div>
            )}
        </section>
    )
}

export default CmsImportRequest
