import { Fragment, useEffect } from "react"
import { useParams } from "react-router-dom"

import Title from "@/components/Content/Main/Title"
import NoticiaDetail from "@/components/Content/Noticias/NoticiaDetail"
import NoticiaGrid from "@/components/Content/Noticias/NoticiaGrid"
import { useBreadcrumbContext } from "@/context/BreadcrumbContext"
import useCollection from "@/hooks/useCollection"

const Noticias = () => {
    const { noticiaId } = useParams()
    const { setLabel, clearLabel } = useBreadcrumbContext()
    const { items: noticias, loading, error, load, getItem } = useCollection('noticias')

    useEffect(() => {
        load()
    }, [load])

    const selectedNoticia = noticiaId ? getItem(noticiaId) : null
    const selectedIndex = selectedNoticia
        ? noticias.findIndex((noticia) => noticia.id === selectedNoticia.id || noticia.local_id === selectedNoticia.local_id)
        : -1
    const previousNoticia = selectedIndex > 0 ? noticias[selectedIndex - 1] : null
    const nextNoticia = selectedIndex >= 0 && selectedIndex < noticias.length - 1 ? noticias[selectedIndex + 1] : null

    useEffect(() => {
        if (!noticiaId || !selectedNoticia) return
        const path = `/noticias/${noticiaId}`
        setLabel(path, selectedNoticia.titular)
        return () => clearLabel(path)
    }, [noticiaId, selectedNoticia, setLabel, clearLabel])

    return (
        <Fragment>
            <Title title="NOTICIAS" />

            {noticiaId ? (
                <NoticiaDetail
                    noticia={selectedNoticia}
                    loading={loading}
                    error={error}
                    previousNoticia={previousNoticia}
                    nextNoticia={nextNoticia}
                />
            ) : (
                <section className="my-8">
                    <NoticiaGrid
                        noticias={noticias}
                        loading={loading}
                    />
                </section>
            )}
        </Fragment>
    )
}

export default Noticias
