import { useState } from 'react'
import { Database, Plus, Search } from 'lucide-react'

import { Button } from '@/components/UI/coss/button'
import { DeleteButton, EditButton } from '@/components/Admin/UI/ActionButtons'
import AdminLoadingState from '@/components/Admin/UI/AdminLoadingState'

const CollectionItemsTable = ({
    title,
    description,
    icon: Icon = Database,
    items,
    loading,
    columns,
    onCreate,
    onEdit,
    onDelete,
}) => {
    const [search, setSearch] = useState('')

    const filteredItems = search
        ? items.filter(item =>
            Object.values(item).some(v =>
                v != null && typeof v !== 'object' && v.toString().toLowerCase().includes(search.toLowerCase())
            )
        )
        : items

    return (
        <section className="overflow-hidden rounded-xl border border-[#e5e7eb] bg-white shadow-sm">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#dcdfea] px-5 py-4">
                <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-[#f6f7fb]">
                        <Icon size={18} className="text-[#374151]" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-[#111827]">{title}</h2>
                        {description && <p className="text-sm text-[#6b7280]">{description}</p>}
                    </div>
                </div>
                <Button onClick={onCreate}>
                    <Plus size={16} />
                    Añadir
                </Button>
            </div>

            {/* Filters */}
            <div className="flex items-center border-b border-[#dcdfea] px-5 py-3">
                <div className="relative">
                    <Search size={13} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[#9ca3af]" />
                    <input
                        type="text"
                        placeholder="Buscar…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="rounded-lg border border-[#dcdfea] bg-white py-1.5 pl-7 pr-3 text-sm text-[#111827] placeholder-[#9ca3af] outline-none transition focus:border-[#111827] focus:ring-1 focus:ring-[#111827]/10"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full min-w-150 text-left text-sm">
                    <thead className="border-b border-[#f3f4f6] bg-[#f9fafb]">
                        <tr>
                            {columns.map(column => (
                                <th
                                    key={column.key}
                                    className="px-5 py-3 text-xs font-semibold text-[#6b7280]"
                                >
                                    {column.label}
                                </th>
                            ))}
                            <th className="px-5 py-3 text-right text-xs font-semibold text-[#6b7280]">
                                Acciones
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f3f4f6]">
                        {filteredItems.map(item => (
                            <tr key={item.id} className="transition-colors hover:bg-[#fafafa]">
                                {columns.map(column => (
                                    <td key={column.key} className="px-5 py-3 align-middle text-[#374151]">
                                        {column.render ? column.render(item) : item[column.key]}
                                    </td>
                                ))}
                                <td className="px-5 py-3 align-middle">
                                    <div className="flex justify-end gap-1.5">
                                        <EditButton onClick={() => onEdit(item)} />
                                        <DeleteButton onClick={() => onDelete(item)} />
                                    </div>
                                </td>
                            </tr>
                        ))}

                        {!loading && items.length === 0 && (
                            <tr>
                                <td colSpan={columns.length + 1}>
                                    <div className="flex flex-col items-center gap-2 py-14 text-center">
                                        <Database className="size-7 text-gray-200" />
                                        <p className="text-sm font-medium text-gray-400">Sin registros</p>
                                        <p className="text-xs text-gray-300">Crea el primero pulsando «Nuevo».</p>
                                    </div>
                                </td>
                            </tr>
                        )}

                        {!loading && items.length > 0 && filteredItems.length === 0 && (
                            <tr>
                                <td colSpan={columns.length + 1}>
                                    <div className="flex flex-col items-center gap-2 py-14 text-center">
                                        <Search className="size-7 text-gray-200" />
                                        <p className="text-sm font-medium text-gray-400">Sin resultados</p>
                                        <p className="text-xs text-gray-300">Ningún registro coincide con la búsqueda.</p>
                                    </div>
                                </td>
                            </tr>
                        )}

                        {loading && (
                            <tr>
                                <td colSpan={columns.length + 1}>
                                    <AdminLoadingState label="Cargando…" />
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </section>
    )
}

export default CollectionItemsTable
