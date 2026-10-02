import SOCIALS from "../../../../mocks/socials"

const Socials = () => {

    // .............................
    const renderSocial = (social) => {
        const Icon = social.icon
        return (
            <a
                key={social.id}
                href={social.link}
                aria-label={social.label}
                className="
                    flex items-center justify-center
                    w-10 h-10
                    rounded-full
                    border-white border-2
                    hover:text-white
            ">
                <Icon size={20} />
            </a>
        )
    }

    // .............................
    return (
        <div className="
            flex items-center gap-x-3 pt-4
        ">
            {
                SOCIALS.map(renderSocial)
            }
        </div>
    )
}

export default Socials