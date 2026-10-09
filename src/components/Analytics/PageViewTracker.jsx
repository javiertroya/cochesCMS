import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

import useAuth from '@/hooks/useAuth'
import { trackPageView } from '@/services/analytics_service'

// La primera vista de cada carga cuenta como entrada si no se viene de otra página del sitio
let isFirstView = true

const getExternalReferrer = () => {
    try {
        if (!document.referrer) return null
        return new URL(document.referrer).host !== window.location.host ? document.referrer : null
    } catch {
        return null
    }
}

// Registra una visita en cada cambio de ruta de la web pública (sin cookies)
const PageViewTracker = () => {
    const { pathname, search } = useLocation()
    const { user, loading } = useAuth()
    const isStaff = ['admin', 'editor'].includes(user?.role)

    useEffect(() => {
        if (loading || isStaff || pathname.startsWith('/admin')) return

        const referrer = getExternalReferrer()
        const entry = isFirstView && (Boolean(referrer) || !document.referrer)
        isFirstView = false

        trackPageView({
            path: pathname,
            entry,
            referrer: entry ? referrer : null,
            utm_source: entry ? new URLSearchParams(search).get('utm_source') : null,
        })
    }, [pathname, search, loading, isStaff])

    return null
}

export default PageViewTracker
