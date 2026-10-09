import { FaPhone, FaWhatsapp } from 'react-icons/fa6'

import { useSiteSettings } from '@/context/SiteSettingsContext'
import { cn } from '@/lib/utils'
import { formatPrice, getPriceField, getWhatsAppUrl } from '@/utils/collection'

const YEAR_FIELDS = ['ano', 'año', 'year']
const KM_FIELDS = ['kilometros', 'km', 'kilómetros']

const pick = (item, names) => names.map(name => item[name]).find(value => value != null && value !== '')

// Mensaje prellenado: coche, datos básicos, pregunta de interés y enlace a la ficha
const buildMessage = (item, title) => {
    const year = pick(item, YEAR_FIELDS)
    const km = pick(item, KM_FIELDS)
    const priceField = getPriceField(item)

    const details = [
        year,
        km != null && Number.isFinite(Number(km)) && `${new Intl.NumberFormat('es-ES').format(Number(km))} km`,
        priceField && formatPrice(item[priceField]),
    ].filter(Boolean)

    const url = `${window.location.origin}${window.location.pathname}`

    return [
        `Hola, me interesa el ${title}${details.length ? ` (${details.join(' · ')})` : ''} que he visto en vuestra web.`,
        '¿Sigue disponible? Me gustaría recibir más información.',
        url,
    ].join('\n\n')
}

const InterestActions = ({ item, title, className }) => {
    const { settings } = useSiteSettings() ?? {}
    const phone = settings?.header_phone
    const whatsappUrl = getWhatsAppUrl(settings?.whatsapp_number || phone, buildMessage(item, title))

    if (!whatsappUrl && !phone) return null

    return (
        <div className={cn('flex flex-col gap-3 sm:flex-row', className)}>
            {whatsappUrl && (
                <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="site-interest-primary inline-flex h-12 flex-1 items-center justify-center gap-2.5 rounded-lg bg-brand-primary px-6 text-sm font-semibold text-white transition hover:opacity-90"
                >
                    <FaWhatsapp size={18} />
                    Me interesa
                </a>
            )}
            {phone && (
                <a
                    href={`tel:${phone.replace(/[^\d+]/g, '')}`}
                    className="site-interest-secondary inline-flex h-12 items-center justify-center gap-2.5 rounded-lg border border-gray-300 px-6 text-sm font-semibold text-gray-800 transition hover:border-gray-900"
                >
                    <FaPhone size={14} />
                    Llamar
                </a>
            )}
        </div>
    )
}

export default InterestActions
