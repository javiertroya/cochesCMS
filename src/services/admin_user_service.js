import { del, get, post, put } from './api'

// ..............................
export const getAdminUsers = ({ page = 1, limit = 8, filter = 'all', search = '' } = {}) => {
    const params = new URLSearchParams()
    params.set('page', String(page))
    params.set('size', String(limit))
    if (filter !== 'all') params.set('filter', filter)
    if (search) params.set('search', search)
    const query = params.toString()
    return get(`/admin/users${query ? `?${query}` : ''}`)
}

// ..............................
export const createAdminUser = (data) => post('/admin/users', data)

// ..............................
export const updateAdminUser = (userId, data) => put(`/admin/users/${userId}`, data)

// ..............................
export const deleteAdminUser = (userId) => del(`/admin/users/${userId}`)
