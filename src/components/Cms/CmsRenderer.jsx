import { Link } from 'react-router-dom'
import { Pencil } from 'lucide-react'
import useAuth from '@/hooks/useAuth'

import CmsAccordion from './CmsAccordion'
import CmsBanner from './CmsBanner'
import CmsCards from './CmsCards'
import CmsCarousel from './CmsCarousel'
import CmsContentIndex from './CmsContentIndex'
import CmsCta from './CmsCta'
import CmsCollectionLinks from './CmsCollectionLinks'
import CmsInfoItems from './CmsInfoItems'
import CmsDivider from './CmsDivider'
import CmsFeatureList from './CmsFeatureList'
import CmsForm from './CmsForm'
import CmsFullForm from './CmsFullForm'
import CmsImportRequest from './CmsImportRequest'
import CmsGallery from './CmsGallery'
import CmsHero from './CmsHero'
import CmsInfoCard from './CmsInfoCard'
import CmsImageText from './CmsImageText'
import CmsLatestNews from './CmsLatestNews'
import CmsLinkCards from './CmsLinkCards'
import CmsMapEmbed from './CmsMapEmbed'
import CmsPlaceholder from './CmsPlaceholder'
import CmsProfileCards from './CmsProfileCards'
import CmsRichText from './CmsRichText'
import CmsServiceStack from './CmsServiceStack'
import CmsStatsRow from './CmsStatsRow'
import CmsSteps from './CmsSteps'
import CmsTabsSection from './CmsTabsSection'
import CmsYoutubeEmbed from './CmsYoutubeEmbed'

const renderers = {
    accordion:        CmsAccordion,
    banner:           CmsBanner,
    cards:            CmsCards,
    carousel:         CmsCarousel,
    content_index:    CmsContentIndex,
    cta:              CmsCta,
    collection_links:      CmsCollectionLinks,
    info_items:            CmsInfoItems,
    divider:          CmsDivider,
    feature_list:     CmsFeatureList,
    form:             CmsForm,
    full_form:        CmsFullForm,
    import_request:   CmsImportRequest,
    gallery:          CmsGallery,
    hero:             CmsHero,
    info_card:        CmsInfoCard,
    image_text:       CmsImageText,
    latest_news:      CmsLatestNews,
    link_cards:       CmsLinkCards,
    map_embed:        CmsMapEmbed,
    placeholder:      CmsPlaceholder,
    profile_cards:    CmsProfileCards,
    rich_text:        CmsRichText,
    service_stack:    CmsServiceStack,
    stats_row:        CmsStatsRow,
    steps:            CmsSteps,
    tabs_section:     CmsTabsSection,
    youtube_embed:    CmsYoutubeEmbed,
}

const CmsRenderer = ({ components = [], pageSlug }) => {
    const { user } = useAuth()
    const isAdmin = ['admin', 'editor'].includes(user?.role)

    return (
        <div>
            {components.map((component, index) => {
                const Component = renderers[component.type]
                if (!Component) return null

                const bg = index % 2 === 0 ? 'bg-white' : 'bg-gray-50'

                return (
                    <div key={component.id ?? index} className={`cms-band group/band relative ${bg}`}>
                        {isAdmin && (
                            <Link
                                to="/admin"
                                state={{ pageSlug }}
                                className="absolute right-2 top-2 z-10 flex items-center gap-1 rounded-md bg-gray-900/75 px-2 py-1 text-xs font-medium text-white opacity-0 backdrop-blur-sm transition-opacity group-hover/band:opacity-100 hover:bg-gray-900"
                            >
                                <Pencil size={11} />
                                Editar
                            </Link>
                        )}
                        <Component {...(component.props ?? {})} />
                    </div>
                )
            })}
        </div>
    )
}

export default CmsRenderer
