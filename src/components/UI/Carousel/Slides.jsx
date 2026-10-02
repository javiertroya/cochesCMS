const Slides = (props) => {

    // ............................
    const { current, slides } = props

    // ............................
    const renderSlide = (slide, index) => {
        const className = "h-full w-full shrink-0 object-cover"
        return slide.type === "video"
            ? <video
                key={index}
                src={slide.src}
                className={className}
                autoPlay
                muted
                loop
                playsInline
            />
            : <img
                key={index}
                src={slide.src}
                alt={slide.alt}
                className={className}
            />
    }

    // ............................
    return (
        <div
            style={{ transform: `translateX(-${current * 100}%)` }}
            className="
                flex
                h-full
                transition-transform duration-500 ease-in-out
            ">
            {
                slides.map(renderSlide)
            }
        </div>
    )
}

export default Slides