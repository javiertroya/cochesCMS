import { del, get, patch, post } from './api'

// ..............................
export const getAdminMedia = () => get('/admin/media')

// ..............................
export const deleteAdminMedia = (id) => del(`/admin/media/${id}`)

// ..............................
export const updateMedia = (id, data) => patch(`/admin/media/${id}`, data)

// ..............................
export const clearMediaCategory = (id) => patch(`/admin/media/${id}/category/clear`, {})

// ..............................
export const getMediaReferences = (id) => get(`/admin/media/${id}/references`)

// ..............................
export const getMediaCategories = () => get('/admin/media/categories')

// ..............................
export const createMediaCategory = (data) => post('/admin/media/categories', data)

// ..............................
export const updateMediaCategory = (id, data) => patch(`/admin/media/categories/${id}`, data)

// ..............................
export const deleteMediaCategory = (id) => del(`/admin/media/categories/${id}`)

// ..............................
export default {
    getAdminMedia,
    deleteAdminMedia,
    updateMedia,
    clearMediaCategory,
    getMediaReferences,
    getMediaCategories,
    createMediaCategory,
    updateMediaCategory,
    deleteMediaCategory,
}
