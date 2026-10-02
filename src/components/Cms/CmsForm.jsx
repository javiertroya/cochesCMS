import ContactForm from '@/components/Forms/ContactForm'

const CmsForm = ({ form }) => {
    if (form === 'contacto') return <ContactForm />
    return null
}

export default CmsForm
