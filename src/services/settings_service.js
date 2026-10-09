import { get, put } from './api'

export const getSettings = () => get('/admin/settings')
export const getPublicSettings = () => get('/settings')
export const updateSettings = (data) => put('/admin/settings', data)
