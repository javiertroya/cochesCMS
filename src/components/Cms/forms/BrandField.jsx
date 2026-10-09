import { useEffect, useState } from 'react'

import { Field } from './FormControls'
import { getPublicCollectionBySlug } from '@/services/collection_service'
import { getTitle } from '@/utils/collection'

export const BRAND_OTHER = '__otro__'

// Marca final a enviar: la elegida en la lista o la escrita a mano en "Otra"
export const resolveBrand = (values) =>
    (values.brand === BRAND_OTHER ? values.brand_other : values.brand).trim()

export const validateBrand = (values, errors) => {
    if (!values.brand.trim()) errors.brand = 'Indica la marca'
    else if (values.brand === BRAND_OTHER && !values.brand_other.trim()) errors.brand_other = 'Escribe la marca'
    return errors
}

// Desplegable con la colección "Marcas" + opción "Otra" que muestra un campo de texto.
// Si la colección no carga, se queda como campo de texto libre.
const BrandField = ({ form, placeholder }) => {
    const [brands, setBrands] = useState(null)

    useEffect(() => {
        let mounted = true
        getPublicCollectionBySlug('marcas')
            .then(data => {
                const schema = data?.collection?.fields_schema ?? []
                const names = (data?.items ?? [])
                    .filter(item => item.activo !== false)
                    .map(item => getTitle(item, schema))
                    .sort((a, b) => a.localeCompare(b, 'es'))
                if (mounted) setBrands(names)
            })
            .catch(() => { if (mounted) setBrands([]) })
        return () => { mounted = false }
    }, [])

    if (brands !== null && brands.length === 0) {
        return <Field form={form} name="brand" label="Marca" required placeholder={placeholder} maxLength={80} />
    }

    const options = [
        { value: '', label: brands === null ? 'Cargando marcas…' : 'Selecciona una marca' },
        ...(brands ?? []).map(name => ({ value: name, label: name })),
        { value: BRAND_OTHER, label: 'Otra' },
    ]

    return (
        <div className="space-y-3">
            <Field form={form} as="select" name="brand" label="Marca" required options={options} />
            {form.values.brand === BRAND_OTHER && (
                <Field
                    form={form}
                    name="brand_other"
                    label="Escribe la marca"
                    required
                    placeholder={placeholder}
                    maxLength={80}
                    autoFocus
                />
            )}
        </div>
    )
}

export default BrandField
