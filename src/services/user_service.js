import { get, post, setAuthTokens } from './api'

// ..............................
export const loginUser = async (credentials) => {
    const response = await post('/auth/login', credentials)
    setAuthTokens(response)
    return response
}

// ..............................
export const getCurrentUser = async () => {
    return await get('/auth/me')
}

// ..............................
export default {
    loginUser,
    getCurrentUser,
}
