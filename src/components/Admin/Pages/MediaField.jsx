import { useState } from 'react'
import { Images, X } from 'lucide-react'

import ImageUploadField from '@/components/Forms/ImageUploadField'
import { Button } from '@/components/UI/coss/button'
import MediaPicker from '@/components/Admin/Multimedia/MediaPicker'

const MediaField = ({ value, onChange, target = 'cms' }) => {
    const [pickerOpen, setPickerOpen] = useState(false)

    return (
        <div className="space-y-2">
            <ImageUploadField
                target={target}
                value={value ?? ''}
                onChange={onChange}
            />
            <div className="flex gap-2">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setPickerOpen(true)}
                >
                    <Images size={14} />
                    Desde biblioteca
                </Button>
                {value && (
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onChange('')}
                    >
                        <X size={14} />
                        Quitar imagen
                    </Button>
                )}
            </div>
            <MediaPicker
                open={pickerOpen}
                onClose={() => setPickerOpen(false)}
                onSelect={(url) => {
                    onChange(url)
                    setPickerOpen(false)
                }}
            />
        </div>
    )
}

export default MediaField
