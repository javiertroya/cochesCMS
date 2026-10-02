import { useEffect, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'

import CmsRenderer from '@/components/Cms/CmsRenderer'
import Title from '@/components/Content/Main/Title'
import { useHeaderCarousel } from '@/context/HeaderCarouselContext'
import SLIDES from '@/mocks/carousel'
import { getCmsPage } from '@/services/cms_service'

const DynamicPage = () => {
    const params = useParams()
    // params['*'] es '' para '/', normalizamos a 'home'
    const slug = params['*'] || 'home'

    const [page, setPage] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const { setCarousel } = useHeaderCarousel()

    useEffect(() => {
        let isMounted = true
        const fallbackSlides = SLIDES[slug] ?? null

        // Resetear el carousel inmediatamente al cambiar de ruta (antes del fetch)
        setCarousel(fallbackSlides, slug === 'home')

        const loadPage = async () => {
            setLoading(true)
            setError(null)

            try {
                const response = await getCmsPage(slug)

                if (isMounted) {
                    setPage(response)

                    // Si la pagina CMS tiene slides propios, sobreescribir el fallback
                    const cmsSlides = response?.header_slides?.length > 0
                        ? response.header_slides
                        : null
                    if (cmsSlides) {
                        setCarousel(cmsSlides, slug === 'home')
                    }
                }
            } catch (err) {
                if (isMounted) setError(err)
            } finally {
                if (isMounted) setLoading(false)
            }
        }

        loadPage()

        return () => {
            isMounted = false
        }
    }, [slug, setCarousel])

    if (loading) {
        return null
    }

    if (error?.message?.toLowerCase().includes('iniciar sesion')) {
        return <Navigate to="/" replace state={{ authRequired: true }} />
    }

    if (error || !page) {
        return <p className="py-8 text-gray-600">Pagina no encontrada.</p>
    }

    return (
        <>
            <Title title={page.title} />
            <CmsRenderer components={page.components} pageSlug={slug} />
        </>
    )
}

export default DynamicPage
