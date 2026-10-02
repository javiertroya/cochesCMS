import { del, get, post, put } from './api'

export const getAdminRedirects = async () => {
    return await get('/admin/redirects')
}

export const createAdminRedirect = async (redirect) => {
    return await post('/admin/redirects', redirect)
}

export const updateAdminRedirect = async (redirectId, redirect) => {
    return await put(`/admin/redirects/${redirectId}`, redirect)
}

export const deleteAdminRedirect = async (redirectId) => {
    return await del(`/admin/redirects/${redirectId}`)
}

export default {
    getAdminRedirects,
    createAdminRedirect,
    updateAdminRedirect,
    deleteAdminRedirect,
}
