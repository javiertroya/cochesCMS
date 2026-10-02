import ContactForm from "../../../Forms/ContactForm"
import Socials from "./Socials"

const Contact = () => {
    return (
        <section className="
            sm:col-span-2 lg:col-span-1
        ">
            <h1 className="
                text-footer-title text-lg
                pb-2
            ">
                CONTACTO
            </h1>
            <ContactForm />
            <Socials />
        </section>
    )
}

export default Contact