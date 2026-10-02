import { useState } from "react"

// .............................................................
const useCarousel = (items) => {

    // .............................
    const [current, setCurrent] = useState(0)

    // .............................
    const prev = () => setCurrent((c) => (c === 0 ? items.length - 1 : c - 1))
    const next = () => setCurrent((c) => (c === items.length - 1 ? 0 : c + 1))
    const goTo = (index) => setCurrent(index)

    // .............................
    return { current, prev, next, goTo }
}

export default useCarousel