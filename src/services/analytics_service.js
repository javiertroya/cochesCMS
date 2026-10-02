import { get } from '@/services/api'

export const getAdminAnalyticsOverview = (range = '30d') => {
    return get(`/admin/analytics/overview?range=${encodeURIComponent(range)}`)
}

export default {
    getAdminAnalyticsOverview,
}
