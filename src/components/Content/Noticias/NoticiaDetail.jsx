import { useState } from "react"
import { Link } from "react-router-dom"
import { Loader } from "react-loaders"
import { FaArrowLeft } from "react-icons/fa6"
import { ChevronLeft, ChevronRight, Newspaper, User } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/UI/coss/avatar"
import { Button } from "@/components/UI/coss/button"

const formatDate = (date) => {
    if (!date) return null

    const parsedDate = typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date)
        ? new Date(`${date}T00:00:00`)
        : new Date(date)
    if (Number.isNaN(parsedDate.getTime())) return date

    return new Intl.DateTimeFormat("es-ES", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    }).format(parsedDate)
}

const getNewsImages = (noticia) => {
    if (!noticia) return []

    const images = Array.isArray(noticia.images) ? noticia.images : []
    const values = [...images, noticia.photo]
        .filter(value => typeof value === "string" && value.trim())
        .map(value => value.trim())

    return [...new Set(values)]
}

const NoticiaImageCarousel = ({ images, alt }) => {
    const [current, setCurrent] = useState(0)
    const hasMultipleImages = images.length > 1

    const goToPrevious = () => {
        setCurrent((value) => value === 0 ? images.length - 1 : value - 1)
    }

    const goToNext = () => {
        setCurrent((value) => value === images.length - 1 ? 0 : value + 1)
    }

    if (images.length === 0) {
        return (
            <div className="flex min-h-80 items-center justify-center bg-slate-50 text-slate-300">
                <Newspaper aria-hidden="true" className="size-16" />
            </div>
        )
    }

    return (
        <div className="relative bg-slate-50">
            <img
                src={images[current]}
                alt={alt}
                className="max-h-[65vh] min-h-80 w-full object-contain"
            />

            {hasMultipleImages && (
                <>
                    <Button
                        type="button"
                        variant="secondary"
                        size="icon"
                        className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 shadow-md hover:bg-white"
                        onClick={goToPrevious}
                        aria-label="Imagen anterior"
                    >
                        <ChevronLeft size={20} />
                    </Button>
                    <Button
                        type="button"
                        variant="secondary"
                        size="icon"
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 shadow-md hover:bg-white"
                        onClick={goToNext}
                        aria-label="Imagen siguiente"
                    >
                        <ChevronRight size={20} />
                    </Button>
                    <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2 rounded-full bg-slate-900/55 px-3 py-2">
                        {images.map((image, index) => (
                            <button
                                key={image}
                                type="button"
                                className={`size-2.5 rounded-full transition ${index === current ? "bg-white" : "bg-white/45 hover:bg-white/70"}`}
                                onClick={() => setCurrent(index)}
                                aria-label={`Ver imagen ${index + 1}`}
                                aria-current={index === current}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}

const getNewsPath = (noticia) => `/noticias/${noticia.id ?? noticia.local_id}`

const ArticleNavigationArrow = ({ noticia, direction }) => {
    if (!noticia) return null

    const isPrevious = direction === "previous"
    const Icon = isPrevious ? ChevronLeft : ChevronRight
    const label = isPrevious ? "Noticia anterior" : "Noticia siguiente"

    return (
        <Link
            to={getNewsPath(noticia)}
            className={`fixed top-1/2 z-30 flex -translate-y-1/2 rounded-full border border-slate-200 bg-white/95 p-2 text-slate-700 shadow-lg transition hover:border-brand-primary hover:bg-white hover:text-brand-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40 sm:p-3 ${isPrevious ? "left-2 sm:left-4 xl:left-8" : "right-2 sm:right-4 xl:right-8"}`}
            aria-label={`${label}: ${noticia.titular ?? "noticia"}`}
            title={noticia.titular}
        >
            <Icon aria-hidden="true" className="size-5 sm:size-7" />
        </Link>
    )
}

const NoticiaDetail = ({ noticia, loading, error, previousNoticia, nextNoticia }) => {
    const publishedAt = formatDate(noticia?.fecha_publicacion)
    const authorName = noticia?.autor_name ?? noticia?.autor?.name ?? "Redacción"
    const authorInitial = authorName.charAt(0).toUpperCase()
    const images = getNewsImages(noticia)

    return (
        <section className="my-8">
            {loading && (
                <Loader type="ball-grid-pulse" className="flex items-center justify-center" />
            )}

            {error && (
                <p className="my-6 text-destructive-foreground">{error}</p>
            )}

            {noticia && (
                <>
                    <ArticleNavigationArrow noticia={previousNoticia} direction="previous" />
                    <ArticleNavigationArrow noticia={nextNoticia} direction="next" />

                    <article className="mx-auto max-w-5xl">
                        <Link
                            to="/noticias"
                            className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-brand-primary hover:text-submit-hover"
                        >
                            <FaArrowLeft className="size-3.5" />
                            Volver a noticias
                        </Link>

                        <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
                            {noticia.titular}
                        </h1>

                        {noticia.entrada && (
                            <p className="mt-4 text-lg leading-8 text-slate-600">
                                {noticia.entrada}
                            </p>
                        )}

                        <div className="mt-8 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                            <NoticiaImageCarousel
                                images={images}
                                alt={noticia.descripcion_photo || noticia.titular}
                            />
                        </div>

                        {noticia.descripcion_photo && (
                            <p className="mt-3 text-center text-sm italic text-slate-500">
                                {noticia.descripcion_photo}
                            </p>
                        )}

                        <div className="mt-6 flex items-center gap-3 border-y border-slate-200 py-4">
                            <Avatar className="size-10 border border-slate-200 bg-brand-light text-brand-primary">
                                <AvatarFallback>
                                    {authorInitial || <User aria-hidden="true" className="size-5" />}
                                </AvatarFallback>
                            </Avatar>

                            <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-slate-900">
                                    {authorName}
                                </p>
                                {publishedAt && (
                                    <p className="text-sm text-slate-500">
                                        {publishedAt}
                                    </p>
                                )}
                            </div>
                        </div>

                        {noticia.cuerpo && (
                            <div className="mt-8 whitespace-pre-line text-base leading-8 text-slate-700 text-justify">
                                {noticia.cuerpo}
                            </div>
                        )}
                    </article>
                </>
            )}
        </section>
    )
}

export default NoticiaDetail
