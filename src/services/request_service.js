import { del, get, patch, post, upload } from './api'

// ..............................
// Público: envío del componente "Formulario completo"
export const submitFullFormRequest = async (payload) => {
    return await post('/requests', payload)
}

// ..............................
// Público: importación a la carta · opción 1 (búscame un coche)
export const submitImportSearchRequest = async (payload) => {
    return await post('/requests/import-search', payload)
}

// ..............................
// Público: importación a la carta · opción 2 (ya lo he encontrado), con capturas opcionales
export const submitImportFoundRequest = async (payload, files = []) => {
    const formData = new FormData()
    formData.append('data', JSON.stringify(payload))
    files.forEach((file) => formData.append('files', file))
    return await upload('/requests/import-found', formData)
}

// ..............................
// Panel
export const getAdminRequests = async ({ status, type, search } = {}) => {
    const params = new URLSearchParams()
    if (status) params.set('status', status)
    if (type) params.set('type', type)
    if (search) params.set('search', search)
    const query = params.toString()
    return await get(`/admin/requests${query ? `?${query}` : ''}`)
}

export const updateAdminRequestStatus = async (requestId, status) => {
    return await patch(`/admin/requests/${requestId}`, { status })
}

export const deleteAdminRequest = async (requestId) => {
    return await del(`/admin/requests/${requestId}`)
}

export default {
    submitFullFormRequest,
    submitImportSearchRequest,
    submitImportFoundRequest,
    getAdminRequests,
    updateAdminRequestStatus,
    deleteAdminRequest,
}
