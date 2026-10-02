import { useState } from "react"
import { ImagePlus, RefreshCw } from "lucide-react"

import { Button } from "@/components/UI/coss/button"
import { toastManager } from "@/components/UI/coss/toast"
import { uploadImage } from "@/services/upload_service"
import { IMAGE_ACCEPT } from '@/utils/media'

const ImageUploadField = ({ target, value, onChange, required = false }) => {
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState(null)

    const handleFileChange = async (event) => {
        const file = event.target.files?.[0]
        if (!file) return

        if (value) {
            const confirmed = window.confirm(
                "Vas a subir una imagen nueva. Al guardar el formulario, sustituirá a la imagen actual y la anterior se borrará del servidor. ¿Quieres continuar?"
            )
            if (!confirmed) {
                event.target.value = ""
                return
            }
        }

        setError(null)
        setUploading(true)

        try {
            const response = await uploadImage(target, file)
            onChange(response.url)
            toastManager.add({
                title: "Imagen subida",
                description: "La imagen se ha seleccionado correctamente.",
                type: "success",
            })
        } catch (err) {
            const message = err.message || "No se pudo subir la imagen."
            setError(message)
            toastManager.add({
                title: "Error al subir imagen",
                description: message,
                type: "error",
            })
        } finally {
            setUploading(false)
            event.target.value = ""
        }
    }

    return (
        <div className="space-y-2">
            {value ? (
                <div className="group relative overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                    <img
                        src={value}
                        alt="Vista previa"
                        className="mx-auto max-h-48 w-full object-contain p-2"
                    />
                    <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/50 to-transparent p-3 opacity-0 transition-opacity group-hover:opacity-100">
                        <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            loading={uploading}
                            render={<label />}
                        >
                            <RefreshCw size={14} />
                            Cambiar imagen
                            <input
                                type="file"
                                accept={IMAGE_ACCEPT}
                                className="sr-only"
                                onChange={handleFileChange}
                            />
                        </Button>
                    </div>
                </div>
            ) : (
                <label className="flex cursor-pointer flex-col items-center gap-3 rounded-lg border-2 border-dashed border-slate-200 bg-slate-50/50 p-8 text-center transition-colors hover:border-slate-300 hover:bg-slate-50">
                    <div className="flex size-10 items-center justify-center rounded-full bg-slate-100">
                        <ImagePlus className="size-5 text-slate-500" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-700">
                            {uploading ? "Subiendo imagen…" : "Haz clic para añadir una imagen"}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-400">PNG, JPEG o WebP</p>
                    </div>
                    <input
                        type="file"
                        accept={IMAGE_ACCEPT}
                        className="sr-only"
                        required={required && !value}
                        onChange={handleFileChange}
                    />
                </label>
            )}
            {error && <p className="text-sm text-destructive-foreground">{error}</p>}
        </div>
    )
}

export default ImageUploadField
