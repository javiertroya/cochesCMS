import { createContext, useCallback, useContext, useState } from "react"

const BreadcrumbContext = createContext(null)

export const BreadcrumbProvider = ({ children }) => {
    const [dynamicLabels, setDynamicLabels] = useState({})

    const setLabel = useCallback((path, label) =>
        setDynamicLabels((prev) => ({ ...prev, [path]: label })), [])

    const clearLabel = useCallback((path) =>
        setDynamicLabels((prev) => {
            const next = { ...prev }
            delete next[path]
            return next
        }), [])

    return (
        <BreadcrumbContext.Provider value={{ dynamicLabels, setLabel, clearLabel }}>
            {children}
        </BreadcrumbContext.Provider>
    )
}

export const useBreadcrumbContext = () => useContext(BreadcrumbContext)
