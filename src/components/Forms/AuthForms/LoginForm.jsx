import { useState } from "react"

import { Form } from "@/components/UI/coss/form"
import { Field, FieldError, FieldLabel } from "@/components/UI/coss/field"
import { Input } from "@/components/UI/coss/input"
import { Button } from "@/components/UI/coss/button"
import { toastManager } from "@/components/UI/coss/toast"
import useAuth from "@/hooks/useAuth"

const LoginForm = ({ onSuccess }) => {

    // .............................
    const { login } = useAuth()
    const [error, setError] = useState(null)
    const [submitting, setSubmitting] = useState(false)

    // .............................
    const formSubmit = async (e) => {
        e.preventDefault()
        setError(null)
        setSubmitting(true)

        try {
            const data = Object.fromEntries(new FormData(e.target))
            const user = await login(data)
            toastManager.add({
                title: `Bienvenido, ${user?.name ?? 'usuario'}`,
                description: 'Has iniciado sesión correctamente.',
                type: 'success',
            })
            onSuccess?.()
        } catch (error) {
            setError(error.message || "No se pudo iniciar sesión.")
        } finally {
            setSubmitting(false)
        }
    }

    // .............................
    return (
        <Form
            onSubmit={formSubmit}
            className="
                px-6 py-5 space-y-4
        ">
            <Field>
                <FieldLabel>
                    Email <span className="text-destructive-foreground">*</span>
                </FieldLabel>
                <Input
                    name="email"
                    placeholder="correo@ejemplo.com"
                    type="email"
                    size="lg"
                    required
                />
                <FieldError>Es obligatorio introducir tu email.</FieldError>
            </Field>

            <Field>
                <FieldLabel>
                    Contraseña <span className="text-destructive-foreground">*</span>
                </FieldLabel>
                <Input
                    name="password"
                    placeholder="••••••••"
                    type="password"
                    size="lg"
                    required
                />
                <FieldError>Es obligatorio introducir la contraseña</FieldError>
            </Field>

            <Button 
                type="submit"
                size="xl"
                disabled={submitting}
                className="w-full
            ">
                {submitting ? "Entrando..." : "Entrar"}
            </Button>

            {error && (
                <p className="text-sm text-destructive-foreground">
                    {error}
                </p>
            )}
        </Form>
    )
}

export default LoginForm
