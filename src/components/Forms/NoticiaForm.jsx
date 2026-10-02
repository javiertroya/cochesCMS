import { useState } from "react"
import { ImagePlus, Trash2, UploadCloud } from "lucide-react"

import { Button } from "@/components/UI/coss/button"
import { Field, FieldError, FieldLabel } from "@/components/UI/coss/field"
import { Form } from "@/components/UI/coss/form"
import { Input } from "@/components/UI/coss/input"
import { Textarea } from "@/components/UI/coss/textarea"
import { toastManager } from "@/components/UI/coss/toast"
import { uploadImage } from "@/services/upload_service"

const normalizeImages = (data = {}) => {
    const images = Array.isArray(data.images) ? data.images : []
    const values = [...images, data.photo]
        .filter(value => typeof value === "string" && value.trim())
        .map(value => value.trim())

    return [...new Set(values)]
}

const NewsImagesUpload = ({ images, onChange }) => {
    const [uploading, setUploading] = useState(false)

    const handleUpload = async (event) => {
        const files = Array.from(event.target.files ?? [])
        if (files.length === 0) return

        setUploading(true)
        try {
            const uploaded = await Promise.all(files.map(file => uploadImage("noticias", file)))
            const nextImages = uploaded.map(item => item.url)
            onChange([...new Set([...images, ...nextImages])])
            toastManager.add({
                title: files.length > 1 ? "Imágenes subidas" : "Imagen subida",
                description: "La noticia se ha actualizado con las nuevas imágenes.",
                type: "success",
            })
        } catch (err) {
            toastManager.add({
                title: "Error al subir imágenes",
                description: err.message || "No se pudieron subir las imágenes.",
                type: "error",
            })
        } finally {
            setUploading(false)
            event.target.value = ""
        }
    }

    return (
        <div className="space-y-3">
            {images.length > 0 ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {images.map((url, index) => (
                        <div key={url} className="group relative overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                            <img src={url} alt="" className="h-28 w-full object-cover" />
                            {index === 0 && (
                                <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-semibold text-slate-700 shadow-sm">
                                    Portada
                                </span>
                            )}
                            <Button
                                type="button"
                                variant="destructive"
                                size="icon-sm"
                                className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100"
                                onClick={() => onChange(images.filter(image => image !== url))}
                                aria-label="Quitar imagen"
                            >
                                <Trash2 size={13} />
                            </Button>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-slate-200 bg-slate-50/50 p-8 text-sm text-slate-500">
                    <ImagePlus size={18} className="mr-2" />
                    Sin imágenes añadidas
                </div>
            )}

            <Button
                type="button"
                variant="outline"
                size="sm"
                loading={uploading}
                render={<label />}
            >
                <UploadCloud size={14} />
                {uploading ? "Subiendo..." : "Subir imágenes"}
                <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    multiple
                    className="sr-only"
                    onChange={handleUpload}
                />
            </Button>
        </div>
    )
}

const NoticiaForm = ({ initialData, onSubmit, onCancel }) => {
    const [images, setImages] = useState(() => normalizeImages(initialData))
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState(null)

    // ............................
    const handleSubmit = async (event) => {
        event.preventDefault()
        setError(null)
        setSubmitting(true)

        try {
            const data = Object.fromEntries(new FormData(event.target))

            data.titular = data.titular?.trim()
            data.entrada = data.entrada?.trim() || null
            data.cuerpo = data.cuerpo?.trim() || null
            data.images = images
            data.photo = images[0] ?? null
            data.descripcion_photo = data.descripcion_photo?.trim() || null

            if (!data.titular) {
                setError("El titular es obligatorio.")
                return
            }

            await onSubmit(data)
        } catch (error) {
            setError(error.message || "No se pudo guardar la noticia.")
        } finally {
            setSubmitting(false)
        }
    }

    // ............................
    return (
        <Form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
            <Field>
                <FieldLabel>Titular</FieldLabel>
                <Input
                    name="titular"
                    defaultValue={initialData?.titular ?? ""}
                    required
                />
                <FieldError>Debes introducir un titular.</FieldError>
            </Field>

            <Field>
                <FieldLabel>Entrada</FieldLabel>
                <Textarea
                    name="entrada"
                    defaultValue={initialData?.entrada ?? ""}
                    className="**:[textarea]:max-h-28 **:[textarea]:min-h-20 **:[textarea]:overflow-y-auto **:[textarea]:resize-y"
                />
            </Field>

            <Field>
                <FieldLabel>Cuerpo</FieldLabel>
                <Textarea
                    name="cuerpo"
                    defaultValue={initialData?.cuerpo ?? ""}
                    className="**:[textarea]:max-h-48 **:[textarea]:min-h-32 **:[textarea]:overflow-y-auto **:[textarea]:resize-y"
                />
            </Field>

            <Field>
                <FieldLabel>Imágenes</FieldLabel>
                <NewsImagesUpload images={images} onChange={setImages} />
            </Field>

            <Field>
                <FieldLabel>Descripción de la imagen</FieldLabel>
                <Input
                    name="descripcion_photo"
                    defaultValue={initialData?.descripcion_photo ?? ""}
                />
            </Field>

            {error && (
                <p className="text-sm text-destructive-foreground">
                    {error}
                </p>
            )}

            <div className="flex justify-end gap-3">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={submitting}
                >
                    Cancelar
                </Button>

                <Button type="submit" disabled={submitting}>
                    {submitting ? "Guardando..." : "Guardar"}
                </Button>
            </div>
        </Form>
    )
}

export default NoticiaForm
