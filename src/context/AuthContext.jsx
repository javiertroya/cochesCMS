import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import AuthContext from '@/context/auth-context'
import { clearAuthTokens, getAccessToken } from '@/services/api'
import { getCurrentUser, loginUser } from '@/services/user_service'

export const AuthProvider = ({ children }) => {
    const navigate = useNavigate()
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    const refreshUser = useCallback(async () => {
        const currentUser = await getCurrentUser()
        setUser(currentUser)
        return currentUser
    }, [])

    const logout = useCallback((redirect = true) => {
        clearAuthTokens()
        setUser(null)
        if (redirect) {
            navigate('/', { replace: true })
        }
    }, [navigate])

    const login = useCallback(async (credentials) => {
        const response = await loginUser(credentials)
        setUser(response.user)
        return response.user
    }, [])

    useEffect(() => {
        const loadSession = async () => {
            if (!getAccessToken()) {
                setLoading(false)
                return
            }

            try {
                await refreshUser()
            } catch {
                logout(false)
            } finally {
                setLoading(false)
            }
        }

        loadSession()
    }, [logout, refreshUser])

    useEffect(() => {
        const handleLogout = () => setUser(null)
        window.addEventListener('auth:logout', handleLogout)
        return () => window.removeEventListener('auth:logout', handleLogout)
    }, [])

    const value = useMemo(() => ({
        user,
        loading,
        login,
        logout,
        refreshUser,
    }), [user, loading, login, logout, refreshUser])

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}
