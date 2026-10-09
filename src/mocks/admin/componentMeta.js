import {
    AlignLeft, BarChart2, Bell, BookOpen, CheckCircle2,
    ClipboardList, FileText, GalleryHorizontal, Image, Info,
    LayoutGrid, Layers, List, ListOrdered, Link, MapPin, Megaphone, Minus,
    Newspaper, Plane, Play, Sparkles, Square, Users,
} from 'lucide-react'

// ── Contenido ─────────── blue
// ── Listas ────────────── violet
// ── Tarjetas y media ──── amber
// ── Datos y formularios ── emerald

export const COMPONENT_META = {
    hero:             { Icon: Sparkles,          bg: 'bg-blue-50',    iconColor: 'text-blue-500',    barColor: '#3b82f6' },
    rich_text:        { Icon: AlignLeft,         bg: 'bg-blue-50',    iconColor: 'text-blue-500',    barColor: '#3b82f6' },
    info_card:        { Icon: Info,              bg: 'bg-blue-50',    iconColor: 'text-blue-500',    barColor: '#3b82f6' },
    image_text:       { Icon: Image,             bg: 'bg-blue-50',    iconColor: 'text-blue-500',    barColor: '#3b82f6' },
    cta:              { Icon: Megaphone,         bg: 'bg-blue-50',    iconColor: 'text-blue-500',    barColor: '#3b82f6' },
    banner:           { Icon: Bell,              bg: 'bg-blue-50',    iconColor: 'text-blue-500',    barColor: '#3b82f6' },
    divider:          { Icon: Minus,             bg: 'bg-blue-50',    iconColor: 'text-blue-500',    barColor: '#3b82f6' },
    placeholder:      { Icon: Square,            bg: 'bg-blue-50',    iconColor: 'text-blue-500',    barColor: '#3b82f6' },

    accordion:        { Icon: List,              bg: 'bg-violet-50',  iconColor: 'text-violet-500',  barColor: '#8b5cf6' },
    content_index:    { Icon: BookOpen,          bg: 'bg-violet-50',  iconColor: 'text-violet-500',  barColor: '#8b5cf6' },
    steps:            { Icon: ListOrdered,       bg: 'bg-violet-50',  iconColor: 'text-violet-500',  barColor: '#8b5cf6' },
    feature_list:     { Icon: CheckCircle2,      bg: 'bg-violet-50',  iconColor: 'text-violet-500',  barColor: '#8b5cf6' },
    tabs_section:     { Icon: Layers,            bg: 'bg-violet-50',  iconColor: 'text-violet-500',  barColor: '#8b5cf6' },

    cards:            { Icon: LayoutGrid,        bg: 'bg-amber-50',   iconColor: 'text-amber-500',   barColor: '#f59e0b' },
    profile_cards:    { Icon: Users,             bg: 'bg-amber-50',   iconColor: 'text-amber-500',   barColor: '#f59e0b' },
    link_cards:       { Icon: Link,              bg: 'bg-amber-50',   iconColor: 'text-amber-500',   barColor: '#f59e0b' },
    carousel:         { Icon: GalleryHorizontal, bg: 'bg-amber-50',   iconColor: 'text-amber-500',   barColor: '#f59e0b' },
    gallery:          { Icon: Image,             bg: 'bg-amber-50',   iconColor: 'text-amber-500',   barColor: '#f59e0b' },
    stats_row:        { Icon: BarChart2,         bg: 'bg-amber-50',   iconColor: 'text-amber-500',   barColor: '#f59e0b' },
    service_stack:    { Icon: Layers,            bg: 'bg-amber-50',   iconColor: 'text-amber-500',   barColor: '#f59e0b' },
    youtube_embed:    { Icon: Play,              bg: 'bg-amber-50',   iconColor: 'text-amber-500',   barColor: '#f59e0b' },
    map_embed:        { Icon: MapPin,            bg: 'bg-amber-50',   iconColor: 'text-amber-500',   barColor: '#f59e0b' },

    latest_news:           { Icon: Newspaper,      bg: 'bg-emerald-50', iconColor: 'text-emerald-500', barColor: '#10b981' },
    collection_links:      { Icon: Link,           bg: 'bg-emerald-50', iconColor: 'text-emerald-500', barColor: '#10b981' },
    form:                  { Icon: ClipboardList,  bg: 'bg-emerald-50', iconColor: 'text-emerald-500', barColor: '#10b981' },
    full_form:             { Icon: FileText,       bg: 'bg-emerald-50', iconColor: 'text-emerald-500', barColor: '#10b981' },
    import_request:        { Icon: Plane,          bg: 'bg-emerald-50', iconColor: 'text-emerald-500', barColor: '#10b981' },
}
