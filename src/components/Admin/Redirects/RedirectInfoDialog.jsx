import { Button } from '@/components/UI/coss/button'
import {
    Dialog,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogPanel,
    DialogPopup,
    DialogTitle,
} from '@/components/UI/coss/dialog'

const RedirectInfoDialog = ({ open, onClose }) => (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
        <DialogPopup className="max-w-2xl">
            <DialogHeader>
                <DialogTitle>Cómo funcionan las redirecciones</DialogTitle>
                <DialogDescription>
                    Una redirección envía automáticamente a una persona desde una URL antigua a una URL nueva.
                </DialogDescription>
            </DialogHeader>
            <DialogPanel className="space-y-5 text-sm leading-relaxed text-gray-600">
                <section className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                    <p className="font-semibold text-gray-900">Ejemplo sencillo</p>
                    <p className="mt-1">
                        Si alguien entra en <span className="font-mono text-gray-900">/stock</span>, pero ahora esa
                        página está en <span className="font-mono text-gray-900">/catalogo</span>, la redirección
                        lo lleva automáticamente a la dirección correcta.
                    </p>
                </section>

                <div className="grid gap-3 sm:grid-cols-2">
                    <section className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-4">
                        <p className="font-semibold text-indigo-800">301 Permanente</p>
                        <p className="mt-1 text-indigo-700">
                            Úsala cuando el cambio sea definitivo. Es la opción habitual si has cambiado el nombre de
                            una página, has reorganizado el menú o quieres conservar el posicionamiento SEO.
                        </p>
                    </section>
                    <section className="rounded-xl border border-blue-100 bg-blue-50/60 p-4">
                        <p className="font-semibold text-blue-800">302 Temporal</p>
                        <p className="mt-1 text-blue-700">
                            Úsala cuando el cambio sea provisional. Por ejemplo, una campaña temporal, una página en
                            mantenimiento o una prueba que podría volver a su URL anterior.
                        </p>
                    </section>
                </div>

                <section>
                    <p className="font-semibold text-gray-900">Qué campos debes rellenar</p>
                    <ul className="mt-2 space-y-2">
                        <li><span className="font-medium text-gray-800">Ruta origen:</span> la URL vieja que alguien podría visitar.</li>
                        <li><span className="font-medium text-gray-800">Ruta destino:</span> la URL nueva a la que debe llegar.</li>
                        <li><span className="font-medium text-gray-800">Activa:</span> si está apagada, queda guardada pero no se aplica.</li>
                    </ul>
                </section>

                <p className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-amber-800">
                    Consejo: evita crear cadenas como A → B y luego B → C. Siempre que puedas, redirige directamente
                    de la URL antigua a la URL final.
                </p>
            </DialogPanel>
            <DialogFooter>
                <Button onClick={onClose}>Entendido</Button>
            </DialogFooter>
        </DialogPopup>
    </Dialog>
)

export default RedirectInfoDialog
