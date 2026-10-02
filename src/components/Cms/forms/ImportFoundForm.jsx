import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { ImagePlus, X } from 'lucide-react'

import { ContactFields, Field, FormField, Honeypot, SubmitRow, SuccessState } from './FormControls'
import useRequestForm, { CONTACT_INITIAL, validateContact } from './useRequestForm'
import { submitImportFoundRequest } from '@/services/request_service'

const CURRENT_YEAR = new Date().getFullYear()
const MAX_FILES = 5
const MAX_FILE_MB = 10
const ACCEPTED = 'image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif'

const COUNTRY_OPTIONS = [
    { value: '', label: 'Selecciona…' },
    { value: 'alemania', label: 'Alemania' },
    { value: 'belgica', label: 'Bélgica' },
    { value: 'paises_bajos', label: 'Países Bajos' },
    { value: 'francia', label: 'Francia' },
    { value: 'italia', label: 'Italia' },
    { value: 'otro', label: 'Otro' },
]

const SELLER_OPTIONS = [
    { value: '', label: 'Selecciona…' },
    { value: 'concesionario', label: 'Concesionario' },
    { value: 'particular', label: 'Particular' },
    { value: 'no_lo_se', label: 'No lo sé' },
]

const INITIAL = {
    ...CONTACT_INITIAL,
    listing_url: '', brand: '', model: '',
    year: '', km: '', listing_price: '', country: '', seller_type: '', comments: '',
}

const toInt = (value) => {
    const digits = String(value ?? '').replace(/\D/g, '')
    return digits ? Number(digits) : null
}

const validate = (values) => {
    const errors = validateContact(values)
    if (!/^https?:\/\/\S+\.\S+/i.test(values.listing_url.trim())) {
        errors.listing_url = 'Pega el enlace completo del anuncio (empieza por http)'
    }
    if (!values.brand.trim()) errors.brand = 'Indica la marca'
    if (!values.model.trim()) errors.model = 'Indica el modelo'
    const year = toInt(values.year)
    if (values.year && (!year || year < 1990 || year > CURRENT_YEAR + 1)) errors.year = `Año entre 1990 y ${CURRENT_YEAR + 1}`
    return errors
}

// Selector de capturas con miniaturas
const ScreenshotPicker = ({ id, files, onChange, error }) => {
    const inputRef = useRef(null)
    const [previews, setPreviews] = useState([])

    useEffect(() => {
        const urls = files.map((file) => URL.createObjectURL(file))
        setPreviews(urls)
        return () => urls.forEach((url) => URL.revokeObjectURL(url))
    }, [files])

    const addFiles = (event) => {
        const picked = Array.from(event.target.files ?? [])
        event.target.value = ''
        onChange([...files, ...picked].slice(0, MAX_FILES))
    }

    return (
        <FormField
            id={id}
            label="Capturas del anuncio (opcional)"
            hint={`Hasta ${MAX_FILES} imágenes de ${MAX_FILE_MB} MB. Útiles por si el anuncio desaparece.`}
            error={error}
        >
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
                {previews.map((url, index) => (
                    <div key={url} className="group relative aspect-square overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                        <img src={url} alt={`Captura ${index + 1}`} className="h-full w-full object-cover" />
                        <button
                            type="button"
                            onClick={() => onChange(files.filter((_, i) => i !== index))}
                            className="absolute right-1 top-1 flex size-7 items-center justify-center rounded-full bg-gray-900/70 text-white transition hover:bg-gray-900"
                            aria-label={`Quitar captura ${index + 1}`}
                        >
                            <X className="size-4" />
                        </button>
                    </div>
                ))}
                {files.length < MAX_FILES && (
                    <button
                        type="button"
                        id={id}
                        onClick={() => inputRef.current?.click()}
                        aria-describedby={error ? `${id}-error` : undefined}
                        className={`flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed text-xs font-medium transition ${
                            error ? 'border-red-300 text-red-500' : 'border-gray-200 text-gray-400 hover:border-brand-primary hover:text-brand-primary'
                        }`}
                    >
                        <ImagePlus className="size-6" />
                        Añadir
                    </button>
                )}
            </div>
            <input ref={inputRef} type="file" accept={ACCEPTED} multiple className="hidden" onChange={addFiles} tabIndex={-1} />
        </FormField>
    )
}

