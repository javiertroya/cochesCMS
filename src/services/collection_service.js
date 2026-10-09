import { del, get, post, put } from './api'

// ── Colecciones (admin) ──────────────────────────────────────────────────────
export const getCollections = () => get('/admin/collections')
export const createCollection = (data) => post('/admin/collections', data)
export const deleteCollection = (id) => del(`/admin/collections/${id}`)

// ── Items (admin) ─────────────────────────────────────────────────────────────
export const getCollectionItems = (collectionId) => get(`/admin/collections/${collectionId}/items`)
export const createCollectionItem = (collectionId, data) => post(`/admin/collections/${collectionId}/items`, { data })
export const updateCollectionItem = (collectionId, itemId, data) => put(`/admin/collections/${collectionId}/items/${itemId}`, { data })
export const deleteCollectionItem = (collectionId, itemId) => del(`/admin/collections/${collectionId}/items/${itemId}`)

// ── Público: colección por slug (para selectores de relación) ─────────────────
export const getPublicCollectionBySlug = (slug) => get(`/collections/${slug}`)
