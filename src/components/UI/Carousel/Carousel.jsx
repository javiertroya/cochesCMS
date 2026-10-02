import { useEffect, Fragment } from "react"

import Slides from "./Slides"
import Arrows from "./Arrows"
import DotButtons from "./DotButtons"
import useCarousel from "../../../hooks/useCarousel"

const CarouselDefault = (props) => {

    // ............................
    const { slides, autoSlide = false, autoSlideInterval = 4000, className = "h-64", overlay } = props
    const moreThanOneSlide = slides.length > 1
    const { current, prev, next, goTo } = useCarousel(slides)

    // ............................
    useEffect(() => {
        if (!autoSlide || !moreThanOneSlide) return
        const slideInterval = setInterval(next, autoSlideInterval)
        return () => clearInterval(slideInterval)
    }, [autoSlide, autoSlideInterval, moreThanOneSlide, next])

    // ............................
    return (
        <div className={`overflow-hidden relative w-full ${className}`}>
            <Slides
                slides={slides}
                current={current}
            />
            {overlay}
            {
                moreThanOneSlide && (
                    <Fragment>
                        <Arrows
                            prev={prev}
                            next={next}
                        />
                        <DotButtons
                            slides={slides}
                            current={current}
                            goTo={goTo}
                        />
                    </Fragment>
                )
            }
        </div>
    )
}

export default CarouselDefault
