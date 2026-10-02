import { useCallback, useRef, useState } from 'react'

/**
 * Hook de confirmación reutilizable.
 * Uso:
 *   const { confirmProps, confirm } = useConfirm()
 *   // En el JSX: <ConfirmDialog {...confirmProps} />
 *   // En un handler: const ok = await confirm('¿Seguro que quieres eliminar esto?')
 */
const useConfirm = () => {
    const [state, setState] = useState({ open: false, message: '' })
    const resolveRef = useRef(null)

    const confirm = useCallback((message) => {
        return new Promise((resolve) => {
            resolveRef.current = resolve
            setState({ open: true, message })
        })
    }, [])

    const handleConfirm = useCallback(() => {
        setState(prev => ({ ...prev, open: false }))
        resolveRef.current?.(true)
    }, [])

    const handleCancel = useCallback(() => {
        setState(prev => ({ ...prev, open: false }))
        resolveRef.current?.(false)
    }, [])

    return {
        confirm,
        confirmProps: {
            open: state.open,
            message: state.message,
            onConfirm: handleConfirm,
            onCancel: handleCancel,
        },
    }
}

export default useConfirm