const ImportFoundForm = ({ buttonText, successMessage }) => {
    const { pathname } = useLocation()
    const [files, setFiles] = useState([])
    const [filesError, setFilesError] = useState('')

    const form = useRequestForm({
        initialValues: INITIAL,
        validate: (values) => {
            const errors = validate(values)
            const tooBig = files.find((file) => file.size > MAX_FILE_MB * 1024 * 1024)
            setFilesError(tooBig ? `«${tooBig.name}» pesa más de ${MAX_FILE_MB} MB` : '')
            if (tooBig) errors.files = true
            return errors
        },
        submit: async (values) => {
            await submitImportFoundRequest({
                name: values.name.trim(),
                phone: values.phone.trim(),
                email: values.email.trim(),
                listing_url: values.listing_url.trim(),
                brand: values.brand.trim(),
                model: values.model.trim(),
                year: toInt(values.year),
                km: toInt(values.km),
                listing_price: toInt(values.listing_price),
                country: values.country || null,
                seller_type: values.seller_type || null,
                comments: values.comments.trim(),
                website: values.website,
                source_page: pathname,
            }, files)
            setFiles([])
        },
    })

    const handleFilesChange = (next) => {
        setFiles(next)
        setFilesError('')
    }

    if (form.status === 'sent') return <SuccessState message={successMessage} onReset={form.reset} />

    return (
        <form onSubmit={form.handleSubmit} noValidate className="space-y-8">
            <fieldset className="space-y-5">
                <legend className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-400">Tus datos</legend>
                <ContactFields form={form} />
            </fieldset>

            <fieldset className="space-y-5">
                <legend className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-400">El coche que has encontrado</legend>
                <div className="grid gap-5 sm:grid-cols-2">
                    <Field
                        form={form}
                        name="listing_url"
                        label="Enlace del anuncio"
                        required
                        type="url"
                        inputMode="url"
                        placeholder="https://www.mobile.de/…"
                        maxLength={1000}
                        className="sm:col-span-2"
                    />
                    <Field form={form} name="brand" label="Marca" required placeholder="Ej. Audi" maxLength={80} />
                    <Field form={form} name="model" label="Modelo" required placeholder="Ej. A4 Avant" maxLength={80} />
                    <Field form={form} name="year" label="Año" inputMode="numeric" placeholder={`Ej. ${CURRENT_YEAR - 2}`} maxLength={4} />
                    <Field form={form} name="km" label="Kilómetros" inputMode="numeric" placeholder="Ej. 35000" maxLength={7} />
                    <Field form={form} name="listing_price" label="Precio del anuncio (€)" inputMode="numeric" placeholder="Ej. 31900" maxLength={8} />
                    <Field form={form} as="select" name="country" label="País donde está" options={COUNTRY_OPTIONS} />
                    <Field form={form} as="select" name="seller_type" label="¿Quién lo vende?" options={SELLER_OPTIONS} className="sm:col-span-2" />
                    <div className="sm:col-span-2">
                        <ScreenshotPicker id={form.fieldId('files')} files={files} onChange={handleFilesChange} error={filesError} />
                    </div>
                    <Field form={form} as="textarea" name="comments" label="Comentarios" placeholder="Dudas, extras que quieras revisar, plazos…" maxLength={3000} className="sm:col-span-2" />
                </div>
            </fieldset>

            <Honeypot form={form} />
            <SubmitRow form={form} label={buttonText} />
        </form>
    )
}

export default ImportFoundForm
