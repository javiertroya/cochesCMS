import { Navigate, Outlet, useLocation } from 'react-router-dom'

import useAuth from '@/hooks/useAuth'

const RequireAuth = ({ children }) => {
    const { user, loading } = useAuth()
    const location = useLocation()

    if (loading) {
        return null
    }

    if (!user) {
        return (
            <Navigate
                to="/"
                replace
                state={{ authRequired: true, from: location }}
            />
        )
    }

    return children ?? <Outlet />
}

export default RequireAuth
