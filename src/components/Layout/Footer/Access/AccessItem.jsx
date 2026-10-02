const AccessItem = (props) => {

    // .............................
    const { label, icon, link } = props

    // .............................
    return (
        <a
            href={link}
            className="
                flex flex-col items-center justify-center gap-1
                text-sm sm:flex-row sm:gap-x-2 sm:text-lg
                h-full
                hover:text-white
        ">
            {
                icon.element ? <icon.source className="size-7 sm:size-10" /> : <img src={icon.source} className={icon.heightClass} />
            }
            {label}
        </a>
    )
}

export default AccessItem