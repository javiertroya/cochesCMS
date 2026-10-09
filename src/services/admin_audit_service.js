import { get } from './api'

export const getAdminAuditLogs = async ({ action, resourceType, search, limit = 100 } = {}) => {
    const params = new URLSearchParams()

    if (action) params.set('action', action)
    if (resourceType) params.set('resource_type', resourceType)
    if (search) params.set('search', search)
    if (limit) params.set('limit', String(limit))

    const query = params.toString()
    return await get(`/admin/audit-logs${query ? `?${query}` : ''}`)
}
