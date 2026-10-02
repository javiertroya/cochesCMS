import { useRef, useState } from 'react'
import { Globe, Loader2, Upload, X } from 'lucide-react'

import { Button } from '@/components/UI/coss/button'
import { toastManager } from '@/components/UI/coss/toast'
import { uploadImage } from '@/services/upload_service'
import { resolveMediaUrl } from '@/utils/media'

const FaviconUploadField = ({ value, onChange, siteName = 'Mi sitio web' }) => {
    const inputRef  = useRef(null)
    const [uploading, setUploading] = useState(false)

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploading(true)
        try {
            const response = await uploadImage('favicon', file)
            onChange(response.url)
            toastManager.add({ title: 'Favicon subido', description: 'El favicon se ha actualizado correctamente.', type: 'success' })
        } catch (err) {
            toastManager.add({ title: 'Error', description: err.message || 'No se pudo subir el favicon.', type: 'error' })
        } finally {
            setUploading(false)
            e.target.value = ''
        }
    }

    const faviconSrc = value ? resolveMediaUrl(value) : null

    return (
        <div className="flex items-start gap-4">
            {/* Upload zone */}
            <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={uploading}
                className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 transition hover:border-brand-primary hover:bg-brand-primary/5 disabled:opacity-50 cursor-pointer"
            >
                {uploading ? (
                    <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                ) : faviconSrc ? (
                    <img src={faviconSrc} alt="Favicon" className="h-8 w-8 object-contain" />
                ) : (
                    <Upload className="h-5 w-5 text-gray-300" />
                )}
            </button>

            <div className="flex-1 space-y-2">
                {/* Browser tab preview */}
                <div className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs text-gray-500">
                    {faviconSrc
                        ? <img src={faviconSrc} alt="" className="h-3.5 w-3.5 object-contain" />
                        : <Globe className="h-3.5 w-3.5 text-gray-300" />
                    }
                    <span className="max-w-32 truncate">{siteName}</span>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        loading={uploading}
                        onClick={() => inputRef.current?.click()}
                    >
                        <Upload className="h-3.5 w-3.5" />
                        {value ? 'Cambiar ícono' : 'Subir ícono'}
                    </Button>
                    {value && (
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => onChange('')}
                        >
                            <X className="h-3.5 w-3.5" />
                            Quitar
                        </Button>
                    )}
                </div>

                <p className="text-xs text-gray-400">Formatos: ICO, PNG, SVG · Recomendado: 32×32 px</p>
            </div>

            <input
                ref={inputRef}
                type="file"
                accept="image/x-icon,image/png,image/svg+xml"
                className="sr-only"
                onChange={handleFileChange}
            />
        </div>
    )
}

export default FaviconUploadField
