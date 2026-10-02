import { Newspaper } from "lucide-react"
import { FaPencil } from "react-icons/fa6"
import { HiTrash } from "react-icons/hi2"

import NewsCard from "@/components/UI/NewsCard"
import { Button } from "@/components/UI/coss/button"
import { Spinner } from "@/components/UI/coss/spinner"

const NoticiaGrid = ({
    noticias,
    loading,
    emptyText = "No hay noticias publicadas.",
    isAdmin,
    onEdit,
    onDelete,
}) => {
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                <Spinner className="h-7 w-7 text-gray-300" />
                <p className="text-sm text-gray-400">Cargando noticias…</p>
            </div>
        )
    }

    if (noticias.length === 0) {
        return (
            <div className="flex flex-col items-center gap-3 rounded-xl bg-gray-50 py-14 text-center">
                <Newspaper className="size-8 text-gray-300" />
                <div>
                    <p className="text-sm font-semibold text-gray-700">Sin noticias</p>
                    <p className="mt-0.5 text-xs text-gray-400">{emptyText}</p>
                </div>
            </div>
        )
    }

    // ............................
    return (
        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {noticias.map((noticia) => (
                <div key={noticia.id} className="relative">
                    {isAdmin && (
                        <div className="absolute right-3 top-3 z-10 flex gap-2">
                            <Button
                                onClick={() => onEdit(noticia)}
                                className="rounded-xl border border-white/90 bg-white/90 px-2 py-1 text-sm font-semibold text-slate-800 shadow hover:bg-white"
                            >
                                <FaPencil />
                                Editar
                            </Button>
                            <Button
                                onClick={() => onDelete(noticia)}
                                className="rounded-xl border border-red-500 bg-red-600 px-2 py-1 text-sm font-semibold text-white shadow hover:bg-red-500"
                            >
                                <HiTrash />
                                Borrar
                            </Button>
                        </div>
                    )}

                    <NewsCard
                        article={noticia}
                        to={`/noticias/${noticia.id}`}
                    />
                </div>
            ))}
        </section>
    )
}

export default NoticiaGrid
