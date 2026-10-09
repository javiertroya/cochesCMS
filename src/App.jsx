import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout/Layout'
import RequireRole from './components/Auth/RequireRole'
import { AuthProvider } from './context/AuthContext'
import useAuth from './hooks/useAuth'
import { BreadcrumbProvider } from './context/BreadcrumbContext'
import { HeaderCarouselProvider } from './context/HeaderCarouselContext'
import { SiteSettingsProvider } from './context/SiteSettingsContext'
import { ToastProvider } from './components/UI/coss/toast'
import PageViewTracker from './components/Analytics/PageViewTracker'
import ScrollToTop from './components/Layout/ScrollToTop'

import AdminShell from './components/Admin/Layout/AdminShell'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminPages from './pages/admin/AdminPages'
import AdminComponents from './pages/admin/AdminComponents'
import AdminCollections from './pages/admin/AdminCollections'
import AdminMultimedia from './pages/admin/AdminMultimedia'
import AdminUsers from './pages/admin/AdminUsers'
import AdminAnalytics from './pages/admin/AdminAnalytics'
import AdminSeo from './pages/admin/AdminSeo'
import AdminMenu from './pages/admin/AdminMenu'
import AdminAuditLog from './pages/admin/AdminAuditLog'
import AdminRedirects from './pages/admin/AdminRedirects'
import AdminCarousel from './pages/admin/AdminCarousel'
import AdminStyles from './pages/admin/AdminStyles'
import AdminRequests from './pages/admin/AdminRequests'

import DynamicPage from './pages/DynamicPage'
import CollectionItemPage from './pages/CollectionItemPage'
import Noticias from './pages/Noticias'

// Secciones del panel reservadas al rol admin (los editores vuelven al inicio del panel)
const AdminOnly = ({ children }) => {
    const { user } = useAuth()
    return user?.role === 'admin' ? children : <Navigate to="/admin" replace />
}

const App = () => {
    return (
        <SiteSettingsProvider>
        <HeaderCarouselProvider>
            <BrowserRouter>
                <AuthProvider>
                    <PageViewTracker />
                    <ScrollToTop />
                    <ToastProvider>
                        <BreadcrumbProvider>
                            <Routes>
                                {/* Admin — rutas anidadas con layout compartido */}
                                <Route
                                    path="/admin"
                                    element={<RequireRole roles={['admin', 'editor']}><AdminShell /></RequireRole>}
                                >
                                    <Route index element={<AdminDashboard />} />
                                    <Route path="requests" element={<AdminRequests />} />
                                    <Route path="pages" element={<AdminPages />} />
                                    <Route path="components" element={<AdminComponents />} />
                                    <Route path="collections" element={<AdminCollections />} />
                                    <Route path="multimedia" element={<AdminMultimedia />} />
                                    <Route path="users" element={<AdminOnly><AdminUsers /></AdminOnly>} />
                                    <Route path="analytics" element={<AdminAnalytics />} />
                                    <Route path="seo" element={<AdminSeo />} />
                                    <Route path="menu" element={<AdminMenu />} />
                                    <Route path="audit-log" element={<AdminOnly><AdminAuditLog /></AdminOnly>} />
                                    <Route path="redirects" element={<AdminOnly><AdminRedirects /></AdminOnly>} />
                                    <Route path="carousel" element={<AdminCarousel />} />
                                    <Route path="styles" element={<AdminOnly><AdminStyles /></AdminOnly>} />
                                </Route>

                                {/* Sitio público */}
                                <Route element={<Layout />}>
                                    <Route path="/coleccion/:collectionSlug/:itemId" element={<CollectionItemPage />} />
                                    <Route path="/noticias/:noticiaId" element={<Noticias />} />
                                    <Route path="/*" element={<DynamicPage />} />
                                </Route>
                            </Routes>
                        </BreadcrumbProvider>
                    </ToastProvider>
                </AuthProvider>
            </BrowserRouter>
        </HeaderCarouselProvider>
        </SiteSettingsProvider>
    )
}

export default App
