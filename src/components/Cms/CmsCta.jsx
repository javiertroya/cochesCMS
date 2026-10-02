import { Link } from 'react-router-dom'

const CmsCta = ({ title, text, buttonText, buttonUrl }) => (
    <section className="py-8">
        <div className="site-cms-hero overflow-hidden rounded-2xl bg-linear-to-r from-brand-dark to-brand-primary px-8 py-10">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div>
                    {title && <h2 className="text-2xl font-bold text-white">{title}</h2>}
                    {text && <p className="mt-2 text-sm leading-relaxed text-white/75">{text}</p>}
                </div>
                {buttonText && buttonUrl && (
                    <Link
                        to={buttonUrl}
                        className="site-cms-hero-button shrink-0 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-brand-primary shadow transition hover:bg-brand-light"
                    >
                        {buttonText}
                    </Link>
                )}
            </div>
        </div>
    </section>
)

export default CmsCta
