import { useState } from 'react'
import { Star } from 'lucide-react'

import { cn } from '@/lib/utils'
import { resolveMediaUrl } from '@/utils/media'

export const FeaturedBadge = ({ className }) => (
    <span className={cn(
        'inline-flex items-center gap-1 rounded-full bg-amber-400 px-2.5 py-0.5 text-xs font-semibold text-amber-950 shadow-sm',
        className,
    )}>
        <Star size={12} className="fill-current" />
        Destacado
    </span>
)

// Imagen principal + miniaturas para elegir cuál se muestra
const ImageGallery = ({ images = [], alt = '', imageClassName, className }) => {
    const [selected, setSelected] = useState(0)
    if (images.length === 0) return null

    const current = images[Math.min(selected, images.length - 1)]

    return (
        <div className={cn('flex w-full flex-col gap-3', className)}>
            <div className="flex justify-center">
                <img src={resolveMediaUrl(current)} alt={alt} className={imageClassName} />
            </div>
            {images.length > 1 && (
                <div className="mx-auto flex w-fit max-w-full gap-2 overflow-x-auto pb-1">
                    {images.map((url, index) => (
                        <button
                            key={url}
                            type="button"
                            onClick={() => setSelected(index)}
                            aria-label={`Ver imagen ${index + 1}`}
                            className={cn(
                                'size-16 shrink-0 overflow-hidden rounded-lg border-2 transition',
                                url === current ? 'border-brand-primary' : 'border-transparent opacity-70 hover:opacity-100',
                            )}
                        >
                            <img src={resolveMediaUrl(url)} alt="" className="size-full object-cover" />
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}

export default ImageGallery
