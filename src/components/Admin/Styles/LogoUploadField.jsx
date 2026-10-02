import { useRef, useState } from 'react'
import { Loader2, Upload, X } from 'lucide-react'

import { Button } from '@/components/UI/coss/button'
import { toastManager } from '@/components/UI/coss/toast'
import { uploadImage } from '@/services/upload_service'
import { resolveMediaUrl } from '@/utils/media'

const LogoUploadField = ({ value, onChange, siteName = 'Mi sitio web' }) => {
    const inputRef = useRef(null)
    const [uploading, setUploading] = useState(false)
    const logoSrc = resolveMediaUrl(value)

    const handleFileChange = async (event) => {
        const file = event.target.files?.[0]
        if (!file) return

        setUploading(true)
        try {
            const response = await uploadImage('logo', file)
            onChange(response.url)
            toastManager.add({ title: 'Logo subido', description: 'El logo del header se ha actualizado.', type: 'success' })
        } catch (err) {
            toastManager.add({ title: 'Error', description: err.message || 'No se pudo subir el logo.', type: 'error' })
        } finally {
            setUploading(false)
            event.target.value = ''
        }
    }

    return (
        <div className="flex items-start gap-4">
            <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={uploading}
                className="flex h-20 w-36 shrink-0 items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 p-3 transition hover:border-brand-primary hover:bg-brand-primary/5 disabled:opacity-50"
            >
                {uploading ? (
                    <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                ) : logoSrc ? (
                    <img src={logoSrc} alt={siteName} className="max-h-full max-w-full object-contain" />
                ) : (
                    <Upload className="h-5 w-5 text-gray-300" />
                )}
            </button>

            <div className="flex-1 space-y-2">
                <div className="rounded-lg border border-gray-200 bg-white px-4 py-3">
                    {logoSrc ? (
                        <img src={logoSrc} alt={siteName} className="h-10 w-auto object-contain" />
                    ) : (
                        <span className="text-xl font-extrabold tracking-tight text-brand-primary">{siteName}</span>
                    )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <Button type="button" variant="outline" size="sm" loading={uploading} onClick={() => inputRef.current?.click()}>
                        <Upload className="h-3.5 w-3.5" />
                        {value ? 'Cambiar logo' : 'Subir logo'}
                    </Button>
                    {value && (
                        <Button type="button" variant="outline" size="sm" onClick={() => onChange('')}>
                            <X className="h-3.5 w-3.5" />
                            Quitar
                        </Button>
                    )}
                </div>

                <p className="text-xs text-gray-400">Formatos: SVG, PNG, JPG, WEBP · Recomendado: logo horizontal con fondo transparente.</p>
            </div>

            <input
                ref={inputRef}
                type="file"
                accept="image/svg+xml,image/png,image/jpeg,image/webp"
                className="sr-only"
                onChange={handleFileChange}
            />
        </div>
    )
}

export default LogoUploadField
