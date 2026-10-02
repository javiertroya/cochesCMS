import { Link } from "react-router-dom"
import { Button } from "@/components/UI/coss/button"
import { FaPencil } from "react-icons/fa6"
import { HiTrash } from "react-icons/hi2"

const ProfileCard = (props) => {

    // ............................
    const { title, subtitle, source, alt, info, to, actions, icon, onEdit, onDelete } = props

    // ............................
    const content = (
        <div className="
            flex h-full flex-col
            items-center justify-start
        ">
            <div className="
                overflow-hidden
                m-2 rounded-xl
                w-[calc(100%-1rem)]
            ">
                {source ? (
                    <img
                        src={source}
                        alt={alt || title}
                        loading="lazy"
                        className="
                            aspect-square object-cover h-80
                            transition-transform duration-500
                            group-hover:scale-105
                    "/>
                ) : (
                    <div className="
                        flex items-center justify-center h-80
                        bg-slate-50
                        transition-colors duration-300
                        group-hover:bg-blue-50
                    ">
                        {icon}
                    </div>
                )}
            </div>

            <div className="
                h-max w-full rounded
                px-3 py-2 text-center
            ">
                <h2 className="
                    font-sans text-lg font-bold antialiased
                    text-slate-800
                    transition-colors duration-300
                    group-hover:text-blue-600
                    md:text-xl lg:text-2xl
                ">
                    {title}
                </h2>
                {
                    subtitle && (
                        <p className="
                            my-1
                            font-sans text-base antialiased
                            text-slate-600
                        ">
                            {subtitle}
                        </p>
                    )
                }
            </div>
        </div>
    )

    // ............................
    return (
        <article
            className="
                group relative
                w-full max-w-xs
                overflow-hidden rounded-2xl
                border border-slate-200 bg-white
                shadow-lg shadow-slate-950/5
                transition-all duration-300
                hover:-translate-y-1
                hover:shadow-xl hover:shadow-slate-950/10
                hover:ring-4 hover:ring-blue-300/40
            ">
            {(actions || onEdit || onDelete) && (
                <div className="absolute right-3 top-3 z-10 flex gap-2">
                    {actions}
                    {onEdit && (
                        <Button
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEdit() }}
                            className="rounded-xl border border-white/90 bg-white/90 hover:bg-white/100 px-2 py-1 text-sm font-semibold text-slate-800 shadow"
                        >
                            <FaPencil />
                            Editar
                        </Button>
                    )}
                    {onDelete && (
                        <Button
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete() }}
                            className="rounded-xl border border-red-500 bg-red-600 hover:bg-red-500 px-2 py-1 text-sm font-semibold text-white shadow"
                        >
                            <HiTrash />
                            Borrar
                        </Button>
                    )}
                </div>
            )}
            {to ? (
                <Link to={to}>
                    {content}
                </Link>
            ) : info ? (
                <a href={info} target="_blank" rel="noopener noreferrer">
                    {content}
                </a>
            ) : (
                content
            )}
        </article>
    )
}

export default ProfileCard
