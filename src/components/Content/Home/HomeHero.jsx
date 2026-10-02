import { Link } from "react-router-dom"
import { FaArrowRight } from "react-icons/fa"

import { DEFAULT_HOME_HERO } from "@/mocks/homeHero"

// ............................................................
const HomeHero = ({ content }) => {
    const hero = { ...DEFAULT_HOME_HERO, ...(content ?? {}) }

    return (
    <div className="absolute inset-0 flex flex-col justify-end lg:justify-center">

        <div className="site-hero-overlay pointer-events-none absolute inset-0 bg-black/25" />

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-linear-to-t from-black/35 to-transparent" />

        <div className="relative px-page pb-6 sm:pb-12 lg:pb-0">
            <div className="site-hero-card w-full max-w-2xl rounded-2xl border border-white/20 bg-black/30 p-5 shadow-2xl backdrop-blur-sm sm:p-8 xl:max-w-3xl xl:p-10">

                <p className="site-hero-eyebrow mb-3 text-xs font-semibold uppercase tracking-widest text-white/70 sm:text-sm">
                    {hero.eyebrow}
                </p>

                <h1 className="
                    site-hero-title
                    text-2xl font-extrabold leading-tight tracking-tight text-white
                    sm:text-4xl xl:text-5xl
                ">
                    {hero.title}
                </h1>

                <p className="mt-3 line-clamp-3 max-w-xl text-sm leading-6 text-white/85 sm:mt-4 sm:line-clamp-none sm:text-base sm:leading-7 xl:text-lg">
                    {hero.description}
                </p>

                <div className="mt-5 flex flex-wrap gap-3 sm:mt-8">
                    <Link
                        to={hero.primaryUrl}
                        className="
                            site-hero-primary
                            inline-flex items-center
                            h-10 rounded-lg border border-white bg-white px-4
                            text-sm font-semibold text-brand-primary shadow-sm sm:text-base
                            transition-colors hover:bg-blue-50
                        "
                    >
                        {hero.primaryLabel}
                    </Link>
                    <Link
                        to={hero.secondaryUrl}
                        className="
                            site-hero-secondary
                            inline-flex items-center gap-2
                            h-10 rounded-lg border border-white/40 px-4
                            text-sm font-medium text-white sm:text-base
                            transition-colors hover:bg-white/10
                        "
                    >
                        {hero.secondaryLabel}
                        <FaArrowRight size={12} />
                    </Link>
                </div>
            </div>
        </div>

    </div>
    )
}

export default HomeHero
