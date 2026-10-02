import { Link } from 'react-router-dom'
import { resolveMediaUrl } from '@/utils/media'

const SiteBrand = ({ settings, className = '', imageClassName = 'h-8 lg:h-10', textClassName = '' }) => {
    const logoUrl = resolveMediaUrl(settings?.logo_url)
    const siteName = settings?.site_name || 'Concesionario'

    return (
        <Link to="/" className={`inline-flex min-w-0 items-center ${className}`}>
            {logoUrl ? (
                <img src={logoUrl} alt={siteName} className={`block w-auto object-contain ${imageClassName}`} />
            ) : (
                <span className={`site-brand ${textClassName}`}>
                    {siteName}
                </span>
            )}
        </Link>
    )
}

export default SiteBrand
