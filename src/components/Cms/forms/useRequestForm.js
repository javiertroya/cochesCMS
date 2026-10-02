import { useId, useState } from 'react'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Validaciones de los datos de contacto (las mismas que en el backend)
export const validateContact = (values) => {
    const errors = {}
    if ((values.name ?? '').trim().length < 2) errors.name = 'Indica tu nombre'
    const phone = (values.phone ?? '').trim()
    const digits = phone.replace(/\D/g, '')
    if (!/^[0-9+\s().-]+$/.test(phone) || digits.length < 9 || digits.length > 15) {
        errors.phone = 'Indica un teléfono válido'
    }
    if (!EMAIL_RE.test((values.email ?? '').trim())) errors.email = 'Indica un email válido'
    return errors
}

export const CONTACT_INITIAL = { name: '', phone: '', email: '', website: '' }

// Errores de validación del backend (422) → { campo: mensaje }
const mapServerErrors = (errors) => {
    if (!Array.isArray(errors)) return null
    return errors.reduce((acc, item) => {
        const field = item.loc?.[item.loc.length - 1]
        if (field) acc[field] = String(item.msg ?? '').replace(/^Value error, /, '')
        return acc
    }, {})
}

/**
 * Estado y envío de un formulario público de solicitud.
 * - validate(values) → { campo: mensaje }
 * - submit(values) → Promise (llamada a la API)
 */
const useRequestForm = ({ initialValues, validate, submit }) => {
    const uid = useId()
    const [values, setValues] = useState(initialValues)
    const [errors, setErrors] = useState({})
    const [status, setStatus] = useState('idle') // idle · sending · sent
    const [submitError, setSubmitError] = useState('')

    const fieldId = (name) => `${uid}-${name}`

    const setValue = (name, value) => {
        setValues((current) => ({ ...current, [name]: value }))
        setErrors((current) => (current[name] ? { ...current, [name]: undefined } : current))
    }

    const handleChange = (event) => setValue(event.target.name, event.target.value)

    const focusFirstError = (found) => {
        const first = Object.keys(found).find((key) => found[key])
        if (first) document.getElementById(fieldId(first))?.focus()
    }

    const handleSubmit = async (event) => {
        event.preventDefault()
        setSubmitError('')

        const found = validate(values)
        setErrors(found)
        if (Object.values(found).some(Boolean)) {
            focusFirstError(found)
            return
        }

        setStatus('sending')
        try {
            await submit(values)
            setValues(initialValues)
            setStatus('sent')
        } catch (error) {
            setStatus('idle')
            const serverErrors = error.status === 422 ? mapServerErrors(error.errors) : null
            if (serverErrors && Object.keys(serverErrors).length > 0) {
                setErrors(serverErrors)
                focusFirstError(serverErrors)
                return
            }
            setSubmitError(
                error.status === 429 || error.status === 400
                    ? error.message
                    : 'No hemos podido enviar tu solicitud. Inténtalo de nuevo en unos minutos.',
            )
        }
    }

    const reset = () => {
        setValues(initialValues)
        setErrors({})
        setSubmitError('')
        setStatus('idle')
    }

    return { values, errors, status, submitError, fieldId, setValue, setErrors, handleChange, handleSubmit, reset }
}

export default useRequestForm
