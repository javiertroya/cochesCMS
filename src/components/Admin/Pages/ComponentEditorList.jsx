import { useState } from 'react'
import { ChevronDown, ChevronUp, Layers3, Plus, Trash2 } from 'lucide-react'

import ComponentAddDialog from './ComponentAddDialog'
import ComponentPropsForm from './ComponentPropsForm'
import { COMPONENT_META } from '@/mocks/admin/componentMeta'

const ComponentCard = ({ component, componentType, index, total, isOpen, onToggle, onMove, onDelete, onChangeProps }) => {
    const meta = COMPONENT_META[component.type] ?? {}
    const Icon = meta.Icon

    return (
        <article className={`overflow-hidden rounded-xl border bg-white transition-all ${
            isOpen ? 'border-gray-300 shadow-md' : 'border-gray-200 hover:border-gray-300'
        }`}>
            <div
                role="button"
                tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && onToggle()}
                onClick={onToggle}
                className={`flex cursor-pointer select-none items-center gap-3 px-4 py-3 transition-colors ${
                    isOpen ? 'bg-gray-50' : 'hover:bg-gray-50/60'
                }`}
            >
                <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-gray-100 font-mono text-xs font-bold text-gray-500">
                    {index + 1}
                </span>

                {Icon && (
                    <div className={`flex size-7 shrink-0 items-center justify-center rounded-lg ${meta.bg ?? 'bg-gray-100'}`}>
                        <Icon size={14} className={meta.iconColor ?? 'text-gray-400'} />
                    </div>
                )}

                <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-gray-900">
                        {componentType?.name ?? component.type}
                    </p>
                </div>

                <div className="flex shrink-0 items-center gap-0.5" onClick={e => e.stopPropagation()}>
                    <button
                        type="button"
                        onClick={() => onMove(index, 'up')}
                        disabled={index === 0}
                        aria-label="Mover arriba"
                        className="flex size-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-25"
                    >
                        <ChevronUp size={17} />
                    </button>
                    <button
                        type="button"
                        onClick={() => onMove(index, 'down')}
                        disabled={index === total - 1}
                        aria-label="Mover abajo"
                        className="flex size-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-25"
                    >
                        <ChevronDown size={17} />
                    </button>
                </div>

                <button
                    type="button"
                    onClick={e => { e.stopPropagation(); onDelete(index) }}
                    aria-label="Eliminar componente"
                    className="flex size-8 shrink-0 items-center justify-center rounded-lg text-gray-400 transition hover:bg-red-50 hover:text-red-500"
                >
                    <Trash2 size={16} />
                </button>

                <div className={`size-1.5 shrink-0 rounded-full transition-colors ${isOpen ? 'bg-brand-primary' : 'bg-gray-200'}`} />
            </div>

            {isOpen && (
                <div className="border-t border-gray-100 bg-white p-4">
                    <ComponentPropsForm
                        component={component}
                        onChangeProps={nextProps => onChangeProps(index, nextProps)}
                    />
                </div>
            )}
        </article>
    )
}

const EmptyComponents = ({ onAdd }) => (
    <div
        role="button"
        tabIndex={0}
        onClick={onAdd}
        onKeyDown={e => e.key === 'Enter' && onAdd()}
        className="group flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed border-gray-200 py-12 text-center transition-all hover:border-brand-primary/30 hover:bg-blue-50/20"
    >
        <div className="flex size-11 items-center justify-center rounded-xl bg-gray-50 transition-colors group-hover:bg-brand-primary/10">
            <Layers3 size={20} className="text-gray-300 transition-colors group-hover:text-brand-primary/50" />
        </div>
        <div>
            <p className="text-sm font-semibold text-gray-500 group-hover:text-brand-primary">
                Sin componentes
            </p>
            <p className="mt-0.5 text-xs text-gray-400">
                Haz clic aquí para añadir el primer componente
            </p>
        </div>
    </div>
)

const ComponentEditorList = ({
    draft,
    componentTypes,
    onUpdateComponentProps,
    onAddComponent,
    onDeleteComponent,
    onMoveComponent,
    filterQuery = '',
    seamless = false,
}) => {
    const [openIndex, setOpenIndex] = useState(draft.components.length > 0 ? 0 : null)
    const [addDialogOpen, setAddDialogOpen] = useState(false)
    const total = draft.components.length

    const visibleComponents = filterQuery.trim()
        ? draft.components.filter((c) => {
            const meta = componentTypes.find(ct => ct.type === c.type)
            const name = meta?.name ?? c.type
            return name.toLowerCase().includes(filterQuery.toLowerCase()) ||
                c.type.toLowerCase().includes(filterQuery.toLowerCase())
        })
        : draft.components

    const handleToggle = (index) => {
        setOpenIndex(prev => prev === index ? null : index)
    }

    const handleAdd = (ct) => {
        onAddComponent(ct)
        setAddDialogOpen(false)
        setOpenIndex(total)
    }

    const isFiltered = visibleComponents.length < total

    const inner = (
        <>
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3.5">
                <div className="flex items-center gap-2.5">
                    <Layers3 size={15} className="text-brand-primary" />
                    <h2 className="font-semibold text-gray-900">Componentes</h2>
                    {total > 0 && (
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-500">
                            {isFiltered ? `${visibleComponents.length} de ${total}` : total}
                        </span>
                    )}
                </div>
                <button
                    type="button"
                    onClick={() => setAddDialogOpen(true)}
                    className="flex items-center gap-1.5 rounded-lg bg-brand-primary px-3 py-1.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700"
                >
                    <Plus size={13} />
                    Añadir componente
                </button>
            </div>

            <div className="space-y-1.5 p-3">
                {total === 0 ? (
                    <EmptyComponents onAdd={() => setAddDialogOpen(true)} />
                ) : visibleComponents.length === 0 ? (
                    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-gray-200 py-10 text-center">
                        <Layers3 size={24} className="text-gray-200" />
                        <p className="text-sm text-gray-400">Sin resultados para la búsqueda.</p>
                    </div>
                ) : (
                    visibleComponents.map((component) => {
                        const index = draft.components.indexOf(component)
                        const componentType = componentTypes.find(ct => ct.type === component.type)
                        return (
                            <ComponentCard
                                key={component.id ?? index}
                                component={component}
                                componentType={componentType}
                                index={index}
                                total={total}
                                isOpen={openIndex === index}
                                onToggle={() => handleToggle(index)}
                                onMove={onMoveComponent}
                                onDelete={onDeleteComponent}
                                onChangeProps={onUpdateComponentProps}
                            />
                        )
                    })
                )}
            </div>

            <ComponentAddDialog
                isOpen={addDialogOpen}
                onClose={() => setAddDialogOpen(false)}
                componentTypes={componentTypes}
                onAddComponent={handleAdd}
            />
        </>
    )

    if (seamless) return inner

    return (
        <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            {inner}
        </section>
    )
}

export default ComponentEditorList
