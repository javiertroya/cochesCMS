import { Button } from '@/components/UI/coss/button'

const ExpandedValueDialog = ({ item, onClose }) => {
    if (!item) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-xl">
                <div className="flex items-center justify-between gap-4 border-b border-[#f3f4f6] px-6 py-4">
                    <h3 className="min-w-0 truncate text-base font-bold text-[#111827]">
                        {item.label}
                    </h3>
                    <Button type="button" variant="outline" size="sm" onClick={onClose}>
                        Cerrar
                    </Button>
                </div>
                <div className="max-h-[70vh] overflow-y-auto px-6 py-5">
                    <pre className="whitespace-pre-wrap break-words rounded-lg bg-[#f9fafb] p-4 text-sm leading-6 text-[#374151]">
                        {item.value}
                    </pre>
                </div>
            </div>
        </div>
    )
}

export default ExpandedValueDialog
