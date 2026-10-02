import {
    Bookmark,
    CalendarDays,
    ExternalLink,
    Newspaper,
    Share2,
} from "lucide-react"
import { Link } from "react-router-dom"
import { Badge } from "@/components/UI/coss/badge"
import { Button } from "@/components/UI/coss/button"
import { cn } from "@/lib/utils"

const formatDate = (date) => {
    if (!date) return null

    const parsedDate = typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date)
        ? new Date(`${date}T00:00:00`)
        : new Date(date)
    if (Number.isNaN(parsedDate.getTime())) return date

    return new Intl.DateTimeFormat("es-ES", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).format(parsedDate)
}

const NewsImage = ({ article, featured }) => {
    const image = article.imageUrl ?? article.image ?? article.photo
    const title = article.title ?? article.titular

    if (image) {
        return (
            <img
                src={image}
                alt={article.imageAlt ?? article.descripcion_photo ?? title}
                className="h-full min-h-[210px] w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                loading="lazy"
            />
        )
    }

    return (
        <div className={cn(
            "flex h-full w-full items-center justify-center bg-gray-100 text-gray-400",
            featured ? "min-h-[320px]" : "min-h-[210px]"
        )}>
            <Newspaper aria-hidden="true" className="size-12" />
        </div>
    )
}

const NewsCard = ({
    article,
    featured = false,
    isBookmarked = false,
    onBookmark,
    onShare,
    readMoreLabel = "Leer noticia",
    className,
    to,
}) => {
    const articleUrl = article.url ?? article.href
    const category = article.categoryLabel ?? article.category
    const publishedDate = article.publishedAt ?? article.date ?? article.fecha_publicacion
    const publishedAt = formatDate(publishedDate)
    const source = article.source?.name ?? article.source
    const title = article.title ?? article.titular
    const description = article.description ?? article.entrada ?? article.cuerpo

    return (
        <article
            className={cn(
                "group grid overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md",
                featured ? "lg:grid-cols-[1.1fr_0.9fr]" : "grid-rows-[auto_1fr]",
                className
            )}
        >
            {to ? (
                <Link
                    to={to}
                    className={cn(
                        "block overflow-hidden bg-gray-100",
                        featured ? "min-h-[320px]" : "aspect-[16/10]"
                    )}
                    aria-label={title}
                >
                    <NewsImage article={article} featured={featured} />
                </Link>
            ) : (
                <a
                    href={articleUrl || undefined}
                    target={articleUrl ? "_blank" : undefined}
                    rel={articleUrl ? "noreferrer" : undefined}
                    className={cn(
                        "block overflow-hidden bg-gray-100",
                        featured ? "min-h-[320px]" : "aspect-[16/10]"
                    )}
                    aria-label={title}
                >
                    <NewsImage article={article} featured={featured} />
                </a>
            )}

            <div className={cn("flex min-w-0 flex-col p-5", featured && "lg:p-7")}>
                <div className="mb-3 flex flex-wrap items-center gap-2">
                    {category && (
                        <Badge variant="info" className="capitalize">
                            {category}
                        </Badge>
                    )}
                    {source && (
                        <span className="text-xs font-medium text-gray-500">
                            {source}
                        </span>
                    )}
                </div>

                <h3 className={cn(
                    "text-balance font-bold leading-tight text-gray-950",
                    featured ? "text-2xl" : "text-lg"
                )}>
                    {to ? (
                        <Link to={to} className="hover:text-brand-primary">
                            {title}
                        </Link>
                    ) : (
                        <a
                            href={articleUrl || undefined}
                            target={articleUrl ? "_blank" : undefined}
                            rel={articleUrl ? "noreferrer" : undefined}
                            className="hover:text-brand-primary"
                        >
                            {title}
                        </a>
                    )}
                </h3>

                {description && (
                    <p className={cn(
                        "mt-3 text-sm leading-6 text-gray-600",
                        featured ? "line-clamp-4" : "line-clamp-3"
                    )}>
                        {description}
                    </p>
                )}

                <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-5">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        {publishedAt && (
                            <>
                                <CalendarDays aria-hidden="true" className="size-4" />
                                <time dateTime={publishedDate}>
                                    {publishedAt}
                                </time>
                            </>
                        )}
                    </div>

                    <div className="flex items-center gap-1.5">
                        {onBookmark && (
                            <Button
                                size="icon-sm"
                                variant="outline"
                                aria-label={isBookmarked ? "Quitar de guardados" : "Guardar noticia"}
                                onClick={() => onBookmark(article)}
                            >
                                <Bookmark
                                    aria-hidden="true"
                                    className={cn(isBookmarked && "fill-brand-primary text-brand-primary opacity-100")}
                                />
                            </Button>
                        )}
                        {onShare && (
                            <Button
                                size="icon-sm"
                                variant="outline"
                                aria-label="Compartir noticia"
                                onClick={() => onShare(article)}
                            >
                                <Share2 aria-hidden="true" />
                            </Button>
                        )}
                        {articleUrl && (
                            <Button
                                size="sm"
                                render={<a href={articleUrl} target="_blank" rel="noreferrer" />}
                            >
                                {readMoreLabel}
                                <ExternalLink aria-hidden="true" />
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </article>
    )
}

export default NewsCard
