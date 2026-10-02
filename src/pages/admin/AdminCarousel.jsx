import { useEffect, useState } from 'react'
import { ChevronDown, SlidersHorizontal } from 'lucide-react'

import { Button } from '@/components/UI/coss/button'
import { toastManager } from '@/components/UI/coss/toast'
import HeaderCarouselEditor from '@/components/Admin/Pages/HeaderCarouselEditor'
import { getAdminCmsPages, updateCmsPage } from '@/services/cms_service'
import AdminPageHeader from '@/components/Admin/Layout/AdminPageHeader'
import { DEFAULT_HOME_HERO } from '@/mocks/homeHero'
import { DEFAULT_HOME_SLIDE } from '@/mocks/carousel'

const AdminCarousel = () => {
    const [pages, setPages] = useState([])
    const [selectedPageId, setSelectedPageId] = useState(null)
    const [slides, setSlides] = useState([])
    const [saving, setSaving] = useState(false)
    const [dirty, setDirty] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        getAdminCmsPages()
            .then(setPages)
            .catch(() => {
                toastManager.add({ title: 'Error', description: 'No se pudieron cargar las páginas.', type: 'error' })
            })
            .finally(() => setLoading(false))
    }, [])

    const selectedPage = pages.find((p) => p.id === selectedPageId)
    const isHomePage = selectedPage?.slug === 'home'
    const homeHero = isHomePage
        ? { ...DEFAULT_HOME_HERO, ...(slides[0]?.hero ?? {}) }
        : null

    const handlePageSelect = (pageId) => {
        if (dirty && !window.confirm('Hay cambios sin guardar en los slides. ¿Descartar?')) return
        const numId = pageId ? Number(pageId) : null
        setSelectedPageId(numId)
        const page = pages.find((p) => p.id === numId)
        setSlides(page?.header_slides ?? [])
        setDirty(false)
    }

    const handleSlidesChange = (nextSlides) => {
        setSlides(nextSlides)
        setDirty(true)
    }

    const handleHomeHeroChange = (nextHero) => {
        const nextSlides = slides.length > 0
            ? slides.map((slide, index) => (index === 0 ? { ...slide, hero: nextHero } : slide))
            : [{ ...DEFAULT_HOME_SLIDE, hero: nextHero }]

        setSlides(nextSlides)
        setDirty(true)
    }

    const handleSave = async () => {
        if (!selectedPageId) return
        setSaving(true)
        try {
            await updateCmsPage(selectedPageId, { header_slides: slides })
            setPages((prev) =>
                prev.map((p) => (p.id === selectedPageId ? { ...p, header_slides: slides } : p)),
            )
            setDirty(false)
            toastManager.add({
                title: 'Guardado',
                description: 'Los slides del carrusel se han actualizado.',
                type: 'success',
            })
        } catch {
            toastManager.add({
                title: 'Error',
                description: 'No se pudieron guardar los slides.',
                type: 'error',
            })
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="h-full overflow-y-auto py-6 lg:py-8">
            <div className="space-y-6">

                <AdminPageHeader
                    icon={SlidersHorizontal}
                    title="Carrusel"
                    description="Gestiona los slides de cabecera de cada página."
                >
                    {dirty && selectedPageId && (
                        <Button onClick={handleSave} disabled={saving}>
                            {saving ? 'Guardando…' : 'Guardar slides'}
                        </Button>
                    )}
                </AdminPageHeader>

                {/* Unified card: page selector toolbar + editor */}
                <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">

                    {/* Page selector toolbar */}
                    <div className="flex flex-wrap items-center gap-3 border-b border-gray-100 bg-gray-50/60 px-5 py-3">
                        <span className="shrink-0 text-sm font-medium text-gray-600">Página</span>
                        <div className="relative">
                            <select
                                value={selectedPageId ?? ''}
                                onChange={(e) => handlePageSelect(e.target.value)}
                                disabled={loading}
                                className="h-9 appearance-none rounded-full border border-gray-200 bg-white pl-4 pr-9 text-sm text-gray-900 shadow-sm transition focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 disabled:opacity-50"
                            >
                                <option value="">Selecciona una página…</option>
                                {pages.map((p) => (
                                    <option key={p.id} value={p.id}>{p.title}</option>
                                ))}
                            </select>
                            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        </div>
                        {selectedPage && (
                            <span className="font-mono text-xs text-gray-400">/{selectedPage.slug}</span>
                        )}
                        {selectedPage && (
                            <span className="ml-auto text-xs text-gray-400">
                                {slides.length} {slides.length === 1 ? 'slide' : 'slides'}
                            </span>
                        )}
                    </div>

                    {/* Content */}
                    {!selectedPageId ? (
                        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                            <SlidersHorizontal className="h-8 w-8 text-gray-200" />
                            <p className="text-sm font-semibold text-gray-700">Selecciona una página</p>
                            <p className="max-w-xs text-xs leading-relaxed text-gray-400">
                                Elige una página en el selector para gestionar sus slides de carrusel de cabecera.
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="border-b border-gray-100 px-5 py-3.5">
                                <div className="flex items-center gap-2.5">
                                    <SlidersHorizontal className="h-4 w-4 text-brand-primary" />
                                    <span className="font-semibold text-gray-900">
                                        Slides de {selectedPage.title}
                                    </span>
                                </div>
                                <p className="mt-0.5 text-xs text-gray-400">
                                    Imágenes o vídeos que se muestran en la cabecera al entrar a esta página.
                                </p>
                            </div>
                            <HeaderCarouselEditor
                                slides={slides}
                                onChange={handleSlidesChange}
                                showHomeHeroFields={isHomePage}
                                homeHero={homeHero}
                                onHomeHeroChange={handleHomeHeroChange}
                            />
                        </>
                    )}

                </div>

            </div>
        </div>
    )
}

export default AdminCarousel
