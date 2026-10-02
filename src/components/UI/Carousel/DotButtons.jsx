const DotButtons = (props) => {

    // .............................
    const { slides, current, goTo } = props

    // .............................
    const renderDotButton = (_, index) => {
        return (
            <button
                key={index}
                onClick={() => goTo(index)}
                className={`
                    w-3 h-3
                    rounded-full
                    transition-all ${current === index ? "p-2" : "bg-opacity-50"}
                    bg-white
                `}
            />
        )
    }

    // .............................
    return (
        <div className="
            absolute bottom-3 right-0 left-0
        ">
            <div className="
                flex items-center justify-center gap-2
            ">
                {
                    slides.map(renderDotButton)
                }
            </div>
        </div>
    )
}

export default DotButtons