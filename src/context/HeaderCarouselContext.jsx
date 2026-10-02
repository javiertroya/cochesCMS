import { createContext, useCallback, useContext, useState } from 'react'

// ............................................................................
const HeaderCarouselContext = createContext({
    slides: null,
    isHome: false,
    setCarousel: () => {},
})

// ............................................................................
export function HeaderCarouselProvider({ children }) {
    const [state, setState] = useState({ slides: null, isHome: false })

    const setCarousel = useCallback((slides, isHome) => {
        setState({ slides, isHome })
    }, [])

    return (
        <HeaderCarouselContext value={{ ...state, setCarousel }}>
            {children}
        </HeaderCarouselContext>
    )
}

// ............................................................................
export const useHeaderCarousel = () => useContext(HeaderCarouselContext)

export default HeaderCarouselContext
