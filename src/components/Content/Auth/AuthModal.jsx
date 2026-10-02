import { MdLock } from "react-icons/md"
import AuthHeader from "./AuthHeader"
import AuthFooter from "./AuthFooter"
import AUTH from "../../../mocks/auth"
import { Alert, AlertDescription } from "../../UI/coss/alert"

const AuthModal = (props) => {

    // .............................
    const { type, onClose, onSuccess, onChangeType, authRequired } = props
    const { title, description, Form, footer } = AUTH[type]

    // .............................
    return (
        <div className="
            flex items-center justify-center
            px-4 py-8
            fixed inset-0 z-100
            bg-slate-950/70
        ">
            <div className="
                w-full max-w-md
                border border-slate-200 rounded-2xl
                bg-white
                shadow-2xl shadow-slate-950/20
            ">
                <AuthHeader
                    onClose={onClose}
                    title={title}
                    description={description}
                />
                { authRequired && (
                    <div className="px-6 pt-4">
                        <Alert variant="warning">
                            <MdLock className="h-4 w-4" />
                            <AlertDescription>
                                Debes iniciar sesión para acceder a esa página.
                            </AlertDescription>
                        </Alert>
                    </div>
                )}
                <Form onSuccess={onSuccess ?? onClose} />
                {footer && (
                    <AuthFooter
                        title={footer.title}
                        description={footer.description}
                        onChangeType={() => onChangeType(footer.changeType)}
                    />
                )}
            </div>
        </div>
    )
}

export default AuthModal
