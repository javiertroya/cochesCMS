import { Form } from "@/components/UI/coss/form"
import { Field, FieldLabel } from "@/components/UI/coss/field"
import { Input } from "@/components/UI/coss/input"
import { Button } from "@/components/UI/coss/button"

const ContactForm = () => {

    // .............................
    const formSubmit = () => {}

    // .............................
    return (
        <Form
            onSubmit={formSubmit}
            className="
                py-5 space-y-4 sm:max-w-md lg:max-w-none
        ">
            <Field>
                <FieldLabel className="text-white">
                    Tu Email
                </FieldLabel>
                <Input
                    name="email"
                    placeholder="Escriba aquí su correo electrónico"
                    type="email"
                    size="lg"
                    required
                    className="
                        w-full
                        text-black
                    "
                />
            </Field>

            <Button 
                type="submit"
                size="xl"
                className="w-full
            ">
                Suscríbete
            </Button>
        </Form>
    )
}

export default ContactForm
