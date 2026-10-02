import { Tabs, TabsList, TabsTab, TabsPanel } from '@/components/UI/coss/tabs'
import SectionHeading from '@/components/Cms/SectionHeading'

const CmsTabsSection = ({ title, subtitle, tabs = [] }) => {
    if (tabs.length === 0) return null
    return (
        <section className="py-8">
            {title && <SectionHeading subtitle={subtitle}>{title}</SectionHeading>}
            <Tabs defaultValue={tabs[0]?.label}>
                <TabsList>
                    {tabs.map(tab => (
                        <TabsTab key={tab.label} value={tab.label}>{tab.label}</TabsTab>
                    ))}
                </TabsList>
                {tabs.map(tab => (
                    <TabsPanel key={tab.label} value={tab.label}>
                        <div className="mt-4 space-y-3 text-base leading-8 text-gray-700">
                            {String(tab.content ?? '').split('\n').filter(Boolean).map((line, i) => (
                                <p key={i}>{line}</p>
                            ))}
                        </div>
                    </TabsPanel>
                ))}
            </Tabs>
        </section>
    )
}

export default CmsTabsSection
