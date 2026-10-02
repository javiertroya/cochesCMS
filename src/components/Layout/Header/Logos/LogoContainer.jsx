const LogoContainer = ({ logos, className = '' }) => {

    const renderLogo = (logo) => {
        if (logo.text) {
            return (
                <span key={logo.id} className="text-xl font-extrabold tracking-tight text-brand-primary lg:text-2xl">
                    {logo.text}
                </span>
            )
        }

        return <img
            className="h-full"
            key={logo.id}
            src={logo.source}
            alt={logo.alt}
        />
    }

    // .............................
    return (
        <div className={`flex items-center gap-x-2 h-8 lg:h-14 ${className}`}>
            {
                logos.map(renderLogo)
            }
        </div>
    )
}

export default LogoContainer
