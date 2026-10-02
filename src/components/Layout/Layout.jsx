import { Outlet } from 'react-router-dom'

// ............................................................
import Header from './Header/Header'
import Footer from './Footer/Footer'

import Carousel from '../UI/Carousel/Carousel'
import BreadCrumbs from '../UI/Breadcrumbs'
import HomeHero from '../Content/Home/HomeHero'

import { useHeaderCarousel } from '../../context/HeaderCarouselContext'
import { useSiteSettings } from '@/context/SiteSettingsContext'

// ............................................................
const Layout = () => {

    // .............................
    const { slides, isHome } = useHeaderCarousel()
    const { settings } = useSiteSettings() ?? {}
    // Tema visual (Estilos → Tema del sitio). Solo afecta a la web pública, no al panel
    const theme = settings?.site_theme ?? 'classic'

    // .............................
    return (
        <div className="site-theme" data-theme={theme}>
            <Header />
            {
                slides?.length > 0 && (
                    <Carousel
                        slides={slides}
                        autoSlide={true}
                        className="h-[28rem] sm:h-[34rem] lg:h-[min(85vh,42rem)]"
                        overlay={isHome ? <HomeHero content={slides?.[0]?.hero} /> : null}
                    />
                )
            }
            <BreadCrumbs />
            <main className="min-w-0 px-page pb-10">
                <Outlet />
            </main>
            <Footer />
        </div>
    )
}

export default Layout
