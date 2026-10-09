import { get } from '@/services/api'

const BASE_URL = `${import.meta.env.VITE_API_URL ?? ''}/api`

export const getAdminAnalyticsOverview = (range = '30d') => {
    return get(`/admin/analytics/overview?range=${encodeURIComponent(range)}`)
}

// Sin token ni reintentos: si falla, se pierde esa visita y la navegación sigue normal
export const trackPageView = (payload) => {
    fetch(`${BASE_URL}/analytics/pageview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true,
    }).catch(() => {})
}

export default {
    getAdminAnalyticsOverview,
    trackPageView,
}
