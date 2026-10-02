import ContactForm from '@/components/Forms/ContactForm'

const CmsForm = ({ form }) => {
    if (form === 'contacto') {
        return (
            <div className="w-full max-w-xl">
                <ContactForm />
            </div>
        )
    }
    return null
}

export default CmsForm
