import { ChevronDown, ChevronUp, ImageIcon, Plus, Trash2, VideoIcon } from 'lucide-react'

import { Input } from '@/components/UI/coss/input'
import { Textarea } from '@/components/UI/coss/textarea'
import MediaField from './MediaField'

const Label = ({ children }) => (
    <p className="mb-1.5 text-sm font-medium text-gray-700">{children}</p>
)

const HeroTextEditor = ({ value, onChange }) => {
    const updateField = (field, fieldValue) => {
        onChange({ ...value, [field]: fieldValue })
    }

    return (
        <div className="rounded-xl border border-brand-primary/15 bg-brand-primary/5 p-4">
            <div className="mb-4">
                <p className="text-sm font-semibold text-gray-900">Texto sobre el carrusel</p>
                <p className="mt-0.5 text-xs text-gray-500">
                    Estos campos se muestran encima del carrusel de la página de inicio.
                </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                    <Label>Texto superior</Label>
                    <Input
                        value={value.eyebrow ?? ''}
                        onChange={(e) => updateField('eyebrow', e.target.value)}
                        placeholder="Concesionario · Vehículos de ocasión"
                    />
                </div>

                <div className="sm:col-span-2">
                    <Label>Título</Label>
                    <Input
                        value={value.title ?? ''}
                        onChange={(e) => updateField('title', e.target.value)}
                        placeholder="Tu próximo coche te está esperando"
                    />
                </div>

                <div className="sm:col-span-2">
                    <Label>Descripción</Label>
                    <Textarea
                        value={value.description ?? ''}
                        onChange={(e) => updateField('description', e.target.value)}
                        placeholder="Texto descriptivo del hero"
                    />
                </div>

                <div>
                    <Label>Botón principal</Label>
                    <Input
                        value={value.primaryLabel ?? ''}
                        onChange={(e) => updateField('primaryLabel', e.target.value)}
                        placeholder="Ver catálogo"
                    />
                </div>

                <div>
                    <Label>URL botón principal</Label>
                    <Input
                        value={value.primaryUrl ?? ''}
                        onChange={(e) => updateField('primaryUrl', e.target.value)}
                        placeholder="/catalogo"
                    />
                </div>

                <div>
                    <Label>Botón secundario</Label>
                    <Input
                        value={value.secondaryLabel ?? ''}
                        onChange={(e) => updateField('secondaryLabel', e.target.value)}
                        placeholder="Contactar"
                    />
                </div>

                <div>
                    <Label>URL botón secundario</Label>
                    <Input
                        value={value.secondaryUrl ?? ''}
                        onChange={(e) => updateField('secondaryUrl', e.target.value)}
                        placeholder="/contacto"
                    />
                </div>
            </div>
        </div>
    )
}

const HeaderCarouselEditor = ({ slides, onChange, showHomeHeroFields = false, homeHero, onHomeHeroChange }) => {
    const addSlide = () => {
        onChange([...slides, { type: 'image', src: '', alt: '' }])
    }

    const updateSlide = (index, field, value) => {
        onChange(slides.map((slide, i) => (
            i === index ? { ...slide, [field]: value } : slide
        )))
    }

    const deleteSlide = (index) => {
        onChange(slides.filter((_, i) => i !== index))
    }

    const moveSlide = (index, direction) => {
        const next = [...slides]
        const targetIndex = direction === 'up' ? index - 1 : index + 1
        if (targetIndex < 0 || targetIndex >= next.length) return
        ;[next[index], next[targetIndex]] = [next[targetIndex], next[index]]
        onChange(next)
    }

    return (
        <div className="space-y-3 p-5">
            {showHomeHeroFields && homeHero && onHomeHeroChange && (
                <HeroTextEditor value={homeHero} onChange={onHomeHeroChange} />
            )}

            {slides.length === 0 && (
                <p className="text-sm text-gray-400">
                    Sin slides configurados. Se mostrará el carousel por defecto si existe.
                </p>
            )}

            {slides.map((slide, index) => (
                <div
                    key={index}
                    className="overflow-hidden rounded-xl border border-gray-200 bg-white"
                >
                    <div className="flex items-center gap-3 border-b border-gray-100 bg-gray-50 px-4 py-2.5">
                        <span className="flex size-6 items-center justify-center rounded-md bg-white font-mono text-xs font-bold text-gray-500 shadow-sm ring-1 ring-gray-200">
                            {index + 1}
                        </span>
                        <span className="flex-1 text-sm font-semibold text-gray-700">
                            Slide {index + 1}
                        </span>
                        <div className="flex items-center gap-0.5" onClick={e => e.stopPropagation()}>
                            <button
                                type="button"
                                onClick={() => moveSlide(index, 'up')}
                                disabled={index === 0}
                                aria-label="Mover arriba"
                                className="flex size-7 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-200 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-25"
                            >
                                <ChevronUp size={14} />
                            </button>
                            <button
                                type="button"
                                onClick={() => moveSlide(index, 'down')}
                                disabled={index === slides.length - 1}
                                aria-label="Mover abajo"
                                className="flex size-7 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-200 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-25"
                            >
                                <ChevronDown size={14} />
                            </button>
                        </div>
                        <button
                            type="button"
                            onClick={() => deleteSlide(index)}
                            aria-label="Eliminar slide"
                            className="flex size-7 items-center justify-center rounded-lg text-gray-300 transition hover:bg-red-50 hover:text-red-500"
                        >
                            <Trash2 size={13} />
                        </button>
                    </div>

                    <div className="grid gap-4 p-4 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                            <Label>Tipo</Label>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => updateSlide(index, 'type', 'image')}
                                    className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition ${
                                        slide.type === 'image'
                                            ? 'border-brand-primary bg-brand-primary/5 text-brand-primary'
                                            : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                                    }`}
                                >
                                    <ImageIcon size={14} />
                                    Imagen
                                </button>
                                <button
                                    type="button"
                                    onClick={() => updateSlide(index, 'type', 'video')}
                                    className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition ${
                                        slide.type === 'video'
                                            ? 'border-brand-primary bg-brand-primary/5 text-brand-primary'
                                            : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                                    }`}
                                >
                                    <VideoIcon size={14} />
                                    Video
                                </button>
                            </div>
                        </div>

                        <div className="sm:col-span-2">
                            <Label>Archivo</Label>
                            <MediaField
                                value={slide.src}
                                onChange={(url) => updateSlide(index, 'src', url)}
                            />
                        </div>

                        <div className="sm:col-span-2">
                            <Label>Texto alternativo</Label>
                            <Input
                                value={slide.alt}
                                onChange={(e) => updateSlide(index, 'alt', e.target.value)}
                                placeholder="Descripción del slide"
                            />
                        </div>
                    </div>
                </div>
            ))}

            <button
                type="button"
                onClick={addSlide}
                className="flex items-center gap-2 rounded-lg border border-dashed border-gray-300 bg-transparent px-4 py-2.5 text-sm font-medium text-gray-500 transition hover:border-brand-primary hover:text-brand-primary"
            >
                <Plus size={14} />
                Añadir slide
            </button>
        </div>
    )
}

export default HeaderCarouselEditor
