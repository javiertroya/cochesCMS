import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

// Al cambiar de página se empieza arriba. Si la URL lleva ancla (#seccion) se respeta
const ScrollToTop = () => {
    const { pathname, hash } = useLocation()

    useEffect(() => {
        if (hash) return
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    }, [pathname, hash])

    return null
}

export default ScrollToTop
