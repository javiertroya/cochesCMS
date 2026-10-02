import { Link } from 'react-router-dom'

const CmsHero = ({ title, subtitle, buttonText, buttonUrl }) => (
    <section className="py-8">
        <div className="overflow-hidden rounded-2xl bg-linear-to-br from-brand-dark to-brand-primary px-6 py-14 sm:px-10 sm:py-16">
            <div className="max-w-3xl">
                <h1 className="text-3xl font-bold leading-tight text-white sm:text-5xl">{title}</h1>
                {subtitle && <p className="mt-4 text-sm leading-7 text-white/75 sm:text-base sm:leading-8">{subtitle}</p>}
                {buttonText && buttonUrl && (
                    <Link
                        to={buttonUrl}
                        className="mt-8 inline-flex rounded-xl bg-white px-6 py-3 text-sm font-semibold text-brand-primary shadow transition hover:bg-brand-light"
                    >
                        {buttonText}
                    </Link>
                )}
            </div>
        </div>
    </section>
)

export default CmsHero
