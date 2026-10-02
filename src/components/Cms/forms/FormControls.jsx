import { CheckCircle2, Loader2, Send } from 'lucide-react'

// Controles compartidos por los formularios públicos (Formulario completo, Importación…)

export const inputClass = (hasError) => `
    block w-full rounded-xl border bg-white px-4 py-3 text-base text-gray-900 shadow-sm
    outline-none transition placeholder:text-gray-400
    focus:ring-4
    ${hasError
        ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
        : 'border-gray-200 focus:border-brand-primary focus:ring-brand-primary/15'}
`

export const FormField = ({ id, label, hint, error, required, className = '', children }) => (
    <div className={className}>
        <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-gray-700">
            {label}
            {required && <span className="ml-0.5 text-red-500" aria-hidden="true">*</span>}
        </label>
        {children}
        {hint && !error && <p className="mt-1.5 text-xs text-gray-400">{hint}</p>}
        {error && (
            <p id={`${id}-error`} className="mt-1.5 text-sm text-red-600">
                {error}
            </p>
        )}
    </div>
)

// Campo de texto / número / select / textarea enlazado al hook useRequestForm
export const Field = ({ form, name, label, hint, required, as = 'input', options, className, ...props }) => {
    const id = form.fieldId(name)
    const error = form.errors[name]
    const common = {
        id,
        name,
        value: form.values[name] ?? '',
        onChange: form.handleChange,
        'aria-invalid': !!error,
        'aria-describedby': error ? `${id}-error` : undefined,
        ...props,
    }

    let control
    if (as === 'select') {
        control = (
            <select {...common} className={`${inputClass(error)} appearance-none bg-[url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%239ca3af'%3E%3Cpath fill-rule='evenodd' d='M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z' clip-rule='evenodd'/%3E%3C/svg%3E")] bg-[length:1.25rem] bg-[right_0.75rem_center] bg-no-repeat pr-10`}>
                {options.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                ))}
            </select>
        )
    } else if (as === 'textarea') {
        control = <textarea rows={4} {...common} className={`${inputClass(error)} min-h-28 resize-y`} />
    } else {
        control = <input type="text" {...common} className={inputClass(error)} />
    }

    return (
        <FormField id={id} label={label} hint={hint} error={error} required={required} className={className}>
            {control}
        </FormField>
    )
}

// Campos de contacto comunes (nombre, teléfono, email)
export const ContactFields = ({ form }) => (
    <div className="grid gap-5 sm:grid-cols-2">
        <Field form={form} name="name" label="Nombre" required autoComplete="name" maxLength={120} className="sm:col-span-2" />
        <Field form={form} name="phone" label="Teléfono" required type="tel" inputMode="tel" autoComplete="tel" maxLength={30} />
        <Field form={form} name="email" label="Email" required type="email" inputMode="email" autoComplete="email" maxLength={254} />
    </div>
)

// Campo trampa antispam: oculto para personas
export const Honeypot = ({ form }) => (
    <div className="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden="true">
        <label htmlFor={form.fieldId('website')}>No rellenes este campo</label>
        <input
            id={form.fieldId('website')}
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={form.values.website ?? ''}
            onChange={form.handleChange}
        />
    </div>
)

export const SubmitRow = ({ form, label }) => (
    <>
        {form.submitError && (
            <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
                {form.submitError}
            </p>
        )}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-gray-400">
                <span className="text-red-500">*</span> Campos obligatorios
            </p>
            <button
                type="submit"
                disabled={form.status === 'sending'}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-primary px-6 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
            >
                {form.status === 'sending'
                    ? <Loader2 className="size-4 animate-spin" />
                    : <Send className="size-4" />}
                {form.status === 'sending' ? 'Enviando…' : (label || 'Enviar solicitud')}
            </button>
        </div>
    </>
)

export const SuccessState = ({ message, onReset }) => (
    <div className="flex flex-col items-center gap-4 py-8 text-center" role="status">
        <div className="flex size-14 items-center justify-center rounded-full bg-emerald-50">
            <CheckCircle2 className="size-8 text-emerald-600" />
        </div>
        <p className="max-w-md text-base leading-relaxed text-gray-700">
            {message || '¡Gracias! Hemos recibido tu solicitud y te contactaremos pronto.'}
        </p>
        {onReset && (
            <button type="button" onClick={onReset} className="text-sm font-medium text-brand-primary hover:underline">
                Enviar otra solicitud
            </button>
        )}
    </div>
)
