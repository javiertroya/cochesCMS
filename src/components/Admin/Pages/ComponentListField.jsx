import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react'

import { Button } from '@/components/UI/coss/button'
import ComponentField from './ComponentField'

const ComponentListField = ({ field, value = [], onChange }) => {
    const items = Array.isArray(value) ? value : []

    const updateItem = (index, itemField, nextValue) => {
        onChange(items.map((item, itemIndex) => (
            itemIndex === index
                ? { ...item, [itemField]: nextValue }
                : item
        )))
    }

    const addItem = () => {
        onChange([...items, field.newItem ?? {}])
    }

    const deleteItem = (index) => {
        onChange(items.filter((_, itemIndex) => itemIndex !== index))
    }

    const moveItem = (index, direction) => {
        const next = [...items]
        const targetIndex = direction === 'up' ? index - 1 : index + 1
        if (targetIndex < 0 || targetIndex >= next.length) return
        ;[next[index], next[targetIndex]] = [next[targetIndex], next[index]]
        onChange(next)
    }

    return (
        <div className="space-y-3">
            {items.map((item, index) => (
                <div key={index} className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                    <div className="mb-3 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                            <div className="flex gap-0.5">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon-sm"
                                    onClick={() => moveItem(index, 'up')}
                                    disabled={index === 0}
                                    aria-label="Mover arriba"
                                    className="h-6 w-6"
                                >
                                    <ArrowUp size={12} />
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon-sm"
                                    onClick={() => moveItem(index, 'down')}
                                    disabled={index === items.length - 1}
                                    aria-label="Mover abajo"
                                    className="h-6 w-6"
                                >
                                    <ArrowDown size={12} />
                                </Button>
                            </div>
                            <p className="text-sm font-semibold text-gray-800">
                                {field.itemLabel} {index + 1}
                            </p>
                        </div>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => deleteItem(index)}
                            aria-label={`Eliminar ${field.itemLabel}`}
                            className="text-red-500 hover:bg-red-50 hover:text-red-600"
                        >
                            <Trash2 size={14} />
                        </Button>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                        {(field.fields ?? []).map(itemField => (
                            <label key={itemField.name} className="space-y-1.5">
                                <span className="text-xs font-semibold text-gray-600">{itemField.label}</span>
                                <ComponentField
                                    field={itemField}
                                    value={item[itemField.name]}
                                    onChange={(nextValue) => updateItem(index, itemField.name, nextValue)}
                                />
                            </label>
                        ))}
                    </div>
                </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus size={14} />
                Añadir {field.itemLabel.toLowerCase()}
            </Button>
        </div>
    )
}

export default ComponentListField
