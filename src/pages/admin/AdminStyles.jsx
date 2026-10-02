import { Loader2 } from 'lucide-react'

import StylesManager from '@/components/Admin/Styles/StylesManager'
import useStylesForm from '@/hooks/admin/useStylesForm'

const AdminStyles = () => {
    const form = useStylesForm()

    if (form.loading) {
        return (
            <div className="flex h-full items-center justify-center py-24">
                <Loader2 className="h-6 w-6 animate-spin text-gray-300" />
            </div>
        )
    }

    return <StylesManager form={form} />
}

export default AdminStyles
