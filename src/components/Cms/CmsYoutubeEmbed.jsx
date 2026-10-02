import SectionHeading from '@/components/Cms/SectionHeading'

const extractYoutubeId = (url = '') => {
    const embedMatch = url.match(/youtube\.com\/embed\/([^?&]+)/)
    if (embedMatch) return embedMatch[1]
    const watchMatch = url.match(/[?&]v=([^&]+)/)
    if (watchMatch) return watchMatch[1]
    const shortMatch = url.match(/youtu\.be\/([^?&]+)/)
    if (shortMatch) return shortMatch[1]
    if (/^[a-zA-Z0-9_-]{11}$/.test(url)) return url
    return null
}

const CmsYoutubeEmbed = ({ url, title, subtitle }) => {
    const videoId = extractYoutubeId(url)
    if (!videoId) return null

    return (
        <section className="py-8">
            {title && <SectionHeading subtitle={subtitle}>{title}</SectionHeading>}
            <div className="overflow-hidden rounded-xl" style={{ aspectRatio: '16/9' }}>
                <iframe
                    src={`https://www.youtube.com/embed/${videoId}`}
                    title={title || 'YouTube video'}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                    className="h-full w-full border-0"
                />
            </div>
        </section>
    )
}

export default CmsYoutubeEmbed
