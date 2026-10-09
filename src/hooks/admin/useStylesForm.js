import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

import { toastManager } from '@/components/UI/coss/toast'
import { useSiteSettings } from '@/context/SiteSettingsContext'
import { getSettings, updateSettings } from '@/services/settings_service'

const DEFAULTS = {
    site_name: 'Mi sitio web',
    site_description: '',
    favicon_url: '',
    logo_url: '',
    header_phone: '',
    header_email: '',
    whatsapp_number: '',
    primary_color: '#6366f1',
    secondary_color: '#8b5cf6',
    accent_color: '#06b6d4',
    background_color: '#ffffff',
    text_color: '#1f2937',
    heading_color: '#111827',
    link_color: '#6366f1',
    font_family_heading: 'Inter',
    font_family_body: 'Inter',
    font_size_base: '16px',
    border_radius: '0.5rem',
    footer_address: '',
    footer_map_embed: '',
    footer_copyright: '',
    notification_email: '',
    site_theme: 'classic',
}

const useStylesForm = () => {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving]   = useState(false)
    const { applyAndSet } = useSiteSettings() ?? {}

    const {
        register, handleSubmit, control, reset, setValue, watch,
        formState: { isDirty },
    } = useForm({ defaultValues: DEFAULTS })

    useEffect(() => {
        const load = async () => {
            try {
                const data = await getSettings()
                reset(data)
            } catch {
                toastManager.add({ title: 'Error', description: 'No se pudo cargar la configuración.', type: 'error' })
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [reset])

    const onSubmit = async (data) => {
        setSaving(true)
        try {
            const updated = await updateSettings(data)
            reset(updated)
            applyAndSet?.(updated)
            toastManager.add({ title: 'Guardado', description: 'Configuración guardada correctamente.', type: 'success' })
        } catch (error) {
            const detail = error?.errors?.[0]?.msg?.replace(/^Value error, /, '')
            toastManager.add({ title: 'Error', description: detail || 'No se pudo guardar la configuración.', type: 'error' })
        } finally {
            setSaving(false)
        }
    }

    const applyPreset = (preset) => {
        const opts = { shouldDirty: true }
        setValue('primary_color',    preset.primary,    opts)
        setValue('secondary_color',  preset.secondary,  opts)
        setValue('accent_color',     preset.accent,     opts)
        setValue('background_color', preset.background, opts)
        setValue('text_color',       preset.text,       opts)
        setValue('heading_color',    preset.heading,    opts)
        setValue('link_color',       preset.link,       opts)
    }

    const [
        primaryColor, secondaryColor, accentColor,
        bgColor, textColor, headingColor, linkColor,
        headingFont, bodyFont, borderRadius,
    ] = watch([
        'primary_color', 'secondary_color', 'accent_color',
        'background_color', 'text_color', 'heading_color', 'link_color',
        'font_family_heading', 'font_family_body', 'border_radius',
    ])

    const preview = {
        primaryColor, secondaryColor, accentColor,
        bgColor, textColor, headingColor, linkColor,
        headingFont, bodyFont, borderRadius,
    }

    return {
        loading, saving, isDirty,
        register, handleSubmit, control, reset, watch,
        onSubmit, applyPreset, preview,
    }
}

export default useStylesForm
