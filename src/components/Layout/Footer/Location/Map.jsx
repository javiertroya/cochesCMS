import { useSiteSettings } from '@/context/SiteSettingsContext'

const FALLBACK_MAP = "https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d499.54512444733064!2d-0.9795139082307653!3d37.60520696626643!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMzfCsDM2JzE4LjciTiAwwrA1OCc0NS4yIlc!5e1!3m2!1ses!2ses!4v1777738863105!5m2!1ses!2ses"
const FALLBACK_ADDRESS = "Calle Sor Francisca Armendáriz, 6.\n30203 Cartagena, Murcia"

const getMapSrc = (value) => {
    if (!value) return FALLBACK_MAP
    const iframeSrc = String(value).match(/src=["']([^"']+)["']/i)?.[1]
    return iframeSrc || value
}

const Map = () => {
    const { settings } = useSiteSettings() ?? {}
    const mapUrl = getMapSrc(settings?.footer_map_embed)
    const address = settings?.footer_address || FALLBACK_ADDRESS

    // .............................
    return (
        <div>
            <iframe
                src={mapUrl}
                title="Mapa de localización"
                allowFullScreen="yes"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="block aspect-[4/3] w-full max-w-md rounded-lg border-0 bg-white/5 lg:aspect-video lg:max-w-none"
            />
            <address className="
                not-italic text-sm leading-snug
                mt-2
            ">
                {address.split('\n').map((line, index) => (
                    <span key={index}>
                        {line}
                        {index < address.split('\n').length - 1 && <br />}
                    </span>
                ))}
            </address>
        </div>
    )
}

export default Map
