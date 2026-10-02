import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom'

import AuthModal from '@/components/Content/Auth/AuthModal'
import useAuth from '@/hooks/useAuth'

const RequireRole = ({ roles = [], children }) => {
    const { user, loading } = useAuth()
    const location = useLocation()
    const navigate = useNavigate()

    if (loading) {
        return null
    }

    if (!user) {
        if (location.pathname.startsWith('/admin')) {
            return (
                <AuthModal
                    type="login"
                    authRequired
                    onClose={() => navigate('/')}
                    onSuccess={() => {}}
                    onChangeType={() => {}}
                />
            )
        }

        return <Navigate to="/" replace state={{ authRequired: true, from: location }} />
    }

    if (roles.length > 0 && !roles.includes(user.role)) {
        return <Navigate to="/" replace />
    }

    return children ?? <Outlet />
}

export default RequireRole
