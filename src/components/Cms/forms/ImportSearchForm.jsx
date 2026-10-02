import { useLocation } from 'react-router-dom'

import { ContactFields, Field, Honeypot, SubmitRow, SuccessState } from './FormControls'
import useRequestForm, { CONTACT_INITIAL, validateContact } from './useRequestForm'
import { submitImportSearchRequest } from '@/services/request_service'

const CURRENT_YEAR = new Date().getFullYear()

const FUEL_OPTIONS = [
    { value: '', label: 'Indiferente' },
    { value: 'gasolina', label: 'Gasolina' },
    { value: 'diesel', label: 'Diésel' },
    { value: 'hibrido', label: 'Híbrido' },
    { value: 'hibrido_enchufable', label: 'Híbrido enchufable' },
    { value: 'electrico', label: 'Eléctrico' },
]

const TRANSMISSION_OPTIONS = [
    { value: '', label: 'Indiferente' },
    { value: 'automatico', label: 'Automático' },
    { value: 'manual', label: 'Manual' },
]

const TIMEFRAME_OPTIONS = [
    { value: '', label: 'Sin especificar' },
    { value: 'lo_antes_posible', label: 'Lo antes posible' },
    { value: '1_2_meses', label: 'En 1-2 meses' },
    { value: 'sin_prisa', label: 'Sin prisa' },
]

const INITIAL = {
    ...CONTACT_INITIAL,
    brand: '', model: '', version: '',
    year_from: '', max_km: '', fuel: '', transmission: '',
    max_budget: '', timeframe: '', must_have: '', comments: '',
}

const toInt = (value) => {
    const digits = String(value ?? '').replace(/\D/g, '')
    return digits ? Number(digits) : null
}

const validate = (values) => {
    const errors = validateContact(values)
    if (!values.brand.trim()) errors.brand = 'Indica la marca'
    if (!values.model.trim()) errors.model = 'Indica el modelo'
    const budget = toInt(values.max_budget)
    if (!budget || budget < 1000) errors.max_budget = 'Indica tu presupuesto máximo (mínimo 1.000 €)'
    const year = toInt(values.year_from)
    if (values.year_from && (!year || year < 1990 || year > CURRENT_YEAR + 1)) errors.year_from = `Año entre 1990 y ${CURRENT_YEAR + 1}`
    return errors
}

const ImportSearchForm = ({ buttonText, successMessage }) => {
    const { pathname } = useLocation()
    const form = useRequestForm({
        initialValues: INITIAL,
        validate,
        submit: (values) => submitImportSearchRequest({
            name: values.name.trim(),
            phone: values.phone.trim(),
            email: values.email.trim(),
            brand: values.brand.trim(),
            model: values.model.trim(),
            version: values.version.trim(),
            year_from: toInt(values.year_from),
            max_km: toInt(values.max_km),
            fuel: values.fuel || null,
            transmission: values.transmission || null,
            max_budget: toInt(values.max_budget),
            timeframe: values.timeframe || null,
            must_have: values.must_have.trim(),
            comments: values.comments.trim(),
            website: values.website,
            source_page: pathname,
        }),
    })

    if (form.status === 'sent') return <SuccessState message={successMessage} onReset={form.reset} />

    return (
        <form onSubmit={form.handleSubmit} noValidate className="space-y-8">
            <fieldset className="space-y-5">
                <legend className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-400">Tus datos</legend>
                <ContactFields form={form} />
            </fieldset>

            <fieldset className="space-y-5">
                <legend className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-400">El coche que buscas</legend>
                <div className="grid gap-5 sm:grid-cols-2">
                    <Field form={form} name="brand" label="Marca" required placeholder="Ej. BMW" maxLength={80} />
                    <Field form={form} name="model" label="Modelo" required placeholder="Ej. X3" maxLength={80} />
                    <Field form={form} name="version" label="Versión / acabado" placeholder="Ej. xDrive30e M Sport" maxLength={120} className="sm:col-span-2" />
                    <Field form={form} name="year_from" label="Año mínimo" inputMode="numeric" placeholder={`Ej. ${CURRENT_YEAR - 3}`} maxLength={4} />
                    <Field form={form} name="max_km" label="Kilómetros máximos" inputMode="numeric" placeholder="Ej. 60000" maxLength={7} />
                    <Field form={form} as="select" name="fuel" label="Combustible" options={FUEL_OPTIONS} />
                    <Field form={form} as="select" name="transmission" label="Cambio" options={TRANSMISSION_OPTIONS} />
                    <Field form={form} name="max_budget" label="Presupuesto máximo (€)" required inputMode="numeric" placeholder="Ej. 35000" maxLength={8} hint="Coche puesto en España, con transporte y matriculación." />
                    <Field form={form} as="select" name="timeframe" label="¿Para cuándo lo necesitas?" options={TIMEFRAME_OPTIONS} />
                    <Field form={form} name="must_have" label="Imprescindible" placeholder="Color, equipamiento, techo panorámico…" maxLength={1000} className="sm:col-span-2" />
                    <Field form={form} as="textarea" name="comments" label="Comentarios" placeholder="Cualquier otro detalle que debamos saber." maxLength={3000} className="sm:col-span-2" />
                </div>
            </fieldset>

            <Honeypot form={form} />
            <SubmitRow form={form} label={buttonText} />
        </form>
    )
}

export default ImportSearchForm
