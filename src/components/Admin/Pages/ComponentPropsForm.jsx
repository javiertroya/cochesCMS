import CollectionPickerField from './CollectionPickerField'
import ComponentField from './ComponentField'
import ComponentListField from './ComponentListField'
import { getComponentSchema } from '@/mocks/admin/componentSchemas'

const ComponentPropsForm = ({ component, onChangeProps }) => {
    const schema = getComponentSchema(component.type)
    const props = component.props ?? {}

    if (schema.length === 0) {
        return (
            <p className="rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-500">
                Este componente todavía no tiene formulario visual.
            </p>
        )
    }

    const updateField = (fieldName, value) => {
        onChangeProps({ ...props, [fieldName]: value })
    }

    return (
        <div className="grid gap-4 sm:grid-cols-2">
            {schema.map(field => {
                if (field.type === 'collection-picker') {
                    return (
                        <div key={field.name} className="sm:col-span-2">
                            <p className="mb-1.5 text-sm font-medium text-gray-700">{field.label}</p>
                            <CollectionPickerField
                                collection={props.collection}
                                showFilters={props.showFilters}
                                enabledFilters={props.enabledFilters}
                                displayFields={props.displayFields}
                                onChange={(updates) => onChangeProps({ ...props, ...updates })}
                            />
                        </div>
                    )
                }

                const isCheckbox = field.type === 'checkbox'
                const isWide = field.type === 'list' || field.type === 'textarea' || field.type === 'image'

                return (
                    <div
                        key={field.name}
                        className={isWide ? 'sm:col-span-2' : ''}
                    >
                        {isCheckbox ? (
                            <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2.5">
                                <span className="text-sm font-medium text-gray-700">{field.label}</span>
                                <ComponentField
                                    field={field}
                                    value={props[field.name]}
                                    onChange={(nextValue) => updateField(field.name, nextValue)}
                                />
                            </label>
                        ) : (
                            <>
                                <p className="mb-1.5 text-sm font-medium text-gray-700">{field.label}</p>
                                {field.type === 'list' ? (
                                    <ComponentListField
                                        field={field}
                                        value={props[field.name]}
                                        onChange={(nextValue) => updateField(field.name, nextValue)}
                                    />
                                ) : (
                                    <ComponentField
                                        field={field}
                                        value={props[field.name]}
                                        onChange={(nextValue) => updateField(field.name, nextValue)}
                                    />
                                )}
                            </>
                        )}
                    </div>
                )
            })}
        </div>
    )
}

export default ComponentPropsForm
