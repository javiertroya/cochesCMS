import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { usePostHog } from '@posthog/react'

import useAuth from '@/hooks/useAuth'

const PostHogRouteTracker = () => {
    const location = useLocation()
    const posthog = usePostHog()
    const { user } = useAuth()
    const identifiedUserId = useRef(null)

    useEffect(() => {
        if (!posthog || !user?.id || identifiedUserId.current === user.id) {
            return
        }

        posthog.identify(String(user.id), {
            role: user.role,
            user_type: user.user_type,
        })
        identifiedUserId.current = user.id
    }, [posthog, user])

    useEffect(() => {
        if (!posthog) {
            return
        }

        posthog.capture('$pageview', {
            $current_url: window.location.href,
            $pathname: location.pathname,
            $search: location.search,
        })
    }, [posthog, location.pathname, location.search])

    return null
}

export default PostHogRouteTracker
