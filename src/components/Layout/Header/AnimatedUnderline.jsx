const AnimatedUnderline = (props) => {

    // ............................
    const { colorClass, heightClass = 'h-0.5', triggerClass = '' } = props

    // ............................
    return (
        <span className={`
            absolute bottom-0 left-1/2 -translate-x-1/2
            ${heightClass} w-0 ${colorClass}
            peer-hover:w-full ${triggerClass}
            transition-all duration-300 ease-in-out
        `} />
    )
}

export default AnimatedUnderline
