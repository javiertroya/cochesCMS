import { useEffect, useState } from 'react'
import { FileText, Database, Users, ImageIcon } from 'lucide-react'

import { getAdminCmsPages } from '@/services/cms_service'
import { getCollections } from '@/services/collection_service'
import { getAdminUsers } from '@/services/admin_user_service'
import { getAdminMedia } from '@/services/media_service'
import { getAdminAuditLogs } from '@/services/admin_audit_service'
import { formatBytes } from '@/utils/admin/greeting'

const useDashboardData = () => {
    const [pages,       setPages]       = useState(null)
    const [collections, setCollections] = useState(null)
    const [users,       setUsers]       = useState(null)
    const [media,       setMedia]       = useState(null)
    const [activity,    setActivity]    = useState(null)

    const [loadingPages,       setLoadingPages]       = useState(true)
    const [loadingCollections, setLoadingCollections] = useState(true)
    const [loadingUsers,       setLoadingUsers]       = useState(true)
    const [loadingMedia,       setLoadingMedia]       = useState(true)
    const [loadingActivity,    setLoadingActivity]    = useState(true)

    useEffect(() => {
        getAdminCmsPages()
            .then(setPages)
            .catch(() => setPages([]))
            .finally(() => setLoadingPages(false))
    }, [])

    useEffect(() => {
        getCollections()
            .then(setCollections)
            .catch(() => setCollections([]))
            .finally(() => setLoadingCollections(false))
    }, [])

    useEffect(() => {
        getAdminUsers()
            .then(data => setUsers({ total: data.total, pending: data.counts.inactive }))
            .catch(() => setUsers({ total: 0, pending: 0 }))
            .finally(() => setLoadingUsers(false))
    }, [])

    useEffect(() => {
        getAdminMedia()
            .then(setMedia)
            .catch(() => setMedia([]))
            .finally(() => setLoadingMedia(false))
    }, [])

    useEffect(() => {
        getAdminAuditLogs({ limit: 9 })
            .then(setActivity)
            .catch(() => setActivity([]))
            .finally(() => setLoadingActivity(false))
    }, [])

    const publishedPages   = pages?.filter((p) => p.is_published).length ?? 0
    const draftPages       = pages?.filter((p) => !p.is_published).length ?? 0
    const totalPages       = pages?.length ?? 0
    const publishedPct     = totalPages > 0 ? Math.round((publishedPages / totalPages) * 100) : 0

    const totalCollections = collections?.length ?? 0
    const totalItems       = collections?.reduce((s, c) => s + (c.item_count ?? 0), 0) ?? 0

    const totalUsers   = users?.total ?? 0
    const pendingUsers = users?.pending ?? 0

    const totalMedia   = media?.length ?? 0
    const totalBytes   = media?.reduce((s, m) => s + (m.file_size ?? 0), 0) ?? 0

    const stats = [
        {
            id:          'pages',
            label:       'Páginas',
            value:       loadingPages ? '—' : totalPages,
            sub:         !loadingPages && totalPages ? `${publishedPages} publicadas · ${draftPages} borradores` : undefined,
            icon:        FileText,
            colorBg:     'bg-indigo-50',
            colorText:   'text-indigo-600',
            colorStrong: 'bg-indigo-500',
            to:          '/admin/pages',
            loading:     loadingPages,
        },
        {
            id:          'collections',
            label:       'Colecciones',
            value:       loadingCollections ? '—' : totalCollections,
            sub:         !loadingCollections && totalItems > 0 ? `${totalItems} ítems en total` : undefined,
            icon:        Database,
            colorBg:     'bg-violet-50',
            colorText:   'text-violet-600',
            colorStrong: 'bg-violet-500',
            to:          '/admin/collections',
            loading:     loadingCollections,
        },
        {
            id:          'users',
            label:       'Usuarios',
            value:       loadingUsers ? '—' : totalUsers,
            sub:         !loadingUsers ? (pendingUsers > 0 ? `${pendingUsers} desactivado${pendingUsers > 1 ? 's' : ''}` : 'Todos activos') : undefined,
            icon:        Users,
            colorBg:     'bg-sky-50',
            colorText:   'text-sky-600',
            colorStrong: 'bg-sky-500',
            to:          '/admin/users',
            loading:     loadingUsers,
        },
        {
            id:          'media',
            label:       'Archivos',
            value:       loadingMedia ? '—' : totalMedia,
            sub:         !loadingMedia && totalBytes > 0 ? formatBytes(totalBytes) : undefined,
            icon:        ImageIcon,
            colorBg:     'bg-emerald-50',
            colorText:   'text-emerald-600',
            colorStrong: 'bg-emerald-500',
            to:          '/admin/multimedia',
            loading:     loadingMedia,
        },
    ]

    return {
        stats,
        publishedPages,
        totalPages,
        publishedPct,
        totalCollections,
        totalItems,
        pendingUsers,
        activity,
        loadingActivity,
        loading: {
            pages:       loadingPages,
            collections: loadingCollections,
            users:       loadingUsers,
            media:       loadingMedia,
        },
    }
}

export default useDashboardData
