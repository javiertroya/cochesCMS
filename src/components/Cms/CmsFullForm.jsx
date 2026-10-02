import { useLocation } from 'react-router-dom'

import SectionHeading from './SectionHeading'
import { ContactFields, Field, Honeypot, SubmitRow, SuccessState } from './forms/FormControls'
import useRequestForm, { CONTACT_INITIAL, validateContact } from './forms/useRequestForm'
import { submitFullFormRequest } from '@/services/request_service'

const validate = (values) => {
    const errors = validateContact(values)
    if (values.message.trim().length < 10) errors.message = 'Cuéntanos un poco más (mínimo 10 caracteres)'
    return errors
}

const CmsFullForm = ({
    anchor,
    title,
    subtitle,
    messageLabel,
    messagePlaceholder,
    buttonText,
    successMessage,
}) => {
    const { pathname } = useLocation()
    const form = useRequestForm({
        initialValues: { ...CONTACT_INITIAL, message: '' },
        validate,
        submit: (values) => submitFullFormRequest({
            name: values.name.trim(),
            phone: values.phone.trim(),
            email: values.email.trim(),
            message: values.message.trim(),
            website: values.website,
            source_page: pathname,
        }),
    })

    return (
        <section id={anchor || undefined} className="py-10 sm:py-14">
            <div className="mx-auto max-w-3xl">
                {title && <SectionHeading subtitle={subtitle}>{title}</SectionHeading>}

                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-8">
                    {form.status === 'sent' ? (
                        <SuccessState message={successMessage} onReset={form.reset} />
                    ) : (
                        <form onSubmit={form.handleSubmit} noValidate className="space-y-5">
                            <ContactFields form={form} />
                            <Field
                                form={form}
                                as="textarea"
                                name="message"
                                label={messageLabel || 'Cuéntanos o detalla lo que necesitas'}
                                placeholder={messagePlaceholder || ''}
                                rows={6}
                                maxLength={5000}
                                required
                            />
                            <Honeypot form={form} />
                            <SubmitRow form={form} label={buttonText} />
                        </form>
                    )}
                </div>
            </div>
        </section>
    )
}

export default CmsFullForm
