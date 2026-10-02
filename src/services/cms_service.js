import { del, get, post, put } from './api'

export const getCmsPage = async (slug) => {
    return await get(`/cms/pages/${slug}`)
}

export const getCmsPageOptional = async (slug) => {
    try {
        return await getCmsPage(slug)
    } catch {
        return null
    }
}

export const getCmsNavPages = async () => {
    return await get('/cms/nav-pages')
}

export const getAdminCmsPages = async () => {
    return await get('/admin/cms/pages')
}

export const createCmsPage = async (page) => {
    return await post('/admin/cms/pages', page)
}

export const updateCmsPage = async (pageId, page) => {
    return await put(`/admin/cms/pages/${pageId}`, page)
}

export const deleteCmsPage = async (pageId) => {
    return await del(`/admin/cms/pages/${pageId}`)
}

export const getCmsComponentTypes = async () => {
    return await get('/admin/cms/component-types')
}

export default {
    getCmsPage,
    getCmsPageOptional,
    getCmsNavPages,
    getAdminCmsPages,
    createCmsPage,
    updateCmsPage,
    deleteCmsPage,
    getCmsComponentTypes,
}
