import { useSiteSettings } from '@/context/SiteSettingsContext'

const Bottom = () => {
    const { settings } = useSiteSettings() ?? {}

    return (
        <div className="
            flex items-center justify-center
            border-footer-divider border-t
            min-h-16 py-4 text-center text-sm
        ">
            {settings?.footer_copyright || `© ${new Date().getFullYear()} Todos los derechos reservados.`}
        </div>
    )
}

export default Bottom
