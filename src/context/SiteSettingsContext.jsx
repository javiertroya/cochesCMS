import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { getPublicSettings } from '@/services/settings_service'

const SiteSettingsContext = createContext(null)

// Fonts that need to be fetched from Google Fonts
const GOOGLE_FONTS = [
    'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Nunito',
    'DM Sans', 'Plus Jakarta Sans', 'Source Sans Pro', 'Poppins',
]

const loadGoogleFont = (fontName) => {
    if (!fontName || !GOOGLE_FONTS.includes(fontName)) return
    const id = `gfont-${fontName.replace(/\s+/g, '-')}`
    if (document.getElementById(id)) return
    const link = document.createElement('link')
    link.id = id
    link.rel = 'stylesheet'
    link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(/\s+/g, '+')}:wght@400;500;600;700&display=swap`
    document.head.appendChild(link)
}

export const applyStyles = (settings) => {
    const root = document.documentElement

    if (settings.primary_color) {
        root.style.setProperty('--color-brand-primary', settings.primary_color)
        root.style.setProperty('--color-submit', settings.primary_color)
    }
    if (settings.secondary_color) {
        root.style.setProperty('--color-brand-dark', settings.secondary_color)
        root.style.setProperty('--color-brand-dark-deep', settings.secondary_color)
        root.style.setProperty('--color-footer', settings.secondary_color)
    }
    if (settings.accent_color) {
        root.style.setProperty('--color-accent-nav', settings.accent_color)
    }
    if (settings.background_color) {
        root.style.setProperty('--background', settings.background_color)
    }
    if (settings.text_color) {
        root.style.setProperty('--foreground', settings.text_color)
    }
    if (settings.heading_color) {
        root.style.setProperty('--site-heading-color', settings.heading_color)
    }
    if (settings.link_color) {
        root.style.setProperty('--site-link-color', settings.link_color)
    }
    if (settings.border_radius) {
        root.style.setProperty('--radius', settings.border_radius)
    }
    if (settings.font_size_base) {
        root.style.fontSize = settings.font_size_base
    }
    if (settings.font_family_body) {
        loadGoogleFont(settings.font_family_body)
        root.style.setProperty('--site-font-body', `"${settings.font_family_body}", sans-serif`)
    }
    if (settings.font_family_heading) {
        loadGoogleFont(settings.font_family_heading)
        root.style.setProperty('--site-font-heading', `"${settings.font_family_heading}", sans-serif`)
    }
    if (settings.site_name) {
        document.title = settings.site_name
    }
    if (settings.favicon_url) {
        const existing = document.querySelector("link[rel~='icon']")
        const link = existing ?? document.createElement('link')
        if (!existing) {
            link.rel = 'icon'
            document.head.appendChild(link)
        }
        link.href = settings.favicon_url
    }
}

export const SiteSettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState(null)

    const applyAndSet = useCallback((data) => {
        setSettings(data)
        applyStyles(data)
    }, [])

    useEffect(() => {
        getPublicSettings()
            .then(applyAndSet)
            .catch(() => {})
    }, [applyAndSet])

    return (
        <SiteSettingsContext.Provider value={{ settings, applyAndSet }}>
            {children}
        </SiteSettingsContext.Provider>
    )
}

export const useSiteSettings = () => useContext(SiteSettingsContext)
