import { Link } from 'react-router-dom'

const CmsImageText = ({ imageUrl, imageAlt = '', imagePosition = 'left', title, text, buttonText, buttonUrl }) => {
    const img = imageUrl ? (
        <div className="overflow-hidden rounded-2xl">
            <img src={imageUrl} alt={imageAlt} className="h-72 w-full object-cover md:h-full" />
        </div>
    ) : (
        <div className="flex h-64 items-center justify-center rounded-2xl bg-gray-100 text-gray-400 text-sm">
            Sin imagen
        </div>
    )

    const content = (
        <div className="flex flex-col justify-center gap-4">
            {title && <h2 className="text-2xl font-bold text-brand-dark">{title}</h2>}
            {text && (
                <div className="space-y-3 text-base leading-8 text-gray-600">
                    {String(text).split('\n').filter(Boolean).map((line, i) => <p key={i}>{line}</p>)}
                </div>
            )}
            {buttonText && buttonUrl && (
                <Link to={buttonUrl} className="w-fit rounded-lg bg-brand-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-submit-hover">
                    {buttonText}
                </Link>
            )}
        </div>
    )

    return (
        <section className="py-8">
            <div className="grid items-center gap-8 md:grid-cols-2">
                {imagePosition === 'left' ? <>{img}{content}</> : <>{content}<div className="md:order-none">{img}</div></>}
            </div>
        </section>
    )
}

export default CmsImageText
